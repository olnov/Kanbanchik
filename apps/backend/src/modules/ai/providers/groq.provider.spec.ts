import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { GroqAiProvider } from './groq.provider';

const originalFetch = global.fetch;

describe('GroqAiProvider', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('extracts explicit markdown task sections one-to-one before calling Groq', async () => {
    global.fetch = jest.fn() as typeof fetch;

    const provider = new GroqAiProvider(undefined);
    const result = await provider.generateCards(`
## Task: Implement User Authentication
**Priority:** High

**Description:**
Type: Backend

Implement user registration and JWT login.

---

## Task: Implement Main Dashboard
**Priority:** Medium

**Description:**
Type: Frontend / Mobile

Develop the dashboard screen with insights and recommendations.
`);

    expect(result).toEqual([
      {
        summary: 'Implement User Authentication',
        description: 'Type: Backend\nImplement user registration and JWT login.',
        type: 'task',
        priority: 'high',
      },
      {
        summary: 'Implement Main Dashboard',
        description: 'Type: Frontend / Mobile\nDevelop the dashboard screen with insights and recommendations.',
        type: 'story',
        priority: 'medium',
      },
    ]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('throws when GROQ_API_KEY is missing', async () => {
    const provider = new GroqAiProvider(undefined);

    await expect(provider.generateCards('Project spec text')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('returns parsed card drafts from Groq structured output', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                cards: [
                  {
                    summary: 'Build auth flow',
                    description: 'Implement sign in and session handling.',
                    type: 'story',
                    priority: 'high',
                  },
                ],
              }),
            },
          },
        ],
      }),
    }) as typeof fetch;

    const provider = new GroqAiProvider('test-key');
    const result = await provider.generateCards('Project spec text');

    expect(result).toEqual([
      {
        summary: 'Build auth flow',
        description: 'Implement sign in and session handling.',
        type: 'story',
        priority: 'high',
      },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('Do not arbitrarily compress distinct work items'),
      }),
    );
  });

  it('throws upstream message when Groq request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: {
          message: 'Invalid API key',
        },
      }),
    }) as typeof fetch;

    const provider = new GroqAiProvider('bad-key');

    await expect(provider.generateCards('Project spec text')).rejects.toThrow(
      BadGatewayException,
    );
  });
});
