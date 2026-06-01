import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';

const mockRepo = () => ({ findOne: jest.fn(), createQueryBuilder: jest.fn() });

describe('PermissionService', () => {
  let service: PermissionService;
  let projectRepo: { findOne: jest.Mock; createQueryBuilder: jest.Mock };
  let memberRepo: { findOne: jest.Mock; createQueryBuilder: jest.Mock };

  const userId = 'user-1';
  const projectId = 'proj-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: getRepositoryToken(Project), useFactory: mockRepo },
        { provide: getRepositoryToken(ProjectMember), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(PermissionService);
    projectRepo = module.get(getRepositoryToken(Project));
    memberRepo = module.get(getRepositoryToken(ProjectMember));
  });

  it('returns ADMIN when user is the project creator', async () => {
    projectRepo.findOne.mockResolvedValue({ id: projectId, createdById: userId });
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBe(ProjectPermissionLevel.ADMIN);
  });

  it('returns null when project does not exist', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBeNull();
  });

  it('returns null when user has no ProjectMember row', async () => {
    projectRepo.findOne.mockResolvedValue({ id: projectId, createdById: 'other' });
    memberRepo.findOne.mockResolvedValue(null);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBeNull();
  });

  it('returns the member role when a ProjectMember row exists', async () => {
    projectRepo.findOne.mockResolvedValue({ id: projectId, createdById: 'other' });
    memberRepo.findOne.mockResolvedValue({ role: ProjectPermissionLevel.COLLABORATOR });
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBe(ProjectPermissionLevel.COLLABORATOR);
  });

  it('getAccessibleProjectIds returns owned + member project ids', async () => {
    const ownedQb = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'proj-1' }]),
    };
    const memberQb = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ projectId: 'proj-2' }]),
    };
    projectRepo.createQueryBuilder = jest.fn().mockReturnValue(ownedQb);
    memberRepo.createQueryBuilder = jest.fn().mockReturnValue(memberQb);

    const result = await service.getAccessibleProjectIds(userId);
    expect(result).toEqual(expect.arrayContaining(['proj-1', 'proj-2']));
  });
});
