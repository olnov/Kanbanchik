import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { ProjectPermissionLevel } from '../project-team-permission.entity';

export class ProjectTeamPermissionDto {
  @ApiProperty()
  @IsUUID()
  teamId: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @IsEnum(ProjectPermissionLevel)
  permission: ProjectPermissionLevel;
}
