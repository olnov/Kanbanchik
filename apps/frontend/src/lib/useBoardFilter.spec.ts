/// <reference types="jest" />
import { renderHook, act } from '@testing-library/react';
import { normalizeFilter, useBoardFilter, boardFilterKey } from './useBoardFilter';
import { EMPTY_FILTER } from './filterCards';

describe('normalizeFilter', () => {
  it('returns EMPTY_FILTER for non-object input', () => {
    expect(normalizeFilter(null)).toEqual(EMPTY_FILTER);
    expect(normalizeFilter(undefined)).toEqual(EMPTY_FILTER);
    expect(normalizeFilter('nope')).toEqual(EMPTY_FILTER);
    expect(normalizeFilter(42)).toEqual(EMPTY_FILTER);
    expect(normalizeFilter([])).toEqual(EMPTY_FILTER);
  });

  it('keeps valid fields', () => {
    expect(
      normalizeFilter({
        keyword: 'bug',
        noAssignee: true,
        assignedToMe: false,
        memberIds: ['u1', 'u2'],
      }),
    ).toEqual({
      keyword: 'bug',
      noAssignee: true,
      assignedToMe: false,
      memberIds: ['u1', 'u2'],
    });
  });

  it('fills missing fields from EMPTY_FILTER', () => {
    expect(normalizeFilter({ keyword: 'x' })).toEqual({ ...EMPTY_FILTER, keyword: 'x' });
  });

  it('coerces wrong-typed fields to defaults', () => {
    expect(
      normalizeFilter({
        keyword: 123,
        noAssignee: 'yes',
        assignedToMe: 1,
        memberIds: 'u1',
      }),
    ).toEqual(EMPTY_FILTER);
  });

  it('drops non-string members', () => {
    expect(normalizeFilter({ memberIds: ['u1', 5, null, 'u2'] }).memberIds).toEqual(['u1', 'u2']);
  });

  it('ignores extra keys', () => {
    const result = normalizeFilter({ keyword: 'x', bogus: true });
    expect(result).toEqual({ ...EMPTY_FILTER, keyword: 'x' });
    expect('bogus' in result).toBe(false);
  });
});

describe('useBoardFilter', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty when nothing is stored', () => {
    const { result } = renderHook(() => useBoardFilter('p1'));
    expect(result.current[0]).toEqual(EMPTY_FILTER);
  });

  it('reads a previously stored filter on init', () => {
    localStorage.setItem(boardFilterKey('p1'), JSON.stringify({ keyword: 'bug' }));
    const { result } = renderHook(() => useBoardFilter('p1'));
    expect(result.current[0]).toEqual({ ...EMPTY_FILTER, keyword: 'bug' });
  });

  it('persists an active filter on change', () => {
    const { result } = renderHook(() => useBoardFilter('p1'));
    act(() => result.current[1]({ ...EMPTY_FILTER, keyword: 'bug' }));
    expect(JSON.parse(localStorage.getItem(boardFilterKey('p1'))!)).toEqual({
      ...EMPTY_FILTER,
      keyword: 'bug',
    });
  });

  it('removes the key when the filter is cleared', () => {
    localStorage.setItem(boardFilterKey('p1'), JSON.stringify({ keyword: 'bug' }));
    const { result } = renderHook(() => useBoardFilter('p1'));
    act(() => result.current[1](EMPTY_FILTER));
    expect(localStorage.getItem(boardFilterKey('p1'))).toBeNull();
  });

  it('ignores corrupt JSON and starts empty', () => {
    localStorage.setItem(boardFilterKey('p1'), '{not json');
    const { result } = renderHook(() => useBoardFilter('p1'));
    expect(result.current[0]).toEqual(EMPTY_FILTER);
  });

  it('scopes storage per project', () => {
    localStorage.setItem(boardFilterKey('p1'), JSON.stringify({ keyword: 'one' }));
    localStorage.setItem(boardFilterKey('p2'), JSON.stringify({ keyword: 'two' }));
    const { result } = renderHook(() => useBoardFilter('p2'));
    expect(result.current[0].keyword).toBe('two');
  });
});
