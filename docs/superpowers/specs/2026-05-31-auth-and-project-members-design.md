# Auth & Project Member Management — Design Spec

**Date:** 2026-05-31
**Status:** Approved

---

## Overview

Two closely related features built together:

1. **Real authentication** — JWT-based login/register with httpOnly cookies, replacing the mock `X-User-Id` header mechanism.
2. **Project member management** — a per-project settings page where project admins add users, assign roles (VIEWER / COLLABORATOR / ADMIN), and remove members.

---

## Decisions Summary

| Topic | Decision |
|---|---|
| Auth mechanism | JWT in httpOnly cookie (`access_token`) |
| Password storage | bcrypt, cost factor 10, stored as `passwordHash` on User |
| JWT payload | `{ sub: userId }` only — full user looked up from DB per request |
| Cookie settings | `httpOnly: true`, `sameSite: strict`, `path: /`, session cookie (no expiry) |
| Cookie parsing | `@fastify/cookie` registered in `main.ts` |
| Registration fields | name, lastName, email, password — no role (assigned by project admin) |
| Team model | Dropped: `Team`, `team_members`, `ProjectTeamPermission`. Added: `ProjectMember(projectId, userId, role)` |
| Permission resolution | `createdById` match → ADMIN; else `ProjectMember.role`; no match → 403 |
| Project Settings location | `/projects/:id/settings` page (not a modal), linked from gear icon on board header |
| Role of creator | Always ADMIN via `createdById`; no `ProjectMember` row created; row/controls locked in UI |
| Teams page | Removed from sidebar and codebase |

---

## Data Model

### Dropped

- `Team` entity and `teams` table
- `team_members` junction table
- `ProjectTeamPermission` entity and `project_team_permissions` table

### Modified

**`users` table — add column:**
```
passwordHash  varchar  NOT NULL
```
`passwordHash` is never returned in any API response.

**`projects` table — remove column:**
```
teamId  (dropped — no longer references a Team)
```
`createdById` is kept. It is the sole source of "this user owns the project."

### Added

**`project_members` table:**
```
id          uuid PK
projectId   uuid FK → projects  ON DELETE CASCADE
userId      uuid FK → users     ON DELETE CASCADE
role        enum('viewer','collaborator','admin')  DEFAULT 'viewer'
UNIQUE(projectId, userId)
```

### Permission resolution (PermissionService)

```
getUserProjectPermission(userId, projectId):
  1. Load project; if not found → null
  2. If project.createdById === userId → ADMIN
  3. Find ProjectMember where projectId + userId
  4. If found → return member.role
  5. Not found → null (no access)

getAccessibleProjectIds(userId):
  - Projects where createdById = userId
  - UNION projects where ProjectMember(userId) exists
```

---

## Backend

### AuthModule  (`src/modules/auth/`)

**Files:**
```
auth.module.ts
auth.controller.ts
auth.service.ts
dto/register.dto.ts
dto/login.dto.ts
```

