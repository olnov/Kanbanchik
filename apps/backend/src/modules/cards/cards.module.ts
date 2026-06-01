import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { Stage } from '../stages/stage.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Stage]), PermissionsModule],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService, TypeOrmModule],
})
export class CardsModule {}
