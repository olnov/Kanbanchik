import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class CreateInviteDto {
  @ApiProperty() @IsEmail() email: string;

  @ApiProperty({ enum: ProjectPermissionLevel, required: false })
  @IsEnum(ProjectPermissionLevel)
  @IsOptional()
  role?: ProjectPermissionLevel;
}
