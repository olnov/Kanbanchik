# Mattermost Login — Design

Date: 2026-06-20
Status: Approved (pending spec review)

## Goal

Let users authenticate with their Mattermost credentials as an alternative to the
existing local email/password login. The login form offers a separate "Sign in with
Mattermost" option. On success the user gets the same Kanbanchik session (JWT cookie)
as a local login.

## Decisions

- **Integration approach:** Direct credential proxy against the Mattermost
  [Login API](https://developers.mattermost.com/api-documentation/#/operations/Login)
  (`POST {server}/api/v4/users/login`). No OAuth redirect flow.
- **Server URL:** Single configured Mattermost instance via backend env var.
- **Account mapping:** Re-match returning users by stored `mattermostUserId`. For a
  first-time Mattermost user whose email already belongs to *any* existing account,
  reject and notify (no silent merge). Otherwise auto-provision (JIT) a new local user
  from the Mattermost profile.
- **Login UI:** Keep the local form; add a separate "Sign in with Mattermost" button
  that reveals a Mattermost credential panel.
- **Mixed login:** Provisioned accounts are Mattermost-only (no local password). Local
  login simply fails for them. No password-set flow in this scope.

## Architecture

```
[Login page] --(loginId, password)--> POST /auth/login/mattermost
   |                                       |
   |                              AuthService.loginWithMattermost
   |                                       |
   |                          MattermostService.authenticate
   |                                       |
   |                    POST {MATTERMOST_URL}/api/v4/users/login
   |                                       |  (200 -> MM profile)
   |              match-by-mattermostUserId / email-conflict / JIT-provision
   |                                       |
   |<-------- set access_token JWT cookie + return User <--
```

The Mattermost session token (returned in the `Token` response header) is used only to
confirm authentication succeeded; Kanbanchik mints its own JWT exactly as it does today.

## Components

### Backend

**Config** (`apps/backend/.env.example`, read via `ConfigService`)
- `MATTERMOST_URL` — base URL of the Mattermost server, e.g. `https://mattermost.example.com`.
- `MATTERMOST_ENABLED` — `true`/`false`; gates the feature on the backend side.

**`MattermostService`** (`apps/backend/src/modules/auth/mattermost.service.ts`)
- `authenticate(loginId: string, password: string): Promise<MattermostProfile>`
- POSTs JSON `{ login_id, password }` to `${MATTERMOST_URL}/api/v4/users/login` using `fetch`.
- On `200`: parse and return `{ id, email, firstName, lastName, username }` mapped from
  the Mattermost user object (`id`, `email`, `first_name`, `last_name`, `username`).
- On non-200 (incl. 401): throw `UnauthorizedException('Invalid Mattermost credentials')`.
- If `MATTERMOST_URL` is missing/feature disabled: throw a clear error
  (`ServiceUnavailableException`).
- Network/fetch failure: throw `ServiceUnavailableException('Mattermost unreachable')`.

**`AuthService.loginWithMattermost(loginId, password): Promise<User>`**
1. `profile = await mattermostService.authenticate(loginId, password)`.
2. Find local user by `mattermostUserId === profile.id`. If found: return it (normal
   returning-user login; no profile overwrite in this scope).
3. Otherwise find any user by `profile.email`. If found: throw
   `ConflictException('An account with this email already exists')` — do not merge or
   log in. (Collisions are not expected; the user is told to use their existing account.)
4. If neither match: create a `User` with `name = profile.firstName || profile.username`,
   `lastName = profile.lastName`, `email = profile.email`, `role: ''`,
   `passwordHash: ''`, `authProvider: 'mattermost'`,
   `mattermostUserId: profile.id`. Save and return.

**`User` entity** (`apps/backend/src/modules/users/user.entity.ts`) — two new columns:
- `authProvider: string` — default `'local'`.
- `mattermostUserId: string | null` — nullable, default `null`.

These apply automatically in dev via TypeORM `synchronize`.

**Controller** (`apps/backend/src/modules/auth/auth.controller.ts`)
- `POST /auth/login/mattermost` (`@Public()`), body `LoginMattermostDto { loginId, password }`.
- On success: `reply.setCookie('access_token', signToken(user.id), COOKIE_OPTIONS)` and
  return the `User` — identical cookie handling to the existing `login`.

**DTO** (`apps/backend/src/modules/auth/dto/login-mattermost.dto.ts`)
- `loginId: string` (non-empty), `password: string` (non-empty), with the same
  `class-validator` / Swagger decorator style as `LoginDto`.

**Module** (`auth.module.ts`): register `MattermostService` as a provider.

### Frontend

**`api.ts`**
- `loginMattermost: (loginId, password) => fetchJson<User>('/auth/login/mattermost',
  { method: 'POST', body: JSON.stringify({ loginId, password }) })`.

**Feature flag**
- `NEXT_PUBLIC_MATTERMOST_ENABLED` env var; the button renders only when it is `'true'`.
  Avoids an extra config round-trip.

**Login page** (`apps/frontend/src/app/(auth)/login/page.tsx`)
- Below the existing local sign-in form (and its register link), add a divider and a
  "Sign in with Mattermost" button (shown only when the flag is on).
- Clicking reveals a Mattermost panel: a **login ID** input (username or email), a
  **password** input, and a submit button.
- Submit calls `api.loginMattermost`, then `setCurrentUser(user)` and
  `router.replace('/projects')` — same success path as local login.
- Errors surface through the existing `error` state / styling.

## Error handling

- Invalid Mattermost credentials → `401` → form shows "Invalid Mattermost credentials".
- Mattermost unreachable / not configured → `503` → form shows a friendly message.
- Email of a first-time Mattermost user already belongs to an existing account → `409` →
  form shows "An account with this email already exists". No silent merge or login.

## Testing

- `MattermostService` unit tests (mock `fetch`): 200 → mapped profile; 401 → throws
  `UnauthorizedException`; network error → `ServiceUnavailableException`.
- `AuthService.loginWithMattermost` unit tests (mirroring `auth.service.spec.ts`):
  - provision path: no match by `mattermostUserId` or email → creates one with expected fields;
  - returning-user path: existing user with matching `mattermostUserId` → returns it,
    no duplicate created;
  - conflict path: no `mattermostUserId` match but email already exists → throws
    `ConflictException`, no user created.

## Out of scope

- OAuth2 / SSO redirect flow.
- Per-user / user-entered Mattermost server URLs.
- Password-set flow for provisioned accounts (Mattermost-only by design here).
- Syncing Mattermost profile changes back into Kanbanchik on later logins.
- MFA token field on the Mattermost login.
