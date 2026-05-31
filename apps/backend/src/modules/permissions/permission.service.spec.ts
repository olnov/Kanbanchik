import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { Project } from '../projects/project.entity';
import { ProjectTeamPermission, ProjectPermissionLevel } from '../projects/project-team-permission.entity';
import { Team } from '../teams/team.entity';

const mockRepo = () => ({ findOne: jest.fn(), createQueryBuilder: jest.fn() });

describe('PermissionService', () => {
  let service: PermissionService;
  let projectRepo: { findOne: jest.Mock };
  let permRepo: { createQueryBuilder: jest.Mock };
  let teamRepo: { createQueryBuilder: jest.Mock };

  const userId = 'user-1';
  const projectId = 'proj-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: getRepositoryToken(Project), useFactory: mockRepo },
        { provide: getRepositoryToken(ProjectTeamPermission), useFactory: mockRepo },
        { provide: getRepositoryToken(Team), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(PermissionService);
    projectRepo = module.get(getRepositoryToken(Project));
    permRepo = module.get(getRepositoryToken(ProjectTeamPermission));
    teamRepo = module.get(getRepositoryToken(Team));
  });

  function mockProject(createdById: string | null = null) {
    projectRepo.findOne.mockResolvedValue({ id: projectId, createdById });
  }

  function mockUserTeams(teams: Array<{ id: string }>) {
    const qb = { innerJoin: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue(teams) };
    teamRepo.createQueryBuilder.mockReturnValue(qb);
  }

  function mockTeamPermissions(perms: Array<{ permission: ProjectPermissionLevel }>) {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(perms),
    };
    permRepo.createQueryBuilder.mockReturnValue(qb);
  }

  it('returns ADMIN when user is the project creator', async () => {
    mockProject(userId);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBe(ProjectPermissionLevel.ADMIN);
  });

  it('returns null when project does not exist', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBeNull();
  });

  it('returns null when user is not creator and belongs to no teams', async () => {
    mockProject(null);
    mockUserTeams([]);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBeNull();
  });

  it('returns the team permission when user is in a team with access', async () => {
    mockProject(null);
    mockUserTeams([{ id: 'team-1' }]);
    mockTeamPermissions([{ permission: ProjectPermissionLevel.COLLABORATOR }]);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBe(ProjectPermissionLevel.COLLABORATOR);
  });

  it('returns highest permission when user belongs to multiple teams with different access', async () => {
    mockProject(null);
    mockUserTeams([{ id: 'team-1' }, { id: 'team-2' }]);
    mockTeamPermissions([
      { permission: ProjectPermissionLevel.VIEWER },
      { permission: ProjectPermissionLevel.ADMIN },
    ]);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBe(ProjectPermissionLevel.ADMIN);
  });

  it('returns null when user teams have no permission on the project', async () => {
    mockProject(null);
    mockUserTeams([{ id: 'team-1' }]);
    mockTeamPermissions([]);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBeNull();
  });
});
