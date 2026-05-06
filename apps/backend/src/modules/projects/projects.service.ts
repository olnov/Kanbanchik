import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectRepo.find();
  }

  findOne(id: string): Promise<Project> {
    return this.projectRepo.findOneByOrFail({ id });
  }

  create(dto: CreateProjectDto): Promise<Project> {
    return this.projectRepo.save(this.projectRepo.create(dto));
  }

  async getBoard(projectId: string) {
    const [project, stages, cards] = await Promise.all([
      this.projectRepo.findOneByOrFail({ id: projectId }),
      this.stageRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.cardRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
    ]);
    return { project, stages, cards };
  }
}
