/// <reference types="jest" />
import { boardPath, cardPath } from './cardRoutes';

describe('card routes', () => {
  it('builds a project board path', () => {
    expect(boardPath('project-1')).toBe('/projects/project-1/board');
  });

  it('builds a nested card path', () => {
    expect(cardPath('project-1', 'card-2')).toBe('/projects/project-1/board/cards/card-2');
  });

  it('encodes route segments', () => {
    expect(cardPath('project/one', 'card two')).toBe(
      '/projects/project%2Fone/board/cards/card%20two',
    );
  });
});
