export interface CardDraft {
  summary: string;
  description: string;
  type: string;
  priority: string;
}

export interface AiProvider {
  generateCards(input: string): Promise<CardDraft[]>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
