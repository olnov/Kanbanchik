import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { ProjectTeamPermission } from '../projects/project-team-permission.entity';
import { Team } from '../teams/team.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { PermissionService } from './permission.service';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectTeamPermission, Team, Stage, Card])],
  providers: [PermissionService, ProjectPermissionGuard],
  exports: [PermissionService, ProjectPermissionGuard, TypeOrmModule],
})
export class PermissionsModule {}
