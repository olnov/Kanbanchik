import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsOptional, ValidateNested,
} from 'class-validator';
import { ProjectTeamPermissionDto } from './project-team-permission.dto';

export class SetProjectTeamPermissionsDto {
  @ApiProperty({ type: [ProjectTeamPermissionDto], required: false, default: [] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectTeamPermissionDto)
  @IsOptional()
  teamPermissions?: ProjectTeamPermissionDto[];
}
