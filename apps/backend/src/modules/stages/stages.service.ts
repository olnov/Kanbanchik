import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './stage.entity';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly repo: Repository<Stage>,
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
    return this.repo.save(this.repo.create({ ...dto, projectId, order }));
  }

  async update(id: string, dto: UpdateStageDto): Promise<Stage> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
