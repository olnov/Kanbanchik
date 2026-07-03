import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JoinService } from './join.service';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';
import { ProjectInvite } from '../projects/project-invite.entity';
import { ProjectShareLink } from '../projects/project-share-link.entity';

const inviteRepo = { findOne: jest.fn(), delete: jest.fn() };
const shareLinkRepo = { findOne: jest.fn() };
const memberRepo = {
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'm1', ...v })),
};
const projectRepo = { findOne: jest.fn() };

describe('JoinService', () => {
  let service: JoinService;

  beforeEach(async () => {
    jest.clearAllMocks();
    inviteRepo.findOne.mockResolvedValue(null);
    shareLinkRepo.findOne.mockResolvedValue(null);
    memberRepo.findOne.mockResolvedValue(null);
    projectRepo.findOne.mockResolvedValue({ id: 'proj-1', name: 'Alpha', createdById: 'owner-1' });

    const module = await Test.createTestingModule({
      providers: [
        JoinService,
        { provide: getRepositoryToken(ProjectInvite), useValue: inviteRepo },
        { provide: getRepositoryToken(ProjectShareLink), useValue: shareLinkRepo },
        { provide: getRepositoryToken(ProjectMember), useValue: memberRepo },
        { provide: getRepositoryToken(Project), useValue: projectRepo },
      ],
    }).compile();
    service = module.get(JoinService);
  });

  it('previews an invite token', async () => {
    inviteRepo.findOne.mockResolvedValue({
      projectId: 'proj-1',
      email: 'p@x.com',
      role: ProjectPermissionLevel.VIEWER,
      token: 't',
    });
    const preview = await service.getPreview('t');
    expect(preview).toEqual({ projectName: 'Alpha', kind: 'invite', invitedEmail: 'p@x.com' });
  });

  it('404s on unknown token', async () => {
    await expect(service.getPreview('nope')).rejects.toThrow(NotFoundException);
  });

  it('404s on a disabled share link preview', async () => {
    shareLinkRepo.findOne.mockResolvedValue({ projectId: 'proj-1', enabled: false, token: 't' });
    await expect(service.getPreview('t')).rejects.toThrow(NotFoundException);
  });

  it('accepts a matching invite, creates membership, and deletes the invite', async () => {
    inviteRepo.findOne.mockResolvedValue({
      id: 'inv-1',
      projectId: 'proj-1',
      email: 'p@x.com',
      role: ProjectPermissionLevel.COLLABORATOR,
      token: 't',
    });
    const result = await service.accept('t', { id: 'user-9', email: 'P@X.com' });
    expect(memberRepo.save).toHaveBeenCalled();
    expect(inviteRepo.delete).toHaveBeenCalledWith({ id: 'inv-1' });
    expect(result).toEqual({ projectId: 'proj-1' });
  });

  it('rejects an invite accepted with a mismatched email', async () => {
    inviteRepo.findOne.mockResolvedValue({
      id: 'inv-1',
      projectId: 'proj-1',
      email: 'p@x.com',
      role: ProjectPermissionLevel.VIEWER,
      token: 't',
    });
    await expect(service.accept('t', { id: 'user-9', email: 'other@x.com' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('is idempotent for an existing member (Flow 1)', async () => {
    inviteRepo.findOne.mockResolvedValue({
      id: 'inv-1',
      projectId: 'proj-1',
      email: 'p@x.com',
      role: ProjectPermissionLevel.VIEWER,
      token: 't',
    });
    memberRepo.findOne.mockResolvedValue({ id: 'm1', userId: 'user-9' });
    const result = await service.accept('t', { id: 'user-9', email: 'p@x.com' });
    expect(memberRepo.save).not.toHaveBeenCalled();
    expect(inviteRepo.delete).toHaveBeenCalledWith({ id: 'inv-1' });
    expect(result).toEqual({ projectId: 'proj-1' });
  });

  it('accepts an enabled share link', async () => {
    shareLinkRepo.findOne.mockResolvedValue({
      projectId: 'proj-1',
      enabled: true,
      role: ProjectPermissionLevel.VIEWER,
      token: 't',
    });
    const result = await service.accept('t', { id: 'user-9', email: 'anyone@x.com' });
    expect(memberRepo.save).toHaveBeenCalled();
    expect(result).toEqual({ projectId: 'proj-1' });
  });

  it('does not create a duplicate membership for the project owner', async () => {
    shareLinkRepo.findOne.mockResolvedValue({
      projectId: 'proj-1',
      enabled: true,
      role: ProjectPermissionLevel.VIEWER,
      token: 't',
    });
    projectRepo.findOne.mockResolvedValue({ id: 'proj-1', name: 'Alpha', createdById: 'user-9' });
    const result = await service.accept('t', { id: 'user-9', email: 'owner@x.com' });
    expect(memberRepo.save).not.toHaveBeenCalled();
    expect(result).toEqual({ projectId: 'proj-1' });
  });
});
