import { Injectable } from '@nestjs/common';
import { AiProvider, CardDraft } from './ai-provider.interface';

@Injectable()
export class MockAiProvider implements AiProvider {
  async generateCards(_input: string): Promise<CardDraft[]> {
    return [
      {
        summary: 'Set up project repository',
        description: 'Initialize the git repository, configure CI/CD, and set up branch protection rules.',
        type: 'task',
        priority: 'high',
      },
      {
        summary: 'Design database schema',
        description: 'Define all entities, relationships, and constraints. Create the initial migration.',
        type: 'task',
        priority: 'high',
      },
      {
        summary: 'Implement core API endpoints',
        description: 'Build CRUD endpoints for the primary resources identified in the spec.',
        type: 'story',
        priority: 'medium',
      },
    ];
  }
}
