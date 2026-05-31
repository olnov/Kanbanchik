import {
  Controller, Get, Post, Delete, Param, Body,
  HttpCode, Patch, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SetProjectTeamPermissionsDto } from './dto/set-project-team-permissions.dto';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequireProjectPermission } from '../../common/decorators/project-permission.decorator';
import { ProjectPermissionLevel } from './project-team-permission.entity';
import { User } from '../users/user.entity';

@ApiTags('projects')
@ApiSecurity('x-user-id')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  findAll(@Req() req: { currentUser: User }) {
    return this.service.findAll(req.currentUser.id);
  }

  @Get(':id')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: { currentUser: User }) {
    return this.service.create(dto, req.currentUser.id);
  }

  @Patch(':id/team-permissions')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  setTeamPermissions(@Param('id') id: string, @Body() dto: SetProjectTeamPermissionsDto) {
    return this.service.setTeamPermissions(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/board')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER)
  getBoard(@Param('id') id: string, @Req() req: { currentUser: User }) {
    return this.service.getBoard(id, req.currentUser.id);
  }
}
