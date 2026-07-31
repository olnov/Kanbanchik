import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { Stage } from '../stages/stage.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { Project } from '../projects/project.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Stage, Project]), PermissionsModule, ProjectsModule],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService, TypeOrmModule],
})
export class CardsModule {}
