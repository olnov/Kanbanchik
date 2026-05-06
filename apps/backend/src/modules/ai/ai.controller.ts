import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ImportSpecDto } from './dto/import-spec.dto';
import { ConfirmImportDto } from './dto/confirm-import.dto';

@ApiTags('ai')
@ApiSecurity('x-user-id')
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('import')
  import(@Body() dto: ImportSpecDto) {
    return this.service.importSpec(dto.text);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmImportDto) {
    return this.service.confirmImport(dto);
  }
}
