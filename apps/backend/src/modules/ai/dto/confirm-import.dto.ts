import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class CardDraftDto {
  @ApiProperty() @IsString() summary: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsString() priority: string;
}

export class ConfirmImportDto {
  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty()
  @IsUUID()
  stageId: string;

  @ApiProperty({ type: [CardDraftDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardDraftDto)
  cards: CardDraftDto[];
}
