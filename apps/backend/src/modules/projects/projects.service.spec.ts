import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ProjectPermissionLevel, ProjectTeamPermission } from './project-team-permission.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { Team } from '../teams/team.entity';

const mockTeam: Team = {
  id: 'team-1',
  name: 'Core Team',
  members: [],
  ownedProjects: [],
  projectPermissions: [],
};

const mockProject: Project = {
  id: 'proj-1',
  name: 'Alpha',
  teamId: 'team-1',
  team: mockTeam,
  teamPermissions: [],
  deletedAt: null,
};

const txProjectRepo = {
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  softDelete: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockImplementation((value) => value),
  save: jest.fn().mockResolvedValue(mockProject),
};

const txPermissionRepo = {
  create: jest.fn().mockImplementation((value) => value),
  save: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};

const txStageRepo = {
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn().mockResolvedValue(undefined),
};

const txCardRepo = {
  softDelete: jest.fn().mockResolvedValue(undefined),
};

const txTeamRepo = {
  findBy: jest.fn().mockResolvedValue([mockTeam]),
};

const mockRepo = {
  find: jest.fn().mockResolvedValue([mockProject]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  create: jest.fn().mockReturnValue(mockProject),
  save: jest.fn().mockResolvedValue(mockProject),
  manager: {
    transaction: jest.fn(async (callback: (manager: {
      getRepository: (
        entity: typeof Project | typeof ProjectTeamPermission | typeof Stage | typeof Card | typeof Team
      ) => unknown;
    }) => unknown) => callback({
      getRepository: (entity) => {
        if (entity === Project) return txProjectRepo;
        if (entity === ProjectTeamPermission) return txPermissionRepo;
        if (entity === Stage) return txStageRepo;
        if (entity === Card) return txCardRepo;
        if (entity === Team) return txTeamRepo;
        throw new Error(`Unexpected repository request for ${entity.name}`);
      },
    })),
  },
};

const mockStageRepo = { find: jest.fn().mockResolvedValue([]) };
const mockCardRepo = { find: jest.fn().mockResolvedValue([]) };

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo.find.mockResolvedValue([mockProject]);
    mockRepo.findOneByOrFail.mockResolvedValue(mockProject);
    mockStageRepo.find.mockResolvedValue([]);
    mockCardRepo.find.mockResolvedValue([]);
    txProjectRepo.findOneByOrFail.mockResolvedValue(mockProject);
    txTeamRepo.findBy.mockResolvedValue([mockTeam]);
  });

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

  it('creates project permissions for the owner team', async () => {
    await service.create({ name: ' Alpha ', teamId: 'team-1' });

    expect(mockRepo.manager.transaction).toHaveBeenCalled();
    expect(txPermissionRepo.create).toHaveBeenCalledWith({
      projectId: 'proj-1',
      teamId: 'team-1',
      permission: ProjectPermissionLevel.ADMIN,
    });
  });

  it('replaces team permissions for a project', async () => {
    await service.setTeamPermissions('proj-1', {
      teamPermissions: [{ teamId: 'team-1', permission: ProjectPermissionLevel.VIEWER }],
    });

    expect(txPermissionRepo.delete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txPermissionRepo.create).toHaveBeenCalledWith({
      projectId: 'proj-1',
      teamId: 'team-1',
      permission: ProjectPermissionLevel.ADMIN,
    });
  });

  it('soft deletes project with its stages, cards, and access records', async () => {
    await service.remove('proj-1');

    expect(mockRepo.manager.transaction).toHaveBeenCalled();
    expect(txProjectRepo.findOneByOrFail).toHaveBeenCalledWith({ id: 'proj-1' });
    expect(txPermissionRepo.delete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txCardRepo.softDelete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txStageRepo.softDelete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txProjectRepo.softDelete).toHaveBeenCalledWith('proj-1');
  });
});
