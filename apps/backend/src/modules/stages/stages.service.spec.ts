import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StagesService } from './stages.service';
import { Stage } from './stage.entity';

const mockStage: Stage = { id: 's-1', name: 'To Do', order: 0, projectId: 'proj-1', project: null as any };
const mockRepo = {
  find: jest.fn().mockResolvedValue([mockStage]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockStage),
  create: jest.fn().mockReturnValue(mockStage),
  save: jest.fn().mockResolvedValue(mockStage),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('StagesService', () => {
  let service: StagesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StagesService,
        { provide: getRepositoryToken(Stage), useValue: mockRepo },
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
});
