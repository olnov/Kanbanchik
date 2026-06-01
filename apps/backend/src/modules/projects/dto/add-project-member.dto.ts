import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class AddProjectMemberDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty({ enum: ProjectPermissionLevel, required: false })
  @IsEnum(ProjectPermissionLevel) @IsOptional()
  role?: ProjectPermissionLevel;
}
