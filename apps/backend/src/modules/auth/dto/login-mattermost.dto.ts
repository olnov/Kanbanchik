import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginMattermostDto {
  @ApiProperty() @IsString() @IsNotEmpty() loginId: string;
  @ApiProperty() @IsString() @IsNotEmpty() password: string;
}
