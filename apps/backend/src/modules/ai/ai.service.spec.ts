import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { Card } from '../cards/card.entity';
import { AI_PROVIDER, CardDraft } from './providers/ai-provider.interface';
import { CardCodeService } from '../projects/card-code.service';

const drafts: CardDraft[] = [
  { summary: 'Task A', description: 'Desc A', type: 'task', priority: 'high' },
];
const mockProvider = { generateCards: jest.fn().mockResolvedValue(drafts) };
const mockCardRepo: any = {
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((dto: any) => dto),
  save: jest.fn().mockImplementation((entities: any[]) => Promise.resolve(entities)),
};
mockCardRepo.manager = {
  transaction: jest.fn(async (callback: (manager: any) => unknown) =>
    callback({ getRepository: jest.fn().mockReturnValue(mockCardRepo) }),
  ),
};

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: AI_PROVIDER, useValue: mockProvider },
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
        {
          provide: CardCodeService,
          useValue: { addCodes: jest.fn(async (_repo, _projectId, summaries) => summaries) },
        },
      ],
    }).compile();
    service = module.get(AiService);
  });

  it('importSpec delegates to AiProvider', async () => {
    const result = await service.importSpec('some text');
    expect(result).toEqual(drafts);
    expect(mockProvider.generateCards).toHaveBeenCalledWith('some text');
  });

  it('confirmImport creates cards starting at order 0 when stage is empty', async () => {
    const result = await service.confirmImport({
      projectId: 'proj-1',
      stageId: 'stage-1',
      cards: drafts,
    });
    expect(result[0]).toMatchObject({ order: 0, projectId: 'proj-1', stageId: 'stage-1' });
  });
});
