import { Controller, Post, Patch, Delete, Param, Body, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequireProjectPermission } from '../../common/decorators/project-permission.decorator';
import { ProjectPermissionLevel } from '../projects/project-member.entity';

@ApiTags('cards')
@ApiSecurity('x-user-id')
@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Post()
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.COLLABORATOR, 'body:projectId')
  create(@Body() dto: CreateCardDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.COLLABORATOR, 'card-param')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN, 'card-param')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/move')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.COLLABORATOR, 'card-param')
  move(@Param('id') id: string, @Body() dto: MoveCardDto) {
    return this.service.move(id, dto);
  }
}
