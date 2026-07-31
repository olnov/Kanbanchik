import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

export const DEFAULT_CARD_CODE_PATTERN = '{PROJECT:4}-{NUMBER}';

export function renderCardCode(pattern: string, projectName: string, number: number): string {
  const compactName = projectName.replace(/\s+/gu, '').toUpperCase();
  return pattern
    .replace(/\{PROJECT(?::(\d+))?\}/gu, (_token, length?: string) =>
      length ? Array.from(compactName).slice(0, Number(length)).join('') : compactName,
    )
    .replace(/\{NUMBER\}/gu, String(number));
}

@Injectable()
export class CardCodeService {
  async addCodes(
    projectRepo: Repository<Project>,
    projectId: string,
    summaries: string[],
  ): Promise<string[]> {
    const project = await projectRepo.findOneOrFail({
      where: { id: projectId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!project.cardCodeEnabled || summaries.length === 0) return summaries;

    const firstNumber = project.nextCardNumber;
    project.nextCardNumber += summaries.length;
    await projectRepo.save(project);

    return summaries.map((summary, index) => {
      const code = renderCardCode(project.cardCodePattern, project.name, firstNumber + index);
      return `[${code}] ${summary}`;
    });
  }
}
