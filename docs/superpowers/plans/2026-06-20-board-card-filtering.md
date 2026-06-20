# Board Card Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-bar filter button on the project board that opens a panel to narrow visible cards by keyword and assignee.

**Architecture:** A pure `filterCards` helper computes the visible card set from a `BoardFilter`. The board page owns the filter state, renders a filter icon-button + popover panel next to settings, and passes the filtered cards into `<Board>`. Filtering is client-side only — no backend or API changes.

**Tech Stack:** Next.js 16 / React 19 client components, CSS modules, lucide-react icons, Jest + @testing-library/react.

## Global Constraints

- Filtering is client-side; no backend/API changes.
- Facets: Keyword + Members only (no card-status section).
- Keyword matches `summary` + `description`, case-insensitive substring.
- Members section combines its options with OR; sections combine with AND; `EMPTY_FILTER` shows all cards.
- Board uses the app's indigo theme tokens from `globals.css` (`--color-indigo`, `--color-text-secondary`, `--color-border`, `--color-surface`, `--radius-md`, `--radius-lg`, `--shadow-modal`).
- Frontend tests run with `pnpm --filter frontend test`; build with `pnpm --filter frontend build`.

---

### Task 1: `filterCards` pure logic + types

**Files:**
- Create: `apps/frontend/src/lib/filterCards.ts`
- Test: `apps/frontend/src/lib/filterCards.spec.ts`

**Interfaces:**
- Consumes: `Card` from `@/lib/types`.
- Produces:
  - `interface BoardFilter { keyword: string; noAssignee: boolean; assignedToMe: boolean; memberIds: string[] }`
  - `const EMPTY_FILTER: BoardFilter`
  - `function isFilterActive(filter: BoardFilter): boolean`
  - `function filterCards(cards: Card[], filter: BoardFilter, currentUserId?: string): Card[]`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/frontend/src/lib/filterCards.spec.ts
import { filterCards, isFilterActive, EMPTY_FILTER, BoardFilter } from './filterCards';
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter frontend test -- filterCards`
Expected: FAIL — cannot find module `./filterCards`.

- [ ] **Step 3: Write the implementation**

```ts
// apps/frontend/src/lib/filterCards.ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter frontend test -- filterCards`
Expected: PASS (all `filterCards` and `isFilterActive` cases).

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/filterCards.ts apps/frontend/src/lib/filterCards.spec.ts
git commit -m "feat(frontend): add filterCards helper for board card filtering"
```

---

### Task 2: FilterPanel component

**Files:**
- Create: `apps/frontend/src/components/board/FilterPanel.tsx`
- Create: `apps/frontend/src/components/board/FilterPanel.module.css`

**Interfaces:**
- Consumes: `BoardFilter`, `EMPTY_FILTER`, `isFilterActive` from `@/lib/filterCards`; `User` from `@/lib/types`.
- Produces: `FilterPanel` component with props
  `{ filter: BoardFilter; onChange: (filter: BoardFilter) => void; users: User[]; currentUserId?: string; onClose: () => void }`.

- [ ] **Step 1: Create the component**

```tsx
// apps/frontend/src/components/board/FilterPanel.tsx
'use client';

import { useEffect, useRef } from 'react';
import { EMPTY_FILTER, isFilterActive } from '@/lib/filterCards';
import type { BoardFilter } from '@/lib/filterCards';
import type { User } from '@/lib/types';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  filter: BoardFilter;
  onChange: (filter: BoardFilter) => void;
  users: User[];
  currentUserId?: string;
  onClose: () => void;
}

