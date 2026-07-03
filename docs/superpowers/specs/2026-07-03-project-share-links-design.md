# Project Share Links & Email Invitations — Design

**Date:** 2026-07-03
**Branch:** `feat/invitations`
**Status:** Approved (design), pending implementation plan

## Goal

Let project admins bring people onto a project board via a shared URL, covering two flows:

1. **Already a member** — user opens the link, is authenticated, and is already a
   project member → navigate straight to the project board.
2. **Not yet a member** — user opens the link and must authenticate first
   (register, existing-account login, or Mattermost), is then added to the
   project, and is navigated to the board.

Two kinds of link are supported:

- **Reusable project link** — one per project, admin toggles on/off, carries a
  role. Anyone who opens it and authenticates joins with that role.
- **Per-email invite (Trello-like)** — admin adds an email + role; a pending
  entry appears in the members list marked *"account not created yet"*. The
  invitee must authenticate with **the same email** to claim it. Deleting the
  pending entry invalidates its link. Single-use (consumed on acceptance).

## Requirements (locked during brainstorming)

| Decision | Choice |
| --- | --- |
| Link kinds | Both reusable link **and** per-email invites |
| Role granted | Chosen by admin at link/invite creation; carried by the link |
| Who can manage | Admins only (matches existing `addMember` guard) |
| Per-email lifecycle | Trello-like: add email → pending row; delete row → link dies; no expiry |
| Email match | Invitee **must** authenticate with the invited email |
| Reusable link lifecycle | On/off toggle, no expiry; regenerate replaces the token |
| Sign-up methods on join | Local register, existing-account login, Mattermost |
| Reusable links per project | Exactly one (regenerate replaces it), not multiple named links |

## Architecture

Two new TypeORM entities, reached through a single public `/join/:token`
resolver so the frontend has one join page and one entry point.

`project_members` is left untouched — only **real** memberships live there.
Pending invites live in their own table and are merged into the members view
for display only.

### Entities

**`ProjectShareLink`** — reusable link, one row per project:

- `id` (uuid)
- `projectId` (uuid, **unique** — one link per project)
- `token` (string, **unique**, high-entropy url-safe random ~32 bytes)
- `role` (`ProjectPermissionLevel`)
- `enabled` (boolean)
- `createdById` (uuid)
- `createdAt`

Toggle = flip `enabled`. Regenerate = replace `token`.

**`ProjectInvite`** — per-email invite, **unique on `(projectId, email)`**:

- `id` (uuid)
- `projectId` (uuid)
- `email` (string, stored lowercased)
- `role` (`ProjectPermissionLevel`)
- `token` (string, **unique**, high-entropy random)
- `invitedById` (uuid)
- `createdAt`

State is represented by existence, not a status column:

- **Pending** = row exists.
- **Claimed** = row deleted + `ProjectMember` created (single-use).
- **Revoked** = row deleted.

No expiry column for either entity.

## Backend API

### Admin management

Guarded by the existing `ProjectPermissionGuard` +
`@RequireProjectPermission(ProjectPermissionLevel.ADMIN)`.

- `GET /projects/:id/members` — **extended** response shape to
  `{ members, invites, myPermission }` so pending invites render inline.
- `POST /projects/:id/invites` `{ email, role }` — validates the email is not
  already a member or an existing invite; creates a `ProjectInvite`; returns it
  including the join URL.
- `DELETE /projects/:id/invites/:inviteId` — revoke (invalidates the link).
- `GET /projects/:id/share-link` — returns the link or `null`.
- `PUT /projects/:id/share-link` `{ role, enabled }` — upsert / toggle / set
  role. Optional `?regenerate=true` rotates the token.

### Public join flow

New small controller.

- `GET /join/:token` `@Public()` — resolves the token to an invite or a share
  link. Returns a **safe preview only**:
  `{ projectName, kind: 'invite' | 'link', invitedEmail? }`.
  Unknown / disabled / revoked token → `404`. No board data is exposed before
  acceptance.
- `POST /join/:token/accept` (authenticated) — the core resolver:
  - **Invite kind:** require `currentUser.email === invite.email`
    (case-insensitive). Mismatch → `403` with a clear message. On match: create
    membership with `invite.role` (idempotent if already a member), delete the
    invite, return `{ projectId }`.
  - **Link kind:** require `enabled`. Create membership with `link.role` if not
    already a member (idempotent), return `{ projectId }`.
  - **Idempotency is what makes Flow 1 work** — an existing member who accepts
    simply gets `{ projectId }` back and is routed to the board. Accepting never
    downgrades an existing member's role.

## Frontend

### Join page — `app/join/[token]/page.tsx`

Its own page, **not** under the auth-guarded `(main)` route group, so
unauthenticated users can reach it.

1. `GET /join/:token` for the preview. Unknown/disabled → *"This link is no
   longer valid."*
2. Read auth via `useAuth()`:
   - **Authenticated** → immediately `POST /join/:token/accept`.
     - Success → `router.replace('/projects/:projectId/board')` (Flow 1, and
       the tail of Flow 2).
     - `403` email mismatch → *"This invite is for `invited@x.com`, but you're
       signed in as `you@y.com`"* + a "Log out & switch account" button.
   - **Not authenticated** → inline auth panel reusing the existing login
     accordion pattern (Email/password · Mattermost) plus a Register form. For
     an **invite**, the email field is **prefilled and locked** to the invited
     address (UI enforcement of the must-match rule; the server enforces it
     too). After any successful auth, call `accept`, then redirect to the board
     (Flow 2).

### Admin UI — extend `ProjectSettingsModal`

- An "Invite by email" row (email + role + Send) alongside the existing "add
  member by name" row.
- Pending invites listed under members with an **"account not created yet"**
  badge and a **Revoke** button (`DELETE …/invites/:id`).
- A "Share link" section: on/off toggle, role selector, copy-to-clipboard,
  regenerate.

### API client (`lib/api.ts`)

New methods: `getInvites` / `createInvite` / `revokeInvite`,
`getShareLink` / `saveShareLink`, `getJoinPreview`, `acceptJoin`. The extended
`getProjectMembers` response also carries `invites`.

## Security

- Tokens are high-entropy random values (not project IDs), so join URLs are not
  guessable or enumerable.
- The preview endpoint leaks only the project name and invited email — never
  board contents — before acceptance.
- The server is the source of truth for the email-match rule and the `enabled`
  state; frontend email locking is convenience only.
- Accept is idempotent and never downgrades an existing member's role.

## Testing

Following the existing `*.service.spec.ts` style:

- Accept as existing member is idempotent (→ Flow 1).
- Invite accepted with matching email creates membership + consumes invite.
- Invite accepted with mismatched email is rejected (`403`).
- Disabled share link is rejected.
- Revoked / unknown invite token is rejected.
- Role from the link/invite is applied to the new membership.
- Single-use: an invite cannot be accepted twice.
- Guard coverage: only admins can create/revoke invites and manage the share
  link.

## Out of scope (YAGNI)

- Expiry dates on links or invites.
- Multiple named reusable links per project.
- Usage caps on the reusable link.
- Email delivery of invitations (invite URL is surfaced in the UI for the admin
  to share manually).
