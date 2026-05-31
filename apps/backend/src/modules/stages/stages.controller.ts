import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ReorderStagesDto } from './dto/reorder-stages.dto';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequireProjectPermission } from '../../common/decorators/project-permission.decorator';
import { ProjectPermissionLevel } from '../projects/project-member.entity';

@ApiTags('stages')
@ApiSecurity('x-user-id')
@Controller()
export class StagesController {
  constructor(private readonly service: StagesService) {}

  @Get('projects/:projectId/stages')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER, 'project-param:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  @Post('projects/:projectId/stages')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN, 'project-param:projectId')
  create(@Param('projectId') projectId: string, @Body() dto: CreateStageDto) {
    return this.service.create(projectId, dto);
  }

  @Patch('projects/:projectId/stages/reorder')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN, 'project-param:projectId')
  reorder(@Param('projectId') projectId: string, @Body() dto: ReorderStagesDto) {
    return this.service.reorder(projectId, dto);
  }

  @Patch('stages/:id')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN, 'stage-param')
  update(@Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.service.update(id, dto);
  }

  @Delete('stages/:id')
  @HttpCode(204)
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN, 'stage-param')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
