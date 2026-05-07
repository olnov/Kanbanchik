import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize, IsArray, IsString,
} from 'class-validator';

export class ReorderStagesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  stageIds: string[];
}
