import {
  Injectable, CanActivate, ExecutionContext,
  ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PROJECT_PERMISSION_KEY,
  ProjectPermissionRequirement,
  PermissionSource,
} from '../decorators/project-permission.decorator';
import { PermissionService } from '../../modules/permissions/permission.service';
import { Stage } from '../../modules/stages/stage.entity';
import { Card } from '../../modules/cards/card.entity';
import { ProjectPermissionLevel } from '../../modules/projects/project-team-permission.entity';
import { User } from '../../modules/users/user.entity';

const LEVEL_ORDER: Record<ProjectPermissionLevel, number> = {
  [ProjectPermissionLevel.VIEWER]: 0,
  [ProjectPermissionLevel.COLLABORATOR]: 1,
  [ProjectPermissionLevel.ADMIN]: 2,
};

@Injectable()
export class ProjectPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.get<ProjectPermissionRequirement>(
      PROJECT_PERMISSION_KEY,
      context.getHandler(),
    );
    if (!requirement) return true;

    const request = context.switchToHttp().getRequest<{
      params: Record<string, string>;
      body: Record<string, unknown>;
      currentUser: User;
    }>();

    const projectId = await this.resolveProjectId(request, requirement.source);
    if (!projectId) throw new NotFoundException('Project not found');

    const effectiveLevel = await this.permissionService.getUserProjectPermission(
      request.currentUser.id,
      projectId,
    );

    if (!effectiveLevel) {
      throw new ForbiddenException('You do not have access to this project');
    }

    if (LEVEL_ORDER[effectiveLevel] < LEVEL_ORDER[requirement.level]) {
      throw new ForbiddenException(
        `This action requires ${requirement.level} permission on the project`,
      );
    }

    return true;
  }

  private async resolveProjectId(
    request: { params: Record<string, string>; body: Record<string, unknown> },
    source: PermissionSource,
  ): Promise<string | null> {
    if (source.startsWith('project-param:')) {
      const paramName = source.slice('project-param:'.length);
      return request.params[paramName] ?? null;
    }

    if (source.startsWith('body:')) {
      const fieldName = source.slice('body:'.length);
      const value = request.body[fieldName];
      return typeof value === 'string' ? value : null;
    }

    if (source === 'stage-param') {
      const stage = await this.stageRepo.findOne({
        where: { id: request.params.id },
        select: ['projectId'],
      });
      return stage?.projectId ?? null;
    }

    if (source === 'card-param') {
      const card = await this.cardRepo.findOne({
        where: { id: request.params.id },
        select: ['projectId'],
      });
      return card?.projectId ?? null;
    }

    return null;
  }
}
