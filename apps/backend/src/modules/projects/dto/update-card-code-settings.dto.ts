import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateCardCodeSettingsDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: '{PROJECT:4}-{NUMBER}' })
  @IsString()
  @MaxLength(80)
  @Matches(/\{NUMBER\}/, { message: 'pattern must contain {NUMBER}' })
  pattern: string;
}
