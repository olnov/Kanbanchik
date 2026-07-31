import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { PermissionService } from '../permissions/permission.service';
import { ProjectPermissionLevel } from '../projects/project-member.entity';
import { Project } from '../projects/project.entity';
import { CardCodeService } from '../projects/card-code.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly repo: Repository<Card>,
    private readonly permissionService: PermissionService,
    private readonly cardCodeService: CardCodeService,
  ) {}

  // Viewers (and non-members) can read the board but must not be assigned cards.
  private async assertAssignable(assigneeId: string, projectId: string): Promise<void> {
    const permission = await this.permissionService.getUserProjectPermission(assigneeId, projectId);
    if (permission === null || permission === ProjectPermissionLevel.VIEWER) {
      throw new BadRequestException('Assignee must be a collaborator or admin on this project');
    }
  }

  async create(dto: CreateCardDto): Promise<Card> {
    if (dto.assigneeId) {
      await this.assertAssignable(dto.assigneeId, dto.projectId);
    }
    return this.repo.manager.transaction(async (manager) => {
      const cardRepo = manager.getRepository(Card);
      const projectRepo = manager.getRepository(Project);
      const stageCards = await cardRepo.find({
        where: { stageId: dto.stageId },
        order: { order: 'DESC' },
        take: 1,
      });
      const order = stageCards.length > 0 ? stageCards[0].order + 100 : 0;
      const [summary] = await this.cardCodeService.addCodes(projectRepo, dto.projectId, [
        dto.summary,
      ]);
      return cardRepo.save(cardRepo.create({ ...dto, summary, order }));
    });
  }

  async update(id: string, dto: UpdateCardDto): Promise<Card> {
    if (dto.assigneeId) {
      const card = await this.repo.findOneByOrFail({ id });
      await this.assertAssignable(dto.assigneeId, dto.projectId ?? card.projectId);
    }
    await this.repo.update(id, dto);
    return this.repo.findOneByOrFail({ id });
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async move(id: string, dto: MoveCardDto): Promise<Card> {
    const card = await this.repo.findOneByOrFail({ id });
    const stageCards = await this.repo.find({
      where: { stageId: dto.stageId },
      order: { order: 'ASC' },
    });

    // Remove the moving card from the list
    const others = stageCards.filter((c) => c.id !== id);

    // Insert at target position
    const insertAt = Math.min(dto.order, others.length);
    others.splice(insertAt, 0, { ...card, stageId: dto.stageId });

    // Reassign order with 100-gap increments
    const updates = others.map((c, i) => ({
      id: c.id,
      stageId: dto.stageId,
      order: i * 100,
    }));

    await this.repo.save(updates as Partial<Card>[]);
    return this.repo.findOneByOrFail({ id });
  }
}
