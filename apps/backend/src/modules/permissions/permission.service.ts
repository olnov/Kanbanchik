import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { ProjectTeamPermission, ProjectPermissionLevel } from '../projects/project-team-permission.entity';
import { Team } from '../teams/team.entity';

const LEVEL_ORDER: Record<ProjectPermissionLevel, number> = {
  [ProjectPermissionLevel.VIEWER]: 0,
  [ProjectPermissionLevel.COLLABORATOR]: 1,
  [ProjectPermissionLevel.ADMIN]: 2,
};

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectTeamPermission)
    private readonly permRepo: Repository<ProjectTeamPermission>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
  ) {}

  async getUserProjectPermission(
    userId: string,
    projectId: string,
  ): Promise<ProjectPermissionLevel | null> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) return null;

    if (project.createdById === userId) return ProjectPermissionLevel.ADMIN;

    const userTeams = await this.teamRepo
      .createQueryBuilder('team')
      .innerJoin('team.members', 'member', 'member.id = :userId', { userId })
      .getMany();

    if (userTeams.length === 0) return null;

    const teamIds = userTeams.map((t) => t.id);
    const permissions = await this.permRepo
      .createQueryBuilder('perm')
      .where('perm.projectId = :projectId', { projectId })
      .andWhere('perm.teamId IN (:...teamIds)', { teamIds })
      .getMany();

    if (permissions.length === 0) return null;

    return permissions.reduce<ProjectPermissionLevel>((max, perm) => {
      return LEVEL_ORDER[perm.permission] > LEVEL_ORDER[max] ? perm.permission : max;
    }, ProjectPermissionLevel.VIEWER);
  }

  async getAccessibleProjectIds(userId: string): Promise<string[]> {
    const ownedIds = await this.projectRepo
      .createQueryBuilder('project')
      .where('project.createdById = :userId', { userId })
      .select(['project.id'])
      .getMany();

    const userTeams = await this.teamRepo
      .createQueryBuilder('team')
      .innerJoin('team.members', 'member', 'member.id = :userId', { userId })
      .getMany();

    if (userTeams.length === 0) {
      return ownedIds.map((p) => p.id);
    }

    const teamIds = userTeams.map((t) => t.id);
    const teamPermissions = await this.permRepo
      .createQueryBuilder('perm')
      .where('perm.teamId IN (:...teamIds)', { teamIds })
      .select(['perm.projectId'])
      .getMany();

    const allIds = new Set([
      ...ownedIds.map((p) => p.id),
      ...teamPermissions.map((p) => p.projectId),
    ]);
    return [...allIds];
  }
}
