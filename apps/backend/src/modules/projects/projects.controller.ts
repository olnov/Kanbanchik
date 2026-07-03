import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { SaveShareLinkDto } from './dto/save-share-link.dto';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequireProjectPermission } from '../../common/decorators/project-permission.decorator';
import { ProjectPermissionLevel } from './project-member.entity';
import { User } from '../users/user.entity';

@ApiTags('projects')
@ApiSecurity('access_token')
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

  @Get(':id/assignees')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER)
  getAssignableUsers(@Param('id') id: string) {
    return this.service.getAssignableUsers(id);
  }

  @Get(':id/members')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER)
  getMembers(@Param('id') id: string, @Req() req: { currentUser: User }) {
    return this.service.getMembers(id, req.currentUser.id);
  }

  @Post(':id/members')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  addMember(@Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    return this.service.addMember(id, dto);
  }

  @Patch(':id/members/:userId')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
  ) {
    return this.service.updateMemberRole(id, userId, dto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(204)
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.removeMember(id, userId);
  }

  @Post(':id/invites')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  createInvite(
    @Param('id') id: string,
    @Body() dto: CreateInviteDto,
    @Req() req: { currentUser: User },
  ) {
    return this.service.createInvite(id, dto, req.currentUser.id);
  }

  @Delete(':id/invites/:inviteId')
  @HttpCode(204)
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  revokeInvite(@Param('id') id: string, @Param('inviteId') inviteId: string) {
    return this.service.revokeInvite(id, inviteId);
  }

  @Get(':id/share-link')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  getShareLink(@Param('id') id: string) {
    return this.service.getShareLink(id);
  }

  @Put(':id/share-link')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  saveShareLink(
    @Param('id') id: string,
    @Body() dto: SaveShareLinkDto,
    @Query('regenerate') regenerate: string,
    @Req() req: { currentUser: User },
  ) {
    return this.service.saveShareLink(id, dto, req.currentUser.id, regenerate === 'true');
  }
}
