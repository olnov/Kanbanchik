import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class MoveCardDto {
  @ApiProperty({ description: 'Target stage ID' })
  @IsUUID()
  stageId: string;

  @ApiProperty({ description: 'Target position index (0-based)' })
  @IsInt()
  @Min(0)
  order: number;
}
