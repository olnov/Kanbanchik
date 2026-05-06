import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { DEFAULT_PROJECT_STAGES } from '../../database/project-defaults';

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

  async create(dto: CreateProjectDto): Promise<Project> {
    return this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const stageRepo = manager.getRepository(Stage);

      const project = await projectRepo.save(projectRepo.create(dto));
      await stageRepo.save(
        DEFAULT_PROJECT_STAGES.map((stage) =>
          stageRepo.create({ ...stage, projectId: project.id })),
      );

      return project;
    });
  }

  async remove(id: string): Promise<void> {
    await this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const stageRepo = manager.getRepository(Stage);
      const cardRepo = manager.getRepository(Card);

      await projectRepo.findOneByOrFail({ id });
      await cardRepo.softDelete({ projectId: id });
      await stageRepo.softDelete({ projectId: id });
      await projectRepo.softDelete(id);
    });
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
