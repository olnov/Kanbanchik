import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './stage.entity';
import { Card } from '../cards/card.entity';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ReorderStagesDto } from './dto/reorder-stages.dto';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly repo: Repository<Stage>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
  ) {}

  findByProject(projectId: string): Promise<Stage[]> {
    return this.repo.find({ where: { projectId }, order: { order: 'ASC' } });
  }

  findOne(id: string): Promise<Stage> {
    return this.repo.findOneByOrFail({ id });
  }

  async create(projectId: string, dto: CreateStageDto): Promise<Stage> {
    const existing = await this.repo.find({ where: { projectId }, order: { order: 'DESC' } });
    const order = dto.order ?? (existing.length > 0 ? existing[0].order + 100 : 0);
    return this.repo.save(this.repo.create({ ...dto, name: dto.name.trim(), projectId, order }));
  }

  async update(id: string, dto: UpdateStageDto): Promise<Stage> {
    const payload = dto.name ? { ...dto, name: dto.name.trim() } : dto;
    await this.repo.update(id, payload);
    return this.findOne(id);
  }

  async reorder(projectId: string, dto: ReorderStagesDto): Promise<Stage[]> {
    const stages = await this.repo.find({ where: { projectId }, order: { order: 'ASC' } });
    const existingIds = new Set(stages.map((stage) => stage.id));

    if (
      dto.stageIds.length !== stages.length
      || dto.stageIds.some((stageId) => !existingIds.has(stageId))
    ) {
      throw new BadRequestException('Stage reorder payload does not match project stages');
    }

    await this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Stage);

      await repo.save(
        dto.stageIds.map((stageId, index) => ({
          id: stageId,
          order: index * 100,
        })),
      );
    });

    return this.findByProject(projectId);
  }

  async remove(id: string): Promise<void> {
    const cardsInStage = await this.cardRepo.count({ where: { stageId: id } });

    if (cardsInStage > 0) {
      throw new BadRequestException('Cannot delete a list that still contains cards');
    }

    await this.repo.softDelete(id);
  }
}
