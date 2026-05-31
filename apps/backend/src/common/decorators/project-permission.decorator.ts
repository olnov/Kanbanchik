import { SetMetadata } from '@nestjs/common';
import { ProjectPermissionLevel } from '../../modules/projects/project-team-permission.entity';

export const PROJECT_PERMISSION_KEY = 'projectPermission';

export type PermissionSource =
  | `project-param:${string}`
  | 'stage-param'
  | 'card-param'
  | `body:${string}`;

export interface ProjectPermissionRequirement {
  level: ProjectPermissionLevel;
  source: PermissionSource;
}

export const RequireProjectPermission = (
  level: ProjectPermissionLevel,
  source: PermissionSource = 'project-param:id',
) => SetMetadata<string, ProjectPermissionRequirement>(PROJECT_PERMISSION_KEY, { level, source });
