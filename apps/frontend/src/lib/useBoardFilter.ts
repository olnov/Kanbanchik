import { useEffect, useRef, useState } from 'react';
import { EMPTY_FILTER, isFilterActive } from './filterCards';
import type { BoardFilter } from './filterCards';

export function boardFilterKey(projectId: string): string {
  return `board-filter:${projectId}`;
}

/**
 * Coerce an unknown parsed value into a valid BoardFilter, falling back to
 * EMPTY_FILTER for anything missing or wrong-typed. Never throws.
 */
export function normalizeFilter(raw: unknown): BoardFilter {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ...EMPTY_FILTER };
  }

  const source = raw as Record<string, unknown>;
  const memberIds = Array.isArray(source.memberIds)
    ? source.memberIds.filter((id): id is string => typeof id === 'string')
    : EMPTY_FILTER.memberIds;

  return {
    keyword: typeof source.keyword === 'string' ? source.keyword : EMPTY_FILTER.keyword,
    noAssignee:
      typeof source.noAssignee === 'boolean' ? source.noAssignee : EMPTY_FILTER.noAssignee,
    assignedToMe:
      typeof source.assignedToMe === 'boolean' ? source.assignedToMe : EMPTY_FILTER.assignedToMe,
    memberIds,
  };
}

function readStoredFilter(projectId: string): BoardFilter {
  if (typeof window === 'undefined') return { ...EMPTY_FILTER };
  try {
    const raw = window.localStorage.getItem(boardFilterKey(projectId));
    if (!raw) return { ...EMPTY_FILTER };
    return normalizeFilter(JSON.parse(raw));
  } catch {
    return { ...EMPTY_FILTER };
  }
}

/**
 * Filter state for a board, persisted to localStorage per project so it
 * survives a page reload. Drop-in replacement for
 * useState<BoardFilter>(EMPTY_FILTER).
 */
export function useBoardFilter(projectId: string): [BoardFilter, (filter: BoardFilter) => void] {
  const [filter, setFilter] = useState<BoardFilter>(() => readStoredFilter(projectId));
  const projectRef = useRef(projectId);

  // Re-read when the project changes (e.g. client-side navigation between boards).
  useEffect(() => {
    if (projectRef.current !== projectId) {
      projectRef.current = projectId;
      setFilter(readStoredFilter(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const key = boardFilterKey(projectId);
      if (isFilterActive(filter)) {
        window.localStorage.setItem(key, JSON.stringify(filter));
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage failures (private mode, quota) — filtering still works.
    }
  }, [projectId, filter]);

  return [filter, setFilter];
}
