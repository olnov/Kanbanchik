[![CI](https://github.com/olnov/Kanbanchik/actions/workflows/ci.yml/badge.svg)](https://github.com/olnov/Kanbanchik/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/olnov/Kanbanchik)](./LICENSE)
[![Latest release](https://img.shields.io/github/v/release/olnov/Kanbanchik)](https://github.com/olnov/Kanbanchik/releases)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/olnov/Kanbanchik/pulls)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)

# Kanbanchik

Kanbanchik is a small kanban workspace built as a pnpm monorepo. It includes a Next.js frontend, a NestJS backend, PostgreSQL persistence, drag-and-drop boards, AI-assisted import of tasks from project specifications, and an Electron shell for packaging the app as a desktop client.

## What is in the repo

- `apps/frontend` - Next.js 16 application served on `http://localhost:3000`
- `apps/backend` - NestJS + TypeORM API served on `http://localhost:3001/api/v1`
- `apps/electron` - Electron wrapper for desktop packaging
- `docker-compose.yml` - full local stack: frontend, backend, postgres
- `docker-compose.infra.yml` - postgres only, useful for local development with separate app processes

## Current capabilities

- Project and board management with default columns: `To Do`, `In Progress`, `Review`, `Done`
- Card creation, editing, deletion, and drag-and-drop reordering
- Soft delete for projects together with their stages and cards
- Demo bootstrap for empty development databases
- AI import of backlog items from a project specification
- Deterministic extraction of markdown task sections shaped like `## Task: ...`
- Swagger docs at `http://localhost:3001/api/docs`

## Tech stack

- Frontend: Next.js, React 19, `@hello-pangea/dnd`
- Backend: NestJS, TypeORM, PostgreSQL, Fastify
- Tooling: pnpm workspaces, Jest, TypeScript
- AI: `mock` provider by default, optional Groq provider

## License

MIT. See [LICENSE](./LICENSE).

## Quick start with Docker

1. Install Docker and Docker Compose.
2. Create a root `.env` from [`.env.example`](./.env.example).
3. From the repo root run:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`
- Postgres: `localhost:5432`

The Docker backend starts with `AUTO_SEED_DEMO=true`, so an empty database is populated with demo users, a demo project, stages, and cards.

## Local development

### Prerequisites

- Node.js 22+
- pnpm
- Docker for local Postgres, or your own PostgreSQL instance

### Install dependencies

```bash
pnpm install
```

### Start only Postgres

Create a root `.env` from [`.env.example`](./.env.example), then run:

```bash
docker compose -f docker-compose.infra.yml up -d
```

### Configure backend

Create `apps/backend/.env` from [`apps/backend/.env.example`](./apps/backend/.env.example).

Note: the root `.env` is for Docker Compose. The backend `.env` is for running `pnpm dev:backend` directly on your machine, so its `DATABASE_URL` uses `localhost` instead of the Docker service hostname `postgres`.

Default local values:

```env
DATABASE_URL=postgresql://kanbanchik:kanbanchik@localhost:5432/kanbanchik
PORT=3001
NODE_ENV=development
AI_PROVIDER=mock
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
AUTO_SEED_DEMO=true
MATTERMOST_ENABLED=false
MATTERMOST_URL=
```

### Mattermost login (optional)

Users can sign in with their Mattermost credentials as an alternative to local
email/password. To enable it:

1. Set `MATTERMOST_ENABLED=true` and `MATTERMOST_URL=https://your-mattermost-host` in `apps/backend/.env`.
2. Set `NEXT_PUBLIC_MATTERMOST_ENABLED=true` for the frontend (e.g. in `apps/frontend/.env.local`).
3. Restart both apps.

On first login, a Kanbanchik account is provisioned automatically from the Mattermost
profile. Returning users are matched by their Mattermost user id. If a Mattermost
profile's email already belongs to an existing account, the login is rejected so accounts
are never silently merged.

### Run apps

In separate terminals:

```bash
pnpm dev:backend
pnpm dev:frontend
```

Optional Electron shell:

```bash
pnpm dev:electron
```

## AI import

The AI import endpoint accepts raw specification text and creates draft cards for review before saving them to a board.

### Best input format

For the most predictable results, use explicit markdown task sections:

```md
## Task: Implement User Authentication

**Priority:** High

**Description:**
Type: Backend

Implement user registration, login, and JWT session handling.
```

If the input contains `## Task:` sections, the backend extracts them one-to-one without asking the model to compress them. This is the recommended format for structured backlogs such as [`energy_widget_project_specification.md`](./energy_widget_project_specification.md).

### Groq setup

To use Groq instead of the mock provider:

1. Set `AI_PROVIDER=groq` in `apps/backend/.env`
2. Set `GROQ_API_KEY`
3. Restart the backend

If `AI_PROVIDER=mock`, the import flow returns demo cards instead of real model output.

## Demo data and maintenance scripts

Useful backend commands:

```bash
pnpm --filter backend ensure-demo
pnpm --filter backend seed
pnpm --filter backend test
pnpm --filter backend build
```

Useful frontend commands:

```bash
pnpm --filter frontend test
pnpm --filter frontend build
```

Run all workspace tests or builds:

```bash
pnpm test
pnpm build
```

## Notes

- The backend uses `synchronize` in development, so entity changes are applied automatically after a backend restart.
- Soft-deleted projects are hidden from normal queries and from the board list.
- The frontend keeps a lightweight browser-side active-user context via `x-user-id`.
