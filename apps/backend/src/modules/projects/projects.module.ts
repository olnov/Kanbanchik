import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { ProjectShareLink } from './project-share-link.entity';
import { ProjectInvite } from './project-invite.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { User } from '../users/user.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectMember,
      Stage,
      Card,
      User,
      ProjectShareLink,
      ProjectInvite,
    ]),
    PermissionsModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
