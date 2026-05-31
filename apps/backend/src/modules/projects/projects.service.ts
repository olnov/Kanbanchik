import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from './project.entity';
import { ProjectPermissionLevel, ProjectTeamPermission } from './project-team-permission.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { Team } from '../teams/team.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectTeamPermissionDto } from './dto/project-team-permission.dto';
import { SetProjectTeamPermissionsDto } from './dto/set-project-team-permissions.dto';
import { DEFAULT_PROJECT_STAGES } from '../../database/project-defaults';
import { PermissionService } from '../permissions/permission.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    const accessibleIds = await this.permissionService.getAccessibleProjectIds(userId);
    if (accessibleIds.length === 0) return [];
    return this.projectRepo.findBy({ id: In(accessibleIds) });
  }

  findOne(id: string): Promise<Project> {
    return this.projectRepo.findOneByOrFail({ id });
  }

  async create(dto: CreateProjectDto, createdById: string): Promise<Project> {
    return this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const teamRepo = manager.getRepository(Team);
      const permissionRepo = manager.getRepository(ProjectTeamPermission);
      const stageRepo = manager.getRepository(Stage);

      const project = await projectRepo.save(projectRepo.create({
        name: dto.name.trim(),
        teamId: dto.teamId ?? null,
        createdById,
      }));

      const normalizedPermissions = await this.normalizeTeamPermissions(
        teamRepo,
        dto.teamId ?? null,
        dto.teamPermissions ?? [],
      );

      if (normalizedPermissions.length > 0) {
        await permissionRepo.save(
          normalizedPermissions.map((permission) =>
            permissionRepo.create({ projectId: project.id, ...permission })),
        );
      }

      await stageRepo.save(
        DEFAULT_PROJECT_STAGES.map((stage) =>
          stageRepo.create({ ...stage, projectId: project.id })),
      );

      return projectRepo.findOneByOrFail({ id: project.id });
    });
  }

  async setTeamPermissions(projectId: string, dto: SetProjectTeamPermissionsDto): Promise<Project> {
    return this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const teamRepo = manager.getRepository(Team);
      const permissionRepo = manager.getRepository(ProjectTeamPermission);

      const project = await projectRepo.findOneByOrFail({ id: projectId });
      const normalizedPermissions = await this.normalizeTeamPermissions(
        teamRepo,
        project.teamId,
        dto.teamPermissions ?? [],
      );

      await permissionRepo.delete({ projectId });

      if (normalizedPermissions.length > 0) {
        await permissionRepo.save(
          normalizedPermissions.map((permission) =>
            permissionRepo.create({ projectId, ...permission })),
        );
      }

      return projectRepo.findOneByOrFail({ id: projectId });
    });
  }

  async remove(id: string): Promise<void> {
    await this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const permissionRepo = manager.getRepository(ProjectTeamPermission);
      const stageRepo = manager.getRepository(Stage);
      const cardRepo = manager.getRepository(Card);

      await projectRepo.findOneByOrFail({ id });
      await permissionRepo.delete({ projectId: id });
      await cardRepo.softDelete({ projectId: id });
      await stageRepo.softDelete({ projectId: id });
      await projectRepo.softDelete(id);
    });
  }

  async getBoard(projectId: string, userId: string) {
    const [project, stages, cards, myPermission] = await Promise.all([
      this.projectRepo.findOneByOrFail({ id: projectId }),
      this.stageRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.cardRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.permissionService.getUserProjectPermission(userId, projectId),
    ]);
    return { project, stages, cards, myPermission };
  }

  private async normalizeTeamPermissions(
    teamRepo: Repository<Team>,
    ownerTeamId: string | null,
    requestedPermissions: ProjectTeamPermissionDto[],
  ): Promise<Array<{ teamId: string; permission: ProjectPermissionLevel }>> {
    const permissionsByTeam = new Map<string, ProjectPermissionLevel>();

    for (const permission of requestedPermissions) {
      permissionsByTeam.set(permission.teamId, permission.permission);
    }

    if (ownerTeamId) {
      permissionsByTeam.set(ownerTeamId, ProjectPermissionLevel.ADMIN);
    }

    const teamIds = [...permissionsByTeam.keys()];
    if (teamIds.length === 0) return [];

    const teams = await teamRepo.findBy({ id: In(teamIds) });
    if (teams.length !== teamIds.length) {
      throw new BadRequestException('One or more teams do not exist');
    }

    return teamIds.map((teamId) => ({
      teamId,
      permission: permissionsByTeam.get(teamId)!,
    }));
  }
}