export function FilterPanel({ filter, onChange, users, currentUserId, onClose }: FilterPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  const toggleMember = (id: string) => {
    const next = filter.memberIds.includes(id)
      ? filter.memberIds.filter((m) => m !== id)
      : [...filter.memberIds, id];
    onChange({ ...filter, memberIds: next });
  };

  return (
    <div className={styles.panel} ref={ref} role="dialog" aria-label="Filter cards">
      <div className={styles.header}>
        <span className={styles.title}>Filter cards</span>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close filter">×</button>
      </div>

      <div className={styles.section}>
        <label className={styles.sectionLabel} htmlFor="filter-keyword">Keyword</label>
        <input
          id="filter-keyword"
          className={styles.input}
          value={filter.keyword}
          onChange={(e) => onChange({ ...filter, keyword: e.target.value })}
          placeholder="Enter a keyword..."
          autoFocus
        />
        <p className={styles.hint}>Search cards by summary and description.</p>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Members</span>
        <label className={styles.option}>
          <input
            type="checkbox"
            checked={filter.noAssignee}
            onChange={(e) => onChange({ ...filter, noAssignee: e.target.checked })}
          />
          No assignee
        </label>
        {currentUserId && (
          <label className={styles.option}>
            <input
              type="checkbox"
              checked={filter.assignedToMe}
              onChange={(e) => onChange({ ...filter, assignedToMe: e.target.checked })}
            />
            Assigned to me
          </label>
        )}
        {users.map((u) => (
          <label key={u.id} className={styles.option}>
            <input
              type="checkbox"
              checked={filter.memberIds.includes(u.id)}
              onChange={() => toggleMember(u.id)}
            />
            {`${u.name} ${u.lastName}`.trim()}
          </label>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.clear}
          disabled={!isFilterActive(filter)}
          onClick={() => onChange(EMPTY_FILTER)}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the styles**

```css
/* apps/frontend/src/components/board/FilterPanel.module.css */
.panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  width: 300px;
  max-height: 70vh;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }

.close {
  font-size: 18px;
  line-height: 1;
  color: var(--color-text-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}
.close:hover { background: var(--color-bg); }

.section { margin-bottom: 16px; }

.sectionLabel {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-surface);
}
.input:focus { outline: none; border-color: var(--color-indigo); }

.hint { margin-top: 6px; font-size: 12px; color: var(--color-text-muted); }

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
}

.footer { display: flex; justify-content: flex-end; }

.clear {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-indigo);
  padding: 6px 8px;
  border-radius: var(--radius-md);
}
.clear:hover:not(:disabled) { background: var(--color-bg); }
.clear:disabled { color: var(--color-text-muted); cursor: not-allowed; }
```

- [ ] **Step 3: Verify it typechecks and builds**

Run: `pnpm --filter frontend build`
Expected: build succeeds with no TypeScript errors (the component is not yet rendered anywhere; this confirms it compiles).

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/components/board/FilterPanel.tsx apps/frontend/src/components/board/FilterPanel.module.css
git commit -m "feat(frontend): add FilterPanel popover for board card filtering"
```

---

### Task 3: Wire filter button and panel into the board page

**Files:**
- Modify: `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx`
- Modify: `apps/frontend/src/app/(main)/projects/[id]/board/page.module.css`

**Interfaces:**
- Consumes: `filterCards`, `EMPTY_FILTER`, `isFilterActive`, `BoardFilter` (Task 1); `FilterPanel` (Task 2); `useAuth` from `@/contexts/AuthContext`; `ListFilter` from `lucide-react`.
- Produces: a filter icon-button + popover in the board header; `<Board>` receives the filtered card set.

- [ ] **Step 1: Add imports and filter state**

In `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx`, update the imports near the top:

```tsx
import { use, useCallback, useEffect, useState } from 'react';
import { Settings, ListFilter } from 'lucide-react';
import { Board } from '@/components/board/Board';
import { CardModal } from '@/components/board/CardModal';
import { AiImportModal } from '@/components/board/AiImportModal';
import { ProjectSettingsModal } from '@/components/board/ProjectSettingsModal';
import { FilterPanel } from '@/components/board/FilterPanel';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { filterCards, isFilterActive, EMPTY_FILTER } from '@/lib/filterCards';
import type { BoardFilter } from '@/lib/filterCards';
import { api } from '@/lib/api';
import type { BoardData, Card, User } from '@/lib/types';
import styles from './page.module.css';
```

Then, after the existing `const [error, setError] = useState<string | null>(null);` line inside `BoardPage`, add:

```tsx
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<BoardFilter>(EMPTY_FILTER);
  const [showFilter, setShowFilter] = useState(false);
```

- [ ] **Step 2: Compute the filtered board data**

In `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx`, replace the early-return + `<Board>` usage. Change the guard block and the board render so the board receives filtered cards. Replace:

```tsx
  if (error) return <div className={styles.status}>{error}</div>;
  if (!data) return <div className={styles.status}>Loading...</div>;
```

with:

```tsx
  if (error) return <div className={styles.status}>{error}</div>;
  if (!data) return <div className={styles.status}>Loading...</div>;

  const filteredData: BoardData = {
    ...data,
    cards: filterCards(data.cards, filter, currentUser?.id),
  };
```

And replace the `<Board ... data={data} ... />` element with:

```tsx
      <Board
        data={filteredData}
        users={users}
        onCardClick={setSelectedCard}
        onAddCard={setAddToStage}
        myPermission={data.myPermission}
      />
```

- [ ] **Step 3: Add the filter button and panel to the header**

In `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx`, replace the `<div className={styles.actions}>...</div>` block with:

```tsx
        <div className={styles.actions}>
          <span className={styles.filterWrap}>
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              title="Filter cards"
              aria-expanded={showFilter}
              className={styles.iconButton}
            >
              <ListFilter size={18} />
              {isFilterActive(filter) && <span className={styles.filterDot} aria-hidden="true" />}
            </button>
            {showFilter && (
              <FilterPanel
                filter={filter}
                onChange={setFilter}
                users={users}
                currentUserId={currentUser?.id}
                onClose={() => setShowFilter(false)}
              />
            )}
          </span>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            title="Project settings"
            className={styles.iconButton}
          >
            <Settings size={18} />
          </button>
          {data.myPermission !== 'viewer' && (
            <Button variant="ghost" onClick={() => setShowAiImport(true)}>
              Import from spec
            </Button>
          )}
        </div>
```

(Note: this also moves the existing settings button to the shared `.iconButton` class created in Step 4, replacing its previous inline styles.)

- [ ] **Step 4: Add header styles**

Append to `apps/frontend/src/app/(main)/projects/[id]/board/page.module.css`:

```css
.filterWrap {
  position: relative;
  display: inline-flex;
}

.iconButton {
  display: flex;
  align-items: center;
  position: relative;
  padding: 6px 8px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}
.iconButton:hover { background: var(--color-bg); color: var(--color-text-primary); }

.filterDot {
  position: absolute;
  top: 3px;
  right: 4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-indigo);
}
```

- [ ] **Step 5: Verify build and full frontend test suite**

Run: `pnpm --filter frontend build`
Expected: build succeeds with no TypeScript errors.

Run: `pnpm --filter frontend test`
Expected: PASS — existing tests plus the `filterCards` suite.

- [ ] **Step 6: Commit**

```bash
git add "apps/frontend/src/app/(main)/projects/[id]/board/page.tsx" "apps/frontend/src/app/(main)/projects/[id]/board/page.module.css"
git commit -m "feat(frontend): add board filter button and panel wiring"
```

---

## Manual verification (after all tasks)

1. Run `pnpm dev:backend` and `pnpm dev:frontend`; open a board with several cards and assignees.
2. Click the filter icon (left of settings) → panel opens; tooltip reads "Filter cards".
3. Type a keyword → only cards whose summary/description contain it remain; clearing the keyword restores all.
4. Check "No assignee" → only unassigned cards show. Check a member → cards for that member show; both checked → union of the two.
5. "Assigned to me" → only the current user's cards.
6. With any filter set, the button shows the accent dot; "Clear all" resets and the dot disappears.
7. Click outside the panel or press Escape → it closes; the active filter still applies.
8. Drag a still-visible card between lists → works as before.
