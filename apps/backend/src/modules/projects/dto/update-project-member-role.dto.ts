import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class UpdateProjectMemberRoleDto {
  @ApiProperty({ enum: ProjectPermissionLevel })
  @IsEnum(ProjectPermissionLevel)
  role: ProjectPermissionLevel;
}
