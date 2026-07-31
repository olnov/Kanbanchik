import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/card.entity';
import { AI_PROVIDER, AiProvider, CardDraft } from './providers/ai-provider.interface';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import { Project } from '../projects/project.entity';
import { CardCodeService } from '../projects/card-code.service';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    private readonly cardCodeService: CardCodeService,
  ) {}

  importSpec(text: string): Promise<CardDraft[]> {
    return this.provider.generateCards(text);
  }

  async confirmImport(dto: ConfirmImportDto): Promise<Card[]> {
    const { projectId, stageId, cards } = dto;
    return this.cardRepo.manager.transaction(async (manager) => {
      const cardRepo = manager.getRepository(Card);
      const projectRepo = manager.getRepository(Project);
      const existing = await cardRepo.find({
        where: { stageId },
        order: { order: 'DESC' },
        take: 1,
      });
      const startOrder = existing.length > 0 ? existing[0].order + 100 : 0;
      const summaries = await this.cardCodeService.addCodes(
        projectRepo,
        projectId,
        cards.map((card) => card.summary),
      );
      const entities = cards.map((draft, i) =>
        cardRepo.create({
          ...draft,
          summary: summaries[i],
          projectId,
          stageId,
          order: startOrder + i * 100,
        }),
      );
      return cardRepo.save(entities);
    });
  }
}
