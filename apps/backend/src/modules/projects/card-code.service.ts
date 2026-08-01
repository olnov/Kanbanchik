import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

export const DEFAULT_CARD_CODE_PATTERN = '{PROJECT:4}-{NUMBER}';
const CARD_CODE_PREFIX = /^\[[^\]\r\n]+\]\s/u;

export function hasCardCode(summary: string): boolean {
  return CARD_CODE_PREFIX.test(summary);
}

export function renderCardCode(pattern: string, projectName: string, number: number): string {
  const compactName = projectName.replace(/\s+/gu, '').toUpperCase();
  return pattern
    .replace(/\{PROJECT(?::(\d+))?\}/gu, (_token, length?: string) =>
      length ? Array.from(compactName).slice(0, Number(length)).join('') : compactName,
    )
    .replace(/\{NUMBER\}/gu, String(number));
}

export function applyCardCodes(project: Project, summaries: string[]): string[] {
  const firstNumber = project.nextCardNumber;
  project.nextCardNumber += summaries.length;

  return summaries.map((summary, index) => {
    const code = renderCardCode(project.cardCodePattern, project.name, firstNumber + index);
    return `[${code}] ${summary}`;
  });
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

    const codedSummaries = applyCardCodes(project, summaries);
    await projectRepo.save(project);
    return codedSummaries;
  }
}
