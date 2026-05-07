import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StagesService } from './stages.service';
import { Stage } from './stage.entity';
import { Card } from '../cards/card.entity';

const mockStage: Stage = {
  id: 's-1',
  name: 'To Do',
  order: 0,
  projectId: 'proj-1',
  project: null as any,
  deletedAt: null,
};
const stageTransactionSave = jest.fn().mockResolvedValue(undefined);
const mockRepo = {
  find: jest.fn().mockResolvedValue([mockStage]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockStage),
  create: jest.fn().mockReturnValue(mockStage),
  save: jest.fn().mockResolvedValue(mockStage),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  manager: {
    transaction: jest.fn(async (callback: (manager: {
      getRepository: (entity: typeof Stage) => { save: typeof stageTransactionSave };
    }) => unknown) => callback({
      getRepository: () => ({
        save: stageTransactionSave,
      }),
    })),
  },
};
const mockCardRepo = {
  count: jest.fn().mockResolvedValue(0),
};

describe('StagesService', () => {
  let service: StagesService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo.find.mockResolvedValue([mockStage]);
    mockRepo.findOneByOrFail.mockResolvedValue(mockStage);
    mockRepo.create.mockReturnValue(mockStage);
    mockRepo.save.mockResolvedValue(mockStage);
    mockRepo.update.mockResolvedValue({ affected: 1 });
    mockRepo.softDelete.mockResolvedValue({ affected: 1 });
    stageTransactionSave.mockResolvedValue(undefined);
    mockRepo.manager.transaction.mockImplementation(async (callback: (manager: {
      getRepository: (entity: typeof Stage) => { save: typeof stageTransactionSave };
    }) => unknown) => callback({
      getRepository: () => ({
        save: stageTransactionSave,
      }),
    }));
    mockCardRepo.count.mockResolvedValue(0);
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StagesService,
        { provide: getRepositoryToken(Stage), useValue: mockRepo },
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
      ],
    }).compile();
    service = module.get(StagesService);
  });

  it('findByProject returns stages for project', async () => {
    const result = await service.findByProject('proj-1');
    expect(result).toEqual([mockStage]);
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { projectId: 'proj-1' },
      order: { order: 'ASC' },
    });
  });

  it('soft deletes an empty stage', async () => {
    await service.remove('s-1');

    expect(mockCardRepo.count).toHaveBeenCalledWith({ where: { stageId: 's-1' } });
    expect(mockRepo.softDelete).toHaveBeenCalledWith('s-1');
  });

  it('rejects deleting a stage that still has cards', async () => {
    mockCardRepo.count.mockResolvedValueOnce(2);

    await expect(service.remove('s-1')).rejects.toThrow(
      'Cannot delete a list that still contains cards',
    );
    expect(mockRepo.softDelete).not.toHaveBeenCalled();
  });

  it('reorders stages for a project in one transaction', async () => {
    const orderedStages: Stage[] = [
      mockStage,
      { ...mockStage, id: 's-2', name: 'Review', order: 100 },
      { ...mockStage, id: 's-3', name: 'Done', order: 200 },
    ];
    mockRepo.find.mockResolvedValueOnce(orderedStages).mockResolvedValueOnce([
      orderedStages[2],
      orderedStages[0],
      orderedStages[1],
    ]);

    const result = await service.reorder('proj-1', {
      stageIds: ['s-3', 's-1', 's-2'],
    });

    expect(mockRepo.manager.transaction).toHaveBeenCalled();
    expect(stageTransactionSave).toHaveBeenCalledWith([
      { id: 's-3', order: 0 },
      { id: 's-1', order: 100 },
      { id: 's-2', order: 200 },
    ]);
    expect(result.map((stage) => stage.id)).toEqual(['s-3', 's-1', 's-2']);
  });
});
