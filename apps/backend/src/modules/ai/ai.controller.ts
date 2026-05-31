import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ImportSpecDto } from './dto/import-spec.dto';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequireProjectPermission } from '../../common/decorators/project-permission.decorator';
import { ProjectPermissionLevel } from '../projects/project-team-permission.entity';

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
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.COLLABORATOR, 'body:projectId')
  confirm(@Body() dto: ConfirmImportDto) {
    return this.service.confirmImport(dto);
  }
}
