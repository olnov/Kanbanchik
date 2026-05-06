import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

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

  @Get(':id/board')
  getBoard(@Param('id') id: string) { return this.service.getBoard(id); }
}
