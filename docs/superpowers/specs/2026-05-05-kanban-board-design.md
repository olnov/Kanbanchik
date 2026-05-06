# Kanbanchik — Design Spec

**Date:** 2026-05-05
**Status:** Approved

---

## Overview

A Trello-like Kanban board desktop + web application with AI-assisted card generation and planning. Built as a pnpm monorepo with independently deployable apps: a NestJS backend, a Next.js frontend, and an Electron shell.

---

## Decisions Summary

| Topic | Decision |
|-------|----------|
| Repo structure | pnpm monorepo, `apps/` layout, no shared package |
| Auth | Mocked user switcher via `X-User-Id` header |
| AI provider | Abstract `AiProvider` interface, mock only for now |
| Visual style | Modern/colorful — indigo accents, per-column tinting |
| Board layout | Sidebar nav (Linear-style) |
| Backend adapter | Fastify + Pino + Swagger + `/api/v1/` prefix |
| Drag and drop | `@hello-pangea/dnd`, optimistic updates |
| Data fetching | Plain fetch, Server Components for initial load |
| Electron | Dev: loads localhost; Prod: static Next.js export |
| Testing | Jest only, co-located, minimal |

---

## Project Structure

```
kanbanchik/
  apps/
    backend/                  # NestJS + TypeORM + PostgreSQL
    frontend/                 # Next.js + CSS Modules + TypeScript
    electron/                 # Electron shell
  package.json                # pnpm workspaces root
  pnpm-workspace.yaml
  .gitignore
  .eslintrc.json
  tsconfig.base.json
```

Each `apps/*` directory is a fully self-contained application with its own `package.json`, `tsconfig.json`, and build scripts. No cross-app imports. Apps communicate via the REST API only.

---

## Backend (NestJS)

### Stack

- **Runtime:** Node.js + NestJS
- **HTTP adapter:** Fastify (`@nestjs/platform-fastify`)
- **ORM:** TypeORM with PostgreSQL
- **Logging:** Pino via `nestjs-pino` (JSON in prod, pretty in dev)
- **Docs:** Swagger at `/api/docs` via `@nestjs/swagger`
- **Validation:** `class-validator` + global `ValidationPipe`
- **API prefix:** `/api/v1/`

### Modules

| Module | Responsibility |
|--------|---------------|
| `UsersModule` | CRUD users, competencies, availability |
| `TeamsModule` | CRUD teams, team membership |
| `ProjectsModule` | CRUD projects, linked to team |
| `StagesModule` | CRUD stages per project, reorder |
| `CardsModule` | CRUD cards, move between stages, reorder |
| `AiModule` | Spec import → draft cards; confirm → persist |

### API Endpoints

```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id/board
GET    /api/v1/projects/:id/stages
POST   /api/v1/projects/:id/stages
PATCH  /api/v1/stages/:id
DELETE /api/v1/stages/:id
GET    /api/v1/teams
POST   /api/v1/teams
GET    /api/v1/users
POST   /api/v1/cards
PATCH  /api/v1/cards/:id
DELETE /api/v1/cards/:id
POST   /api/v1/cards/:id/move      body: { stageId, order }
POST   /api/v1/ai/import           body: raw spec text
POST   /api/v1/ai/confirm          body: CardDraft[]
```

### Card Ordering

Order stored as integers with gaps (0, 100, 200…). `POST /api/v1/cards/:id/move` accepts `{ stageId, order }` and recalculates order values for affected cards in the target stage.

### Auth

No real auth. Every request carries an `X-User-Id` header. Backend reads the header and attaches the user to the request context. A `UserInterceptor` guards all routes and returns 400 if the header is missing or the user ID does not exist in the database.

### Database Seeding

A seed script (`npm run seed`) populates:
- 3 demo users with roles and competencies
- 1 team
- 1 project with 4 default stages (To Do, In Progress, Review, Done)
- 5 sample cards

---

## Data Model

### User
```
id          uuid PK
name        string
email       string unique
role        string
competencies string[]
availability string
```

### Team
```
id    uuid PK
name  string
```

### Project
```
id      uuid PK
name    string
teamId  uuid FK → Team
```

### Stage
```
id        uuid PK
projectId uuid FK → Project
name      string
order     int
```

### Card
```
id          uuid PK
projectId   uuid FK → Project
stageId     uuid FK → Stage
assigneeId  uuid FK → User (nullable)
summary     string
description text (nullable)
type        string
priority    string
order       int
dueDate     date (nullable)
createdAt   timestamp
updatedAt   timestamp
```

