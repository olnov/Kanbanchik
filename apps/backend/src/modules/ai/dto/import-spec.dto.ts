import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ImportSpecDto {
  @ApiProperty({ description: 'Raw spec or requirements text' })
  @IsString()
  @MinLength(10)
  text: string;
}
