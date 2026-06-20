/// <reference types="jest" />
import { filterCards, isFilterActive, EMPTY_FILTER } from './filterCards';
import type { BoardFilter } from './filterCards';
import type { Card } from './types';

function makeCard(overrides: Partial<Card>): Card {
  return {
    id: 'c1', summary: 'Summary', description: null, type: 'task', priority: 'medium',
    order: 0, dueDate: null, projectId: 'p1', stageId: 's1', assigneeId: null,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const filter = (over: Partial<BoardFilter>): BoardFilter => ({ ...EMPTY_FILTER, ...over });

describe('filterCards', () => {
  const cards = [
    makeCard({ id: 'a', summary: 'Build login page', assigneeId: 'u1' }),
    makeCard({ id: 'b', summary: 'Fix navbar', description: 'tweak the LOGO', assigneeId: 'u2' }),
    makeCard({ id: 'c', summary: 'Write docs', assigneeId: null }),
  ];
  const ids = (cs: Card[]) => cs.map((c) => c.id);

  it('returns all cards for the empty filter', () => {
    expect(ids(filterCards(cards, EMPTY_FILTER))).toEqual(['a', 'b', 'c']);
  });

  it('matches keyword in summary, case-insensitively', () => {
    expect(ids(filterCards(cards, filter({ keyword: 'LOGIN' })))).toEqual(['a']);
  });

  it('matches keyword in description', () => {
    expect(ids(filterCards(cards, filter({ keyword: 'logo' })))).toEqual(['b']);
  });

  it('excludes when keyword matches nothing', () => {
    expect(ids(filterCards(cards, filter({ keyword: 'zzz' })))).toEqual([]);
  });

  it('keeps only unassigned cards for noAssignee', () => {
    expect(ids(filterCards(cards, filter({ noAssignee: true })))).toEqual(['c']);
  });

  it('keeps only the current user cards for assignedToMe', () => {
    expect(ids(filterCards(cards, filter({ assignedToMe: true }), 'u1'))).toEqual(['a']);
  });

  it('matches nothing for assignedToMe without a current user', () => {
    expect(ids(filterCards(cards, filter({ assignedToMe: true })))).toEqual([]);
  });

  it('keeps only cards assigned to selected memberIds', () => {
    expect(ids(filterCards(cards, filter({ memberIds: ['u2'] })))).toEqual(['b']);
  });

  it('ORs member options together', () => {
    expect(ids(filterCards(cards, filter({ noAssignee: true, memberIds: ['u1'] })))).toEqual(['a', 'c']);
  });

  it('ANDs keyword with members', () => {
    expect(ids(filterCards(cards, filter({ keyword: 'fix', memberIds: ['u2'] })))).toEqual(['b']);
    expect(ids(filterCards(cards, filter({ keyword: 'fix', memberIds: ['u1'] })))).toEqual([]);
  });
});

describe('isFilterActive', () => {
  it('is false for the empty filter', () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
  });
  it('is false for whitespace-only keyword', () => {
    expect(isFilterActive(filter({ keyword: '   ' }))).toBe(false);
  });
  it('is true when any facet is set', () => {
    expect(isFilterActive(filter({ keyword: 'x' }))).toBe(true);
    expect(isFilterActive(filter({ noAssignee: true }))).toBe(true);
    expect(isFilterActive(filter({ assignedToMe: true }))).toBe(true);
    expect(isFilterActive(filter({ memberIds: ['u1'] }))).toBe(true);
  });
});