**Endpoints** — all `@Public()`:

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/auth/register` | `{ name, lastName, email, password }` | User (no passwordHash) + set cookie |
| `POST` | `/auth/login` | `{ email, password }` | User (no passwordHash) + set cookie |
| `POST` | `/auth/logout` | — | 200 + clear cookie |
| `GET` | `/auth/me` | — | User (no passwordHash) — **requires auth** |

**Register flow:**
1. Check email uniqueness — 409 if taken
2. Hash password with bcrypt (cost 10)
3. Save user
4. Sign JWT `{ sub: user.id }`
5. Set `access_token` cookie, return user

**Login flow:**
1. Find user by email — 401 if not found
2. `bcrypt.compare(password, user.passwordHash)` — 401 if mismatch
3. Sign JWT, set cookie, return user

**Logout:** Reply sets `access_token` cookie with `maxAge: 0` to clear it.

**Cookie shape:**
```ts
reply.setCookie('access_token', token, {
  httpOnly: true,
  sameSite: 'strict',
  path: '/',
});
```

### UserGuard — updated

Reads `request.cookies.access_token` instead of `request.headers['x-user-id']`.

```
1. If @Public() → pass through
2. Extract cookie; missing → 401 Unauthorized
3. Verify JWT; invalid/expired → 401
4. Look up user by payload.sub; not found → 401
5. Set request.currentUser = user
```

`X-User-Id` logic removed entirely. `UserInterceptor` file deleted.

**`main.ts`:** register `@fastify/cookie` before the app listens.

### ProjectsModule — ProjectMember endpoints

Added to `ProjectsController`:

| Method | Path | Guard | Description |
|---|---|---|---|
| `GET` | `/projects/:id/members` | VIEWER+ | List members with roles |
| `POST` | `/projects/:id/members` | ADMIN | Add member (`{ userId, role? }`, default: viewer) |
| `PATCH` | `/projects/:id/members/:userId` | ADMIN | Update role (`{ role }`) |
| `DELETE` | `/projects/:id/members/:userId` | ADMIN | Remove member |

**Service rules:**
- Creator (`project.createdById`) cannot be targeted by PATCH or DELETE — service throws 400
- Adding an existing member returns 409
- `getBoard()` continues to include `myPermission` in the response

**`ProjectsService.create()`** — removes team creation logic, sets `createdById` only. No `ProjectMember` row created for the creator (their access comes from `createdById`).

### Removed

- `TeamsModule`, `team.entity.ts`, `teams.controller.ts`, `teams.service.ts`, `teams/dto/`
- `ProjectTeamPermission` entity and all references
- `ProjectTeamPermissionDto`, `SetProjectTeamPermissionsDto`
- `PATCH /projects/:id/team-permissions` endpoint
- `GET/POST /teams`, `POST/DELETE /teams/:id/members` endpoints
- `@Public()` from `GET /users` (requires auth now)

**`PermissionsModule` update:** remove `Team` and `ProjectTeamPermission` from `TypeOrmModule.forFeature()`; add `ProjectMember`. `PermissionService` rewrites its queries to use `ProjectMember` directly.

### Dependencies

```
@nestjs/jwt
@nestjs/passport (optional — can use jwt directly)
bcrypt + @types/bcrypt
@fastify/cookie
```

---

## Frontend

### New pages

**`/login`** (`app/login/page.tsx`)
- Outside `AppShell` (no sidebar)
- Form: email, password
- On submit: `POST /auth/login`; on success redirect to `/projects`
- Link to `/register`

**`/register`** (`app/register/page.tsx`)
- Outside `AppShell` (no sidebar)
- Form: name, lastName, email, password
- On submit: `POST /auth/register`; on success redirect to `/projects`
- Link to `/login`

Both pages use a centered card layout consistent with the app's indigo/surface color tokens.

**`/projects/:id/settings`** (`app/projects/[id]/settings/page.tsx`)
- Inside `AppShell` (sidebar visible)
- Header: "Project Settings — {name}" + "← Back to board" link
- Members table: name, role selector (ADMIN only) or read-only role label, remove button (ADMIN only)
- Creator row shows role "Admin" with "owner — locked" label; no controls
- "Add Member" searchable select populated from `GET /users`, filtered to exclude existing members; defaults to VIEWER on add
- Non-admin users see read-only member list only

### AuthContext  (`src/contexts/AuthContext.tsx`)

```ts
interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}
```

- On mount: calls `GET /auth/me`; sets `currentUser` or null
- `login()`: calls `POST /auth/login`, sets `currentUser`
- `logout()`: calls `POST /auth/logout`, sets `currentUser` to null, redirects to `/login`
- Provided at the root layout level

### RequireAuth  (`src/components/auth/RequireAuth.tsx`)

Client component wrapping the `AppShell`. While `loading` is true, renders nothing (prevents flash). Once resolved: if `currentUser` is null, redirects to `/login`; otherwise renders children.

Excluded routes: `/login`, `/register`.

### Sidebar — changes

- Remove user-switcher `<select>` and all related state (`users`, `userId`, `handleUserChange`)
- Remove `GET /users` call from sidebar
- Remove Teams nav link
- Add at the bottom: logged-in user's name + role label + "Log out" button (calls `AuthContext.logout`)

### `api.ts` — changes

- Add `credentials: 'include'` to all `fetch` calls (browser sends cookie automatically)
- Remove `X-User-Id` header logic, `ensureUserId()`, `getStoredUserId()`, `setStoredUserId()`, user cache
- Add: `api.login(email, password)`, `api.register(data)`, `api.logout()`, `api.me()`
- Add: `api.getProjectMembers(projectId)`, `api.addProjectMember(projectId, userId, role?)`, `api.updateProjectMemberRole(projectId, userId, role)`, `api.removeProjectMember(projectId, userId)`
- Remove: team-related calls (`getTeams`, `setProjectTeamPermissions`)
- `getProjects()` no longer needs userId (backend reads from JWT)

### `types.ts` — changes

- Remove: `Team`, `ProjectPermissionLevel` (re-exported from backend enum — define inline)
- Add: `ProjectMember { id, projectId, userId, role, user?: User }`
- Update: `Project` — remove `teamId`
- Add: `ProjectPermissionLevel = 'viewer' | 'collaborator' | 'admin'`

---

## Removed from Frontend

- `src/lib/user-context.ts` (localStorage user ID storage)
- `src/app/teams/page.tsx`
- Teams link in Sidebar
- User switcher in Sidebar

---

## Build Order

1. Backend: data model (drop Team/ProjectTeamPermission, add ProjectMember, add passwordHash)
2. Backend: AuthModule (register/login/logout/me, bcrypt, JWT, cookie)
3. Backend: UserGuard update (cookie + JWT instead of X-User-Id)
4. Backend: ProjectMember endpoints + PermissionService update
5. Backend: remove TeamsModule and all references
6. Frontend: `api.ts` refactor (credentials, remove X-User-Id, add auth/member calls)
7. Frontend: AuthContext + RequireAuth
8. Frontend: login + register pages
9. Frontend: Sidebar update (remove switcher/teams, add user + logout)
10. Frontend: Project Settings page (member management)
