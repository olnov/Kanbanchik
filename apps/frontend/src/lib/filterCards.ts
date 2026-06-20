import type { Card } from './types';

export interface BoardFilter {
  keyword: string;
  noAssignee: boolean;
  assignedToMe: boolean;
  memberIds: string[];
}

export const EMPTY_FILTER: BoardFilter = {
  keyword: '',
  noAssignee: false,
  assignedToMe: false,
  memberIds: [],
};

export function isFilterActive(filter: BoardFilter): boolean {
  return (
    filter.keyword.trim() !== ''
    || filter.noAssignee
    || filter.assignedToMe
    || filter.memberIds.length > 0
  );
}

export function filterCards(
  cards: Card[],
  filter: BoardFilter,
  currentUserId?: string,
): Card[] {
  const keyword = filter.keyword.trim().toLowerCase();
  const membersActive = filter.noAssignee || filter.assignedToMe || filter.memberIds.length > 0;

  return cards.filter((card) => {
    if (keyword) {
      const haystack = `${card.summary} ${card.description ?? ''}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    if (membersActive) {
      const matchesMember = (filter.noAssignee && card.assigneeId == null)
        || (filter.assignedToMe && currentUserId != null && card.assigneeId === currentUserId)
        || (card.assigneeId != null && filter.memberIds.includes(card.assigneeId));
      if (!matchesMember) return false;
    }

    return true;
  });
}
