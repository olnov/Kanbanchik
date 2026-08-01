import { applyCardCodes, CardCodeService, hasCardCode, renderCardCode } from './card-code.service';
import { Project } from './project.entity';

const project = {
  id: 'project-1',
  name: 'Product roadmap',
  cardCodeEnabled: true,
  cardCodePattern: '{PROJECT:4}-{NUMBER}',
  nextCardNumber: 1,
} as Project;

describe('CardCodeService', () => {
  it.each([
    ['[PROD-1] Existing', true],
    ['[] Empty token', false],
    ['[PROD\n-1] Existing', false],
    ['[PROD-1]Existing', false],
    ['Plain title', false],
  ])('detects generated-code format in %j', (summary, expected) => {
    expect(hasCardCode(summary)).toBe(expected);
  });

  it('applies consecutive codes and advances the in-memory counter', () => {
    const target = { ...project, nextCardNumber: 4 };

    expect(applyCardCodes(target, ['First', 'Second'])).toEqual([
      '[PROD-4] First',
      '[PROD-5] Second',
    ]);
    expect(target.nextCardNumber).toBe(6);
  });

  it('renders the default project prefix in uppercase', () => {
    expect(renderCardCode('{PROJECT:4}-{NUMBER}', 'Product roadmap', 12)).toBe('PROD-12');
  });

  it('supports custom patterns and Unicode project names', () => {
    expect(renderCardCode('TASK/{PROJECT:3}/{NUMBER}', 'Проект Альфа', 7)).toBe('TASK/ПРО/7');
  });

  it('allocates consecutive codes and persists the next number', async () => {
    const savedProject = { ...project };
    const repo = {
      findOneOrFail: jest.fn().mockResolvedValue(savedProject),
      save: jest.fn().mockImplementation((value) => Promise.resolve(value)),
    } as any;

    const result = await new CardCodeService().addCodes(repo, project.id, ['First', 'Second']);

    expect(result).toEqual(['[PROD-1] First', '[PROD-2] Second']);
    expect(savedProject.nextCardNumber).toBe(3);
    expect(repo.findOneOrFail).toHaveBeenCalledWith(
      expect.objectContaining({
        lock: { mode: 'pessimistic_write' },
      }),
    );
  });

  it('leaves titles and counter unchanged when generation is disabled', async () => {
    const disabledProject = { ...project, cardCodeEnabled: false };
    const repo = {
      findOneOrFail: jest.fn().mockResolvedValue(disabledProject),
      save: jest.fn(),
    } as any;

    await expect(new CardCodeService().addCodes(repo, project.id, ['First'])).resolves.toEqual([
      'First',
    ]);
    expect(repo.save).not.toHaveBeenCalled();
  });
});
