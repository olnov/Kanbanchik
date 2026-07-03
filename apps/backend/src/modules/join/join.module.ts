import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { ProjectInvite } from '../projects/project-invite.entity';
import { ProjectShareLink } from '../projects/project-share-link.entity';
import { JoinService } from './join.service';
import { JoinController } from './join.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember, ProjectInvite, ProjectShareLink])],
  providers: [JoinService],
  controllers: [JoinController],
})
export class JoinModule {}
