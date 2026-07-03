import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';
import { ProjectInvite } from '../projects/project-invite.entity';
import { ProjectShareLink } from '../projects/project-share-link.entity';

interface JoinPreview {
  projectName: string;
  kind: 'invite' | 'link';
  invitedEmail?: string;
}

@Injectable()
export class JoinService {
  constructor(
    @InjectRepository(ProjectInvite) private readonly inviteRepo: Repository<ProjectInvite>,
    @InjectRepository(ProjectShareLink)
    private readonly shareLinkRepo: Repository<ProjectShareLink>,
    @InjectRepository(ProjectMember) private readonly memberRepo: Repository<ProjectMember>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
  ) {}

  async getPreview(token: string): Promise<JoinPreview> {
    const invite = await this.inviteRepo.findOne({ where: { token } });
    if (invite) {
      const project = await this.projectRepo.findOne({ where: { id: invite.projectId } });
      if (!project) throw new NotFoundException('This link is no longer valid');
      return { projectName: project.name, kind: 'invite', invitedEmail: invite.email };
    }

    const link = await this.shareLinkRepo.findOne({ where: { token } });
    if (link && link.enabled) {
      const project = await this.projectRepo.findOne({ where: { id: link.projectId } });
      if (!project) throw new NotFoundException('This link is no longer valid');
      return { projectName: project.name, kind: 'link' };
    }

    throw new NotFoundException('This link is no longer valid');
  }

  async accept(token: string, user: { id: string; email: string }): Promise<{ projectId: string }> {
    const invite = await this.inviteRepo.findOne({ where: { token } });
    if (invite) {
      if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
        throw new ForbiddenException(
          `This invite is for ${invite.email}. Sign in with that email to accept it.`,
        );
      }
      await this.ensureMember(invite.projectId, user.id, invite.role);
      await this.inviteRepo.delete({ id: invite.id });
      return { projectId: invite.projectId };
    }

    const link = await this.shareLinkRepo.findOne({ where: { token } });
    if (link && link.enabled) {
      await this.ensureMember(link.projectId, user.id, link.role);
      return { projectId: link.projectId };
    }

    throw new NotFoundException('This link is no longer valid');
  }

  /** Idempotent: no-op if the user already owns or is a member of the project. */
  private async ensureMember(
    projectId: string,
    userId: string,
    role: ProjectPermissionLevel,
  ): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (project?.createdById === userId) return;

    const existing = await this.memberRepo.findOne({ where: { projectId, userId } });
    if (existing) return;

    await this.memberRepo.save(this.memberRepo.create({ projectId, userId, role }));
  }
}
