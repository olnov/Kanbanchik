import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@ApiTags('stages')
@ApiSecurity('x-user-id')
@Controller()
export class StagesController {
  constructor(private readonly service: StagesService) {}

  @Get('projects/:projectId/stages')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  @Post('projects/:projectId/stages')
  create(@Param('projectId') projectId: string, @Body() dto: CreateStageDto) {
    return this.service.create(projectId, dto);
  }

  @Patch('stages/:id')
  update(@Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.service.update(id, dto);
  }

  @Delete('stages/:id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
