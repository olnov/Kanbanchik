# Board Card Filtering — Design

Date: 2026-06-20
Status: Approved (pending spec review)

## Goal

Let users filter the cards shown on a project board by keyword and assignee. A filter
icon-button sits in the board top bar next to the settings button; clicking it opens a
panel (modelled on the Trello "Filter cards" popover) with Keyword and Members sections.
Filtering is visual only — it narrows which cards are displayed, without changing data.

## Decisions

- **Filtering is client-side.** The board already loads all cards; filter state lives in
  the board page and the filtered list is passed into `<Board>`. No backend/API changes.
- **No "Card status" section.** Our `Card` model has no complete/done field, so that
  Trello section is omitted. Facets are Keyword + Members only.
- **Single assignee.** Cards have one `assigneeId`, so "Members" maps to assignee:
  "No assignee", "Assigned to me", and individually selectable project members.
- **Keyword** matches `summary` + `description`, case-insensitive substring.

## Architecture

```
BoardPage (owns filter state)
   |  filter: BoardFilter
   |  filteredCards = filterCards(data.cards, filter, currentUser?.id)
   |
   ├── header actions: [FilterButton] [Settings] [Import from spec]
   |        FilterButton toggles FilterPanel (popover)
   |        FilterPanel reads/writes `filter`, lists `users`
   |
   └── <Board data={{ ...data, cards: filteredCards }} ... />
            └── Columns render only the cards they receive
```

`filterCards` is a pure function (no React) so it can be unit-tested in isolation.

## Components

### `BoardFilter` type (`apps/frontend/src/lib/filterCards.ts`)

```ts
export interface BoardFilter {
  keyword: string;
  noAssignee: boolean;
  assignedToMe: boolean;
  memberIds: string[]; // selected project user ids
}

export const EMPTY_FILTER: BoardFilter = {
  keyword: '',
  noAssignee: false,
  assignedToMe: false,
  memberIds: [],
};
```

### `filterCards(cards, filter, currentUserId)` (same file)

Signature: `filterCards(cards: Card[], filter: BoardFilter, currentUserId?: string): Card[]`

Logic:
1. **Keyword**: if `filter.keyword.trim()` is non-empty, keep cards whose `summary` or
   `description` (lowercased) includes the lowercased trimmed term. Empty keyword → no
   keyword constraint.
2. **Members**: the section is "active" if `noAssignee || assignedToMe ||
   memberIds.length > 0`. When active, a card passes if it matches **any** selected
   option (OR):
   - `noAssignee` and `card.assigneeId == null`;
   - `assignedToMe` and `currentUserId != null` and `card.assigneeId === currentUserId`;
   - `card.assigneeId` is in `memberIds`.
   When the section is inactive, no member constraint.
3. Sections combine with **AND**. With `EMPTY_FILTER`, every card passes.

Helper `isFilterActive(filter): boolean` returns whether any facet is set (used for the
button's active indicator and the "Clear all" affordance).

### `FilterPanel` (`apps/frontend/src/components/board/FilterPanel.tsx`)

Popover anchored under the filter button. Props:
`{ filter: BoardFilter; onChange: (f: BoardFilter) => void; users: User[]; currentUserId?: string; onClose: () => void }`.

Sections:
- **Keyword**: labelled text input bound to `filter.keyword`; helper line
  "Search cards by summary and description.".
- **Members**: checkboxes — "No assignee", "Assigned to me" (only shown when
  `currentUserId` is set), then one checkbox per project user (`users`), checked when the
  id is in `memberIds`. The current user may appear both as "Assigned to me" and in the
  list; that is acceptable (OR semantics make it idempotent).
- **Footer**: "Clear all" button, enabled when `isFilterActive(filter)`, resets to
  `EMPTY_FILTER`.

Dismissal: closes on outside click and Escape (follow the existing modal/popover pattern;
if none fits a popover, a lightweight click-away + keydown handler in the component).

### `FilterButton` (inline in board page header)

Icon-button using lucide `ListFilter`, tooltip "Filter cards", placed before the settings
button. Shows a small accent dot when `isFilterActive(filter)`. Toggles panel visibility.

### Board page wiring (`apps/frontend/src/app/(main)/projects/[id]/board/page.tsx`)

- Add `const { currentUser } = useAuth();`
- `const [filter, setFilter] = useState<BoardFilter>(EMPTY_FILTER);`
- `const [showFilter, setShowFilter] = useState(false);`
- Compute `const filteredCards = data ? filterCards(data.cards, filter, currentUser?.id) : [];`
- Pass `data={{ ...data, cards: filteredCards }}` to `<Board>`.
- Render `FilterButton` + `FilterPanel` in the header.

## Data flow

User toggles a checkbox / types a keyword → `FilterPanel` calls `onChange` → board page
updates `filter` state → `filteredCards` recomputes → `<Board>` re-renders columns with
the narrowed set. Drag-and-drop and reordering operate on the visible cards as before;
filtering never mutates server data.

## Error handling

Pure UI state; no network calls, so no new error paths. `filterCards` treats missing
`description` (null) as empty string and a missing `currentUserId` as "assigned to me"
matching nothing.

## Testing

Unit tests for `filterCards` (`apps/frontend/src/lib/filterCards.spec.ts`):
- empty filter returns all cards;
- keyword matches summary; keyword matches description; keyword is case-insensitive;
  non-matching keyword excludes;
- `noAssignee` keeps only null-assignee cards;
- `assignedToMe` keeps only current-user cards; with no `currentUserId`, matches none;
- `memberIds` keeps only cards assigned to those ids;
- members options OR together (no-assignee + a member id);
- keyword AND members combine;
- `isFilterActive` true/false cases.

`FilterPanel`/`FilterButton` are thin UI over this function and are covered by the unit
tests of the logic plus manual verification.

## Out of scope

- Server-side filtering / query params.
- A real card "complete/done" status and filtering on it.
- Filtering by priority, type, due date, or labels.
- Persisting filters across reloads or sharing via URL.
