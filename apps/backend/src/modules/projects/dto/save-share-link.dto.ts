import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class SaveShareLinkDto {
  @ApiProperty({ enum: ProjectPermissionLevel })
  @IsEnum(ProjectPermissionLevel)
  role: ProjectPermissionLevel;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}
