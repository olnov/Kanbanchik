import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ProjectMember, ProjectPermissionLevel } from './project-member.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { User } from '../users/user.entity';
import { PermissionService } from '../permissions/permission.service';

const mockProject: Project = {
  id: 'proj-1', name: 'Alpha', createdById: 'user-1', creator: null, members: [], deletedAt: null,
};

const txProjectRepo = {
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  softDelete: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockResolvedValue(mockProject),
};
const txMemberRepo = {
  createQueryBuilder: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  }),
};
const txStageRepo = { create: jest.fn(), save: jest.fn(), softDelete: jest.fn().mockResolvedValue(undefined) };
const txCardRepo = { softDelete: jest.fn().mockResolvedValue(undefined) };

const mockRepo = {
  findBy: jest.fn().mockResolvedValue([mockProject]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  create: jest.fn().mockReturnValue(mockProject),
  save: jest.fn().mockResolvedValue(mockProject),
  manager: {
    transaction: jest.fn(async (cb: (m: { getRepository: (e: unknown) => unknown }) => unknown) =>
      cb({
        getRepository: (e: unknown) => {
          if (e === Project) return txProjectRepo;
          if (e === ProjectMember) return txMemberRepo;
          if (e === Stage) return txStageRepo;
          if (e === Card) return txCardRepo;
          throw new Error(`Unexpected ${String(e)}`);
        },
      }),
    ),
  },
};

const mockPermissionService = {
  getAccessibleProjectIds: jest.fn().mockResolvedValue(['proj-1']),
  getUserProjectPermission: jest.fn().mockResolvedValue(ProjectPermissionLevel.ADMIN),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    txProjectRepo.findOneByOrFail.mockResolvedValue(mockProject);
    mockPermissionService.getAccessibleProjectIds.mockResolvedValue(['proj-1']);
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockRepo },
        { provide: getRepositoryToken(Stage), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Card), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(ProjectMember), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(User), useValue: { findOneBy: jest.fn() } },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compile();
    service = module.get(ProjectsService);
  });

  it('findAll returns projects accessible to the user', async () => {
    const result = await service.findAll('user-1');
    expect(mockPermissionService.getAccessibleProjectIds).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([mockProject]);
  });

  it('findAll returns empty array when user has no accessible projects', async () => {
    mockPermissionService.getAccessibleProjectIds.mockResolvedValue([]);
    expect(await service.findAll('user-1')).toEqual([]);
  });

  it('creates project with createdById and default stages', async () => {
    await service.create({ name: 'Alpha' }, 'user-1');
    expect(mockRepo.manager.transaction).toHaveBeenCalled();
    expect(txProjectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alpha', createdById: 'user-1' }),
    );
  });

  it('soft deletes project with stages, cards, and members', async () => {
    await service.remove('proj-1');
    expect(txProjectRepo.findOneByOrFail).toHaveBeenCalledWith({ id: 'proj-1' });
    expect(txCardRepo.softDelete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txStageRepo.softDelete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txProjectRepo.softDelete).toHaveBeenCalledWith('proj-1');
  });
});
