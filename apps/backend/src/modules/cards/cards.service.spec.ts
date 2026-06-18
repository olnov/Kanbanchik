import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { Card } from './card.entity';
import { PermissionService } from '../permissions/permission.service';
import { ProjectPermissionLevel } from '../projects/project-member.entity';

const makeCard = (id: string, stageId: string, order: number): Card =>
  ({ id, stageId, order, summary: id, type: 'task', priority: 'medium',
     projectId: 'proj-1', description: null, dueDate: null, assigneeId: null,
     project: null as any, stage: null as any, assignee: null,
     createdAt: new Date(), updatedAt: new Date(), deletedAt: null });

describe('CardsService', () => {
  let service: CardsService;
  let mockRepo: any;
  let mockPermissionService: { getUserProjectPermission: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      create: jest.fn().mockImplementation((v) => v),
      save: jest.fn().mockImplementation((v) => Promise.resolve(v)),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockPermissionService = {
      getUserProjectPermission: jest.fn().mockResolvedValue(ProjectPermissionLevel.COLLABORATOR),
    };

    const module = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: mockRepo },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compile();
    service = module.get(CardsService);
  });

  describe('assignee validation', () => {
    it('rejects creating a card assigned to a viewer', async () => {
      mockPermissionService.getUserProjectPermission.mockResolvedValue(ProjectPermissionLevel.VIEWER);
      mockRepo.find.mockResolvedValue([]);
      await expect(
        service.create({
          summary: 'X', type: 'task', priority: 'medium',
          projectId: 'proj-1', stageId: 'stage-1', assigneeId: 'viewer-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('rejects creating a card assigned to a non-member', async () => {
      mockPermissionService.getUserProjectPermission.mockResolvedValue(null);
      await expect(
        service.create({
          summary: 'X', type: 'task', priority: 'medium',
          projectId: 'proj-1', stageId: 'stage-1', assigneeId: 'stranger',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows creating a card assigned to a collaborator', async () => {
      mockPermissionService.getUserProjectPermission.mockResolvedValue(ProjectPermissionLevel.COLLABORATOR);
      mockRepo.find.mockResolvedValue([]);
      await service.create({
        summary: 'X', type: 'task', priority: 'medium',
        projectId: 'proj-1', stageId: 'stage-1', assigneeId: 'collab-1',
      });
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('rejects updating a card to assign a viewer', async () => {
      mockRepo.findOneByOrFail.mockResolvedValue(makeCard('card-1', 'stage-1', 0));
      mockPermissionService.getUserProjectPermission.mockResolvedValue(ProjectPermissionLevel.VIEWER);
      await expect(
        service.update('card-1', { assigneeId: 'viewer-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
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
