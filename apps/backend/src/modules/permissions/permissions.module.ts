import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { ProjectTeamPermission } from '../projects/project-team-permission.entity';
import { Team } from '../teams/team.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { PermissionService } from './permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectTeamPermission, Team, Stage, Card])],
  providers: [PermissionService],
  exports: [PermissionService, TypeOrmModule],
})
export class PermissionsModule {}
