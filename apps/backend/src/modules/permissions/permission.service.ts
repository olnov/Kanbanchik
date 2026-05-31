import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly memberRepo: Repository<ProjectMember>,
  ) {}

  async getUserProjectPermission(
    userId: string,
    projectId: string,
  ): Promise<ProjectPermissionLevel | null> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) return null;

    if (project.createdById === userId) return ProjectPermissionLevel.ADMIN;

    const member = await this.memberRepo.findOne({ where: { projectId, userId } });
    return member?.role ?? null;
  }

  async getAccessibleProjectIds(userId: string): Promise<string[]> {
    const ownedIds = await this.projectRepo
      .createQueryBuilder('project')
      .where('project.createdById = :userId', { userId })
      .select(['project.id'])
      .getMany();

    const memberProjects = await this.memberRepo
      .createQueryBuilder('member')
      .where('member.userId = :userId', { userId })
      .select(['member.projectId'])
      .getMany();

    const allIds = new Set([
      ...ownedIds.map((p) => p.id),
      ...memberProjects.map((m) => m.projectId),
    ]);
    return [...allIds];
  }
}
