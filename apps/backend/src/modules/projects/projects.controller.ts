import {
  Controller, Get, Post, Delete, Param, Body, HttpCode, Patch,
} from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SetProjectTeamPermissionsDto } from './dto/set-project-team-permissions.dto';

@ApiTags('projects')
@ApiSecurity('x-user-id')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateProjectDto) { return this.service.create(dto); }

  @Patch(':id/team-permissions')
  setTeamPermissions(@Param('id') id: string, @Body() dto: SetProjectTeamPermissionsDto) {
    return this.service.setTeamPermissions(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Get(':id/board')
  getBoard(@Param('id') id: string) { return this.service.getBoard(id); }
}
