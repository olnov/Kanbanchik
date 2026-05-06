import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { Card } from './card.entity';

const makeCard = (id: string, stageId: string, order: number): Card =>
  ({ id, stageId, order, summary: id, type: 'task', priority: 'medium',
     projectId: 'proj-1', description: null, dueDate: null, assigneeId: null,
     project: null as any, stage: null as any, assignee: null,
     createdAt: new Date(), updatedAt: new Date(), deletedAt: null });

describe('CardsService', () => {
  let service: CardsService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(CardsService);
  });

  describe('move', () => {
    it('reassigns order values with 100-gap increments', async () => {
      const cards = [
        makeCard('card-a', 'stage-1', 0),
        makeCard('card-b', 'stage-1', 100),
        makeCard('card-c', 'stage-1', 200),
      ];
      const movingCard = makeCard('card-b', 'stage-1', 100);

      mockRepo.findOneByOrFail.mockResolvedValue(movingCard);
      // cards in target stage (excluding moving card)
      mockRepo.find.mockResolvedValue(cards.filter(c => c.id !== 'card-b'));
      mockRepo.save.mockImplementation((entities: any[]) =>
        Promise.resolve(entities),
      );
      mockRepo.findOneByOrFail.mockResolvedValueOnce(movingCard);

      await service.move('card-b', { stageId: 'stage-1', order: 0 });

      const saved = mockRepo.save.mock.calls[0][0] as Array<{ id: string; order: number }>;
      // card-b inserted at position 0, so order: card-b=0, card-a=100, card-c=200
      const cardBEntry = saved.find((e: any) => e.id === 'card-b');
      expect(cardBEntry?.order).toBe(0);
    });
  });
});
