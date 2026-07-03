import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ProjectMember, ProjectPermissionLevel } from './project-member.entity';
import { ProjectShareLink } from './project-share-link.entity';
import { ProjectInvite } from './project-invite.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { User } from '../users/user.entity';
import { PermissionService } from '../permissions/permission.service';

const mockProject: Project = {
  id: 'proj-1',
  name: 'Alpha',
  createdById: 'user-1',
  creator: null,
  members: [],
  deletedAt: null,
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
const txStageRepo = {
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn().mockResolvedValue(undefined),
};
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

const mockMemberRepoForInvite = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'member-1', ...v })),
  delete: jest.fn().mockResolvedValue(undefined),
};
const mockUserRepo = { findOneBy: jest.fn().mockResolvedValue(null) };
const mockInviteRepo = {
  findOne: jest.fn().mockResolvedValue(null),
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'invite-1', ...v })),
  delete: jest.fn().mockResolvedValue(undefined),
};
const mockShareLinkRepo = {
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'link-1', ...v })),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    txProjectRepo.findOneByOrFail.mockResolvedValue(mockProject);
    mockPermissionService.getAccessibleProjectIds.mockResolvedValue(['proj-1']);
    mockInviteRepo.findOne.mockResolvedValue(null);
    mockInviteRepo.find.mockResolvedValue([]);
    mockShareLinkRepo.findOne.mockResolvedValue(null);
    mockMemberRepoForInvite.find.mockResolvedValue([]);
    mockMemberRepoForInvite.findOne.mockResolvedValue(null);
    mockUserRepo.findOneBy.mockResolvedValue(null);
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockRepo },
        { provide: getRepositoryToken(Stage), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Card), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(ProjectMember), useValue: mockMemberRepoForInvite },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(ProjectShareLink), useValue: mockShareLinkRepo },
        { provide: getRepositoryToken(ProjectInvite), useValue: mockInviteRepo },
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

  it('getAssignableUsers returns owner plus members without duplicates', async () => {
    const owner = { id: 'user-1', name: 'Owner' } as User;
    const memberUser = { id: 'user-2', name: 'Member' } as User;

    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: { ...mockRepo, findOneByOrFail: jest.fn().mockResolvedValue(mockProject) },
        },
        { provide: getRepositoryToken(Stage), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Card), useValue: { find: jest.fn().mockResolvedValue([]) } },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: { find: jest.fn().mockResolvedValue([{ user: memberUser }]) },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOneBy: jest.fn().mockResolvedValue(owner) },
        },
        { provide: getRepositoryToken(ProjectShareLink), useValue: mockShareLinkRepo },
        { provide: getRepositoryToken(ProjectInvite), useValue: mockInviteRepo },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compile();
    const svc = module.get(ProjectsService);

    const result = await svc.getAssignableUsers('proj-1');
    expect(result).toEqual(expect.arrayContaining([owner, memberUser]));
    expect(result).toHaveLength(2);
  });

  describe('createInvite', () => {
    it('lowercases the email and stores a token', async () => {
      mockRepo.findOneByOrFail.mockResolvedValue(mockProject);
      const invite = await service.createInvite(
        'proj-1',
        {
          email: 'Person@Example.com',
          role: ProjectPermissionLevel.COLLABORATOR,
        },
        'user-1',
      );
      expect(mockInviteRepo.save).toHaveBeenCalled();
      const saved = mockInviteRepo.create.mock.calls[0][0];
      expect(saved.email).toBe('person@example.com');
      expect(saved.token).toEqual(expect.any(String));
      expect(saved.role).toBe(ProjectPermissionLevel.COLLABORATOR);
      expect(saved.invitedById).toBe('user-1');
      expect(invite.id).toBe('invite-1');
    });

    it('rejects an email that already has an invite', async () => {
      mockInviteRepo.findOne.mockResolvedValue({ id: 'invite-x' });
      await expect(
        service.createInvite('proj-1', { email: 'dup@example.com' }, 'user-1'),
      ).rejects.toThrow('already been invited');
    });

    it('rejects an email that already belongs to a member', async () => {
      mockUserRepo.findOneBy.mockResolvedValue({ id: 'user-9', email: 'member@example.com' });
      mockMemberRepoForInvite.findOne.mockResolvedValue({ id: 'm1', userId: 'user-9' });
      await expect(
        service.createInvite('proj-1', { email: 'member@example.com' }, 'user-1'),
      ).rejects.toThrow('already a member');
    });
  });
});