---

## Frontend (Next.js)

### Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules + global CSS variables
- **Drag and drop:** `@hello-pangea/dnd`
- **Data fetching:** Native fetch; Server Components for initial load, client fetch for mutations

### Color tokens (`styles/globals.css`)

```css
--color-indigo: #6366f1;   /* To Do columns */
--color-amber:  #f59e0b;   /* In Progress columns */
--color-green:  #22c55e;   /* Done columns */
--color-purple: #a855f7;   /* Review columns */
```

### Layout

Persistent sidebar (left) + main content area. Sidebar contains:
- App logo/name
- Projects list (active project highlighted)
- Teams link
- User switcher dropdown (bottom)

### Pages

| Route | Description |
|-------|-------------|
| `/projects` | Project list, create project |
| `/projects/[id]/board` | Board view with drag-and-drop |
| `/teams` | Team list and members |

### Component Tree

```
app/
  layout.tsx                  # Sidebar + content shell
  projects/
    page.tsx                  # ProjectList
    [id]/board/
      page.tsx                # BoardPage
components/
  layout/
    Sidebar.tsx               # Nav, project list, user switcher
  board/
    Board.tsx                 # DnD context, columns layout
    Column.tsx                # Stage header, card list, drop target
    Card.tsx                  # Summary, priority badge, assignee avatar
    CardModal.tsx             # Full card edit form
    AddCardButton.tsx
  ui/
    Badge.tsx                 # Priority / type badges
    Button.tsx
    Modal.tsx
lib/
  api.ts                      # Typed fetch wrappers
  types.ts                    # Frontend types mirroring API responses
```

### Drag and Drop

`DragDropContext` wraps `Board`. Each `Column` is a `Droppable`. Each `Card` is a `Draggable`. On drop:
1. Optimistic UI update (reorder local state immediately)
2. `POST /api/v1/cards/:id/move` in background
3. On error: revert local state and show error toast

### User Switcher

- Seeded users fetched from `GET /api/v1/users` on app load
- Selected user stored in `localStorage` as `userId`
- `X-User-Id: {userId}` attached to every API request in `lib/api.ts`

### AI Import UI

- "Import from spec" button on the board page
- Opens a modal with a textarea for pasting spec text
- On submit: calls `POST /api/v1/ai/import`, shows draft cards for review
- User can edit/remove drafts, then confirms → `POST /api/v1/ai/confirm`
- Cards appear on the board after confirmation

---

## Electron

### Dev Mode

`main.ts` creates a `BrowserWindow` (1280×800) and loads `http://localhost:3000`.

### Production

- Next.js built with `output: 'export'`
- Electron serves static files via `electron-serve`
- `electron-builder` produces platform installers

### Security

```ts
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
  }
})
```

`preload.ts` exposes no APIs for the prototype — `contextBridge` in place but empty.

---

## AI Module

### Interface

```ts
interface AiProvider {
  generateCards(input: string): Promise<CardDraft[]>;
}

interface CardDraft {
  summary: string;
  description: string;
  type: string;
  priority: string;
}
```

### Mock Provider

Returns 3 hardcoded `CardDraft` objects. Selected via `AI_PROVIDER=mock` in `.env`. This is the only provider built for the prototype.

### Real Provider (future)

Implement `ClaudeProvider` or `OpenAiProvider` satisfying `AiProvider`. Swap via `AI_PROVIDER=claude` or `AI_PROVIDER=openai` in `.env`. No other code changes needed.

---

## Testing

### Backend

- **Framework:** Jest (built into NestJS)
- **Unit tests:** Co-located `*.spec.ts` per service
- **Integration:** One test for card move order logic using SQLite in-memory

### Frontend

- **Framework:** Jest + React Testing Library
- **Unit tests:** `Card`, `Column`, `lib/api.ts`

### Electron

No tests — thin shell with no logic.

### Scripts

```bash
pnpm --filter backend test
pnpm --filter frontend test
```

---

## MVP Build Order

1. Database schema + migrations + seed
2. Backend modules + API endpoints
3. Frontend board UI (static, no drag-and-drop)
4. Drag and drop
5. AI import (mock provider)
6. AI real provider (future)
7. Electron shell

---

## Non-Goals (from spec)

- Real-time sync
- Comments
- Attachments
- Permissions / real auth
- Real AI provider (prototype uses mock only)
