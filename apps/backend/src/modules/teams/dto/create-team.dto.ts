import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsOptional, IsString, IsUUID,
} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  memberIds?: string[];
}
