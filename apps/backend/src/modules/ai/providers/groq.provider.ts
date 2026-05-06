import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiProvider, CardDraft } from './ai-provider.interface';

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface GroqCardDraftEnvelope {
  cards: CardDraft[];
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const CARD_TYPE_VALUES = ['task', 'story', 'bug'] as const;
const PRIORITY_VALUES = ['low', 'medium', 'high'] as const;
const TASK_HEADING_REGEX = /^#{2,6}\s*Task:\s*(.+)$/gim;

@Injectable()
export class GroqAiProvider implements AiProvider {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly model = DEFAULT_GROQ_MODEL,
    private readonly endpoint = GROQ_ENDPOINT,
  ) {}

  async generateCards(input: string): Promise<CardDraft[]> {
    const extractedTasks = extractStructuredTaskBacklog(input);
    if (extractedTasks.length > 0) {
      return extractedTasks;
    }

    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'Groq AI provider is not configured. Set GROQ_API_KEY before using AI import.',
      );
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        max_completion_tokens: 3200,
        messages: [
          {
            role: 'system',
            content: [
              'You convert project specifications into actionable kanban cards.',
              'Extract a complete implementation backlog from the input.',
              'Do not arbitrarily compress distinct work items just to reduce card count.',
              'If the input contains explicit backlog items, task sections, or checklist entries, preserve them as separate cards and do not merge them.',
              'When the input does not contain an explicit backlog, derive a practical MVP backlog that is complete enough to execute, usually 8 to 20 cards depending on scope.',
              'Use task for concrete engineering work, story for user-facing slices, and bug for defects.',
              'Use high priority for foundational or blocking work, medium for important follow-up work, and low for polish.',
              'If the text is too vague, return exactly one clarification card asking for missing requirements.',
              'Return only data matching the provided JSON schema.',
            ].join(' '),
          },
          {
            role: 'user',
            content: input,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'project_spec_cards',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['cards'],
              properties: {
                cards: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['summary', 'description', 'type', 'priority'],
                    properties: {
                      summary: { type: 'string' },
                      description: { type: 'string' },
                      type: { type: 'string', enum: [...CARD_TYPE_VALUES] },
                      priority: { type: 'string', enum: [...PRIORITY_VALUES] },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    const payload = await response.json() as GroqChatCompletionResponse;

    if (!response.ok) {
      throw new BadGatewayException(
        payload.error?.message ?? `Groq API request failed with status ${response.status}`,
      );
    }

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new BadGatewayException('Groq API returned an empty response');
    }

    let parsed: GroqCardDraftEnvelope;
    try {
      parsed = JSON.parse(content) as GroqCardDraftEnvelope;
    } catch {
      throw new BadGatewayException('Groq API returned invalid JSON');
    }

    if (!Array.isArray(parsed.cards)) {
      throw new BadGatewayException('Groq API response is missing cards[]');
    }

    return parsed.cards.map((card) => ({
      summary: card.summary.trim(),
      description: card.description.trim(),
      type: card.type,
      priority: card.priority,
    }));
  }
}

function extractStructuredTaskBacklog(input: string): CardDraft[] {
  const matches = Array.from(input.matchAll(TASK_HEADING_REGEX));

  if (matches.length === 0) {
    return [];
  }

  return matches.map((match, index) => {
    const title = normalizeWhitespace(match[1] ?? '');
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = index + 1 < matches.length ? (matches[index + 1].index ?? input.length) : input.length;
    const body = input.slice(bodyStart, bodyEnd);
    const description = extractTaskDescription(body);
    const explicitType = extractTaskType(body);

    return {
      summary: title,
      description,
      type: classifyCardType(title, description, explicitType),
      priority: extractTaskPriority(body),
    };
  }).filter((card) => card.summary.length > 0);
}

function extractTaskPriority(body: string): CardDraft['priority'] {
  const match = body.match(/\*\*Priority:\*\*\s*(high|medium|low)/i);
  const priority = match?.[1]?.toLowerCase();

  if (priority === 'high' || priority === 'medium' || priority === 'low') {
    return priority;
  }

  return 'medium';
}

function extractTaskType(body: string): string {
  const match = body.match(/(?:^|\n)\s*Type:\s*(.+)$/im);
  return normalizeWhitespace(match?.[1] ?? '');
}

function extractTaskDescription(body: string): string {
  const descriptionStart = body.search(/\*\*Description:\*\*/i);
  const source = descriptionStart >= 0
    ? body.slice(descriptionStart).replace(/\*\*Description:\*\*/i, '')
    : body;

  const lines = source
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== '---')
    .map((line) => line.replace(/^-\s+/, ''))
    .filter((line) => !/^\*\*Priority:\*\*/i.test(line));

  return normalizeWhitespace(lines.join('\n'));
}

function classifyCardType(title: string, description: string, explicitType: string): CardDraft['type'] {
  const haystack = `${title} ${description} ${explicitType}`.toLowerCase();

  if (/\b(bug|defect|fix|error|issue)\b/.test(haystack)) {
    return 'bug';
  }

  if (
    /\b(ui|ux|widget|mobile|frontend|screen|dashboard|onboarding|product|design|notification|appliance management)\b/.test(haystack)
  ) {
    return 'story';
  }

  return 'task';
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
