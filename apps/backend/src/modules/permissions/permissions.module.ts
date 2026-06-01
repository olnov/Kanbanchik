import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { PermissionService } from './permission.service';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember, Stage, Card])],
  providers: [PermissionService, ProjectPermissionGuard],
  exports: [PermissionService, ProjectPermissionGuard, TypeOrmModule],
})
export class PermissionsModule {}
