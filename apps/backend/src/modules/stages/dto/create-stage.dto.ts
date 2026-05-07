import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsInt, IsOptional, Min, IsNotEmpty,
} from 'class-validator';

export class CreateStageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
