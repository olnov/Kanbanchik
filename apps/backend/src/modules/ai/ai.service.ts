import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/card.entity';
import { AI_PROVIDER, AiProvider, CardDraft } from './providers/ai-provider.interface';
import { ConfirmImportDto } from './dto/confirm-import.dto';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
  ) {}

  importSpec(text: string): Promise<CardDraft[]> {
    return this.provider.generateCards(text);
  }

  async confirmImport(dto: ConfirmImportDto): Promise<Card[]> {
    const { projectId, stageId, cards } = dto;
    const existing = await this.cardRepo.find({
      where: { stageId },
      order: { order: 'DESC' },
      take: 1,
    });
    const startOrder = existing.length > 0 ? existing[0].order + 100 : 0;

    const entities = cards.map((draft, i) =>
      this.cardRepo.create({ ...draft, projectId, stageId, order: startOrder + i * 100 }),
    );
    return this.cardRepo.save(entities);
  }
}
