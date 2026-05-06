import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';

const mockProject: Project = { id: 'proj-1', name: 'Alpha', teamId: null, team: null };
const mockRepo = {
  find: jest.fn().mockResolvedValue([mockProject]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  create: jest.fn().mockReturnValue(mockProject),
  save: jest.fn().mockResolvedValue(mockProject),
};
const mockStageRepo = { find: jest.fn().mockResolvedValue([]) };
const mockCardRepo = { find: jest.fn().mockResolvedValue([]) };

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockRepo },
        { provide: getRepositoryToken(Stage), useValue: mockStageRepo },
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
      ],
    }).compile();
    service = module.get(ProjectsService);
  });

  it('findAll returns projects', async () => {
    expect(await service.findAll()).toEqual([mockProject]);
  });

  it('getBoard returns project with stages and cards', async () => {
    const board = await service.getBoard('proj-1');
    expect(board.project).toEqual(mockProject);
    expect(board.stages).toEqual([]);
    expect(board.cards).toEqual([]);
  });
});
