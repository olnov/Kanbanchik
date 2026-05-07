import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stage } from './stage.entity';
import { Card } from '../cards/card.entity';
import { StagesService } from './stages.service';
import { StagesController } from './stages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stage, Card])],
  providers: [StagesService],
  controllers: [StagesController],
  exports: [StagesService],
})
export class StagesModule {}
