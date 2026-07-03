# Project Share Links & Email Invitations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let project admins invite people to a board via a shared URL — a reusable per-project link and per-email (Trello-like) invites — routing existing members straight to the board and new users through registration/login first.

**Architecture:** Two new TypeORM entities (`ProjectShareLink`, `ProjectInvite`) hold link state; `project_members` is untouched. A single public `/join/:token` resolver previews and accepts either kind. The frontend gets one `/join/[token]` page plus invite/share-link controls in the existing project settings modal.

**Tech Stack:** NestJS + Fastify + TypeORM (PostgreSQL), Jest (backend). Next.js App Router + React 19 (frontend). Cookie-based JWT auth already in place.

## Global Constraints

- Backend DB schema is managed by TypeORM `synchronize: true` in development (no migration files) — new entities auto-create their tables once registered in a module's `TypeOrmModule.forFeature`. Entities are auto-discovered by the glob `__dirname + '/**/*.entity{.ts,.js}'`.
- Roles are the existing enum `ProjectPermissionLevel` = `viewer` | `collaborator` | `admin`.
- Admin-only endpoints use `@UseGuards(ProjectPermissionGuard)` + `@RequireProjectPermission(ProjectPermissionLevel.ADMIN)`.
- Public (unauthenticated) endpoints use the `@Public()` decorator; all other routes require a valid `access_token` cookie (enforced globally by `UserGuard`).
- Authenticated handlers read the user from `@Req() req: { currentUser: User }`.
- Backend tests: `pnpm --filter backend test` (Jest, `testRegex: .*\.spec\.ts$`). Follow the existing repository-mock style in `projects.service.spec.ts`.
- Emails are compared/stored case-insensitively (lowercased).
- The project creator (`project.createdById`) is an implicit admin with no `project_members` row.
- Frontend has no component test harness — only pure utils are unit-tested. Frontend tasks are verified with `pnpm --filter frontend build` (typecheck + lint) and manual flow checks.
- Commit messages follow Conventional Commits (enforced by commitlint): `feat:`, `test:`, `refactor:`, etc.

---

### Task 1: New entities + token helper

**Files:**
- Create: `apps/backend/src/modules/projects/project-share-link.entity.ts`
- Create: `apps/backend/src/modules/projects/project-invite.entity.ts`
- Create: `apps/backend/src/common/token.ts`
- Create: `apps/backend/src/common/token.spec.ts`
- Modify: `apps/backend/src/modules/projects/projects.module.ts`

**Interfaces:**
- Produces: `generateToken(): string` (url-safe, ≥32 chars).
- Produces entity `ProjectShareLink { id, projectId, token, role, enabled, createdById, createdAt }`.
- Produces entity `ProjectInvite { id, projectId, email, role, token, invitedById, createdAt }`.

- [ ] **Step 1: Write the failing test for the token helper**

Create `apps/backend/src/common/token.spec.ts`:

```typescript
import { generateToken } from './token';

describe('generateToken', () => {
  it('produces a url-safe string of at least 32 chars', () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(32);
  });

  it('produces unique values', () => {
    expect(generateToken()).not.toEqual(generateToken());
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter backend test -- token.spec`
Expected: FAIL — cannot find module `./token`.

- [ ] **Step 3: Implement the token helper**

Create `apps/backend/src/common/token.ts`:

```typescript
import { randomBytes } from 'crypto';

/** High-entropy, url-safe join token (not guessable / enumerable). */
export function generateToken(): string {
  return randomBytes(24).toString('base64url');
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter backend test -- token.spec`
Expected: PASS.

- [ ] **Step 5: Create the `ProjectShareLink` entity**

Create `apps/backend/src/modules/projects/project-share-link.entity.ts`:

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { ProjectPermissionLevel } from './project-member.entity';

@Entity('project_share_links')
@Unique(['projectId'])
export class ProjectShareLink {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  projectId: string;

  @ApiProperty()
  @Column({ unique: true })
  token: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @Column({ type: 'enum', enum: ProjectPermissionLevel, default: ProjectPermissionLevel.VIEWER })
  role: ProjectPermissionLevel;

  @ApiProperty()
  @Column({ default: true })
  enabled: boolean;

  @ApiProperty()
  @Column('uuid')
  createdById: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
```

- [ ] **Step 6: Create the `ProjectInvite` entity**

Create `apps/backend/src/modules/projects/project-invite.entity.ts`:

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { ProjectPermissionLevel } from './project-member.entity';

@Entity('project_invites')
@Unique(['projectId', 'email'])
export class ProjectInvite {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  projectId: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @Column({ type: 'enum', enum: ProjectPermissionLevel, default: ProjectPermissionLevel.VIEWER })
  role: ProjectPermissionLevel;

  @ApiProperty()
  @Column({ unique: true })
  token: string;

  @ApiProperty()
  @Column('uuid')
  invitedById: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
```

- [ ] **Step 7: Register the entities in the projects module**

In `apps/backend/src/modules/projects/projects.module.ts`, add the imports and extend `forFeature`:

```typescript
import { ProjectShareLink } from './project-share-link.entity';
import { ProjectInvite } from './project-invite.entity';
```

Change the `TypeOrmModule.forFeature` array to:

```typescript
TypeOrmModule.forFeature([Project, ProjectMember, Stage, Card, User, ProjectShareLink, ProjectInvite]),
```

- [ ] **Step 8: Verify the backend still compiles**

Run: `pnpm --filter backend build`
Expected: build succeeds (no type errors).

- [ ] **Step 9: Commit**

```bash
git add apps/backend/src/common/token.ts apps/backend/src/common/token.spec.ts \
  apps/backend/src/modules/projects/project-share-link.entity.ts \
  apps/backend/src/modules/projects/project-invite.entity.ts \
  apps/backend/src/modules/projects/projects.module.ts
git commit -m "feat(invitations): add share link and invite entities with token helper"
```

---

### Task 2: DTOs for invites and share link

**Files:**
- Create: `apps/backend/src/modules/projects/dto/create-invite.dto.ts`
- Create: `apps/backend/src/modules/projects/dto/save-share-link.dto.ts`

**Interfaces:**
- Produces: `CreateInviteDto { email: string; role?: ProjectPermissionLevel }`.
- Produces: `SaveShareLinkDto { role: ProjectPermissionLevel; enabled: boolean }`.

- [ ] **Step 1: Create `CreateInviteDto`**

Create `apps/backend/src/modules/projects/dto/create-invite.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class CreateInviteDto {
  @ApiProperty() @IsEmail() email: string;

  @ApiProperty({ enum: ProjectPermissionLevel, required: false })
  @IsEnum(ProjectPermissionLevel) @IsOptional()
  role?: ProjectPermissionLevel;
}
```

- [ ] **Step 2: Create `SaveShareLinkDto`**

Create `apps/backend/src/modules/projects/dto/save-share-link.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class SaveShareLinkDto {
  @ApiProperty({ enum: ProjectPermissionLevel })
  @IsEnum(ProjectPermissionLevel)
  role: ProjectPermissionLevel;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}
```

- [ ] **Step 3: Verify compilation**

Run: `pnpm --filter backend build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/projects/dto/create-invite.dto.ts \
  apps/backend/src/modules/projects/dto/save-share-link.dto.ts
git commit -m "feat(invitations): add invite and share-link DTOs"
```

---

### Task 3: Invite service methods

**Files:**
- Modify: `apps/backend/src/modules/projects/projects.service.ts`
- Modify: `apps/backend/src/modules/projects/projects.service.spec.ts`

**Interfaces:**
- Consumes: `generateToken` (Task 1), `CreateInviteDto` (Task 2), `ProjectInvite` entity (Task 1).
- Produces:
  - `createInvite(projectId: string, dto: CreateInviteDto): Promise<ProjectInvite>`
  - `getInvites(projectId: string): Promise<ProjectInvite[]>`
  - `revokeInvite(projectId: string, inviteId: string): Promise<void>`

- [ ] **Step 1: Write failing tests for invite creation**

In `apps/backend/src/modules/projects/projects.service.spec.ts`, first register the two new repositories in the test module. Add these mock objects near the other mocks (after `mockPermissionService`):

```typescript
const mockInviteRepo = {
  findOne: jest.fn().mockResolvedValue(null),
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'invite-1', ...v })),
  delete: jest.fn().mockResolvedValue(undefined),
};
const mockShareLinkRepo = {
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'link-1', ...v })),
};
```

Add these providers inside `Test.createTestingModule({ providers: [...] })` (import the entities at the top of the file):

```typescript
{ provide: getRepositoryToken(ProjectShareLink), useValue: mockShareLinkRepo },
{ provide: getRepositoryToken(ProjectInvite), useValue: mockInviteRepo },
```

Add imports at the top:

```typescript
import { ProjectShareLink } from './project-share-link.entity';
import { ProjectInvite } from './project-invite.entity';
```

Reset the new mocks in `beforeEach` after `jest.clearAllMocks()`:

```typescript
mockInviteRepo.findOne.mockResolvedValue(null);
mockInviteRepo.find.mockResolvedValue([]);
mockMemberRepoForInvite.findOne.mockResolvedValue(null);
```

Add a shared member-repo mock for the injected `ProjectMember` repo used by new methods. Replace the existing inline `ProjectMember` provider `{ find: jest.fn()... }` with a named mock declared near the others:

```typescript
const mockMemberRepoForInvite = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'member-1', ...v })),
  delete: jest.fn().mockResolvedValue(undefined),
};
```

and change the provider to `{ provide: getRepositoryToken(ProjectMember), useValue: mockMemberRepoForInvite }`.

Now add the test block:

```typescript
describe('createInvite', () => {
  it('lowercases the email and stores a token', async () => {
    mockRepo.findOneByOrFail.mockResolvedValue(mockProject);
    const invite = await service.createInvite('proj-1', {
      email: 'Person@Example.com', role: ProjectPermissionLevel.COLLABORATOR,
    });
    expect(mockInviteRepo.save).toHaveBeenCalled();
    const saved = mockInviteRepo.create.mock.calls[0][0];
    expect(saved.email).toBe('person@example.com');
    expect(saved.token).toEqual(expect.any(String));
    expect(saved.role).toBe(ProjectPermissionLevel.COLLABORATOR);
    expect(invite.id).toBe('invite-1');
  });

  it('rejects an email that already has an invite', async () => {
    mockInviteRepo.findOne.mockResolvedValue({ id: 'invite-x' });
    await expect(
      service.createInvite('proj-1', { email: 'dup@example.com' }),
    ).rejects.toThrow('already been invited');
  });

  it('rejects an email that already belongs to a member', async () => {
    mockUserRepo.findOneBy.mockResolvedValue({ id: 'user-9', email: 'member@example.com' });
    mockMemberRepoForInvite.findOne.mockResolvedValue({ id: 'm1', userId: 'user-9' });
    await expect(
      service.createInvite('proj-1', { email: 'member@example.com' }),
    ).rejects.toThrow('already a member');
  });
});
```

Note: the `User` repo provider must be a named mock so tests can drive it. Replace `{ provide: getRepositoryToken(User), useValue: { findOneBy: jest.fn() } }` with a named mock:

```typescript
const mockUserRepo = { findOneBy: jest.fn().mockResolvedValue(null) };
```

and reset it in `beforeEach`: `mockUserRepo.findOneBy.mockResolvedValue(null);`

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter backend test -- projects.service`
Expected: FAIL — `service.createInvite is not a function`.

- [ ] **Step 3: Implement the invite service methods**

In `apps/backend/src/modules/projects/projects.service.ts`, add imports:

```typescript
import { ProjectShareLink } from './project-share-link.entity';
import { ProjectInvite } from './project-invite.entity';
import { CreateInviteDto } from './dto/create-invite.dto';
import { generateToken } from '../../common/token';
```

Inject the two new repositories in the constructor (add after the `userRepo` line):

```typescript
@InjectRepository(ProjectShareLink) private readonly shareLinkRepo: Repository<ProjectShareLink>,
@InjectRepository(ProjectInvite) private readonly inviteRepo: Repository<ProjectInvite>,
```

Add the methods:

```typescript
async createInvite(projectId: string, dto: CreateInviteDto): Promise<ProjectInvite> {
  await this.projectRepo.findOneByOrFail({ id: projectId });
  const email = dto.email.trim().toLowerCase();

  const existingInvite = await this.inviteRepo.findOne({ where: { projectId, email } });
  if (existingInvite) throw new ConflictException('This email has already been invited');

  const existingUser = await this.userRepo.findOneBy({ email });
  if (existingUser) {
    const member = await this.memberRepo.findOne({ where: { projectId, userId: existingUser.id } });
    const project = await this.projectRepo.findOneByOrFail({ id: projectId });
    if (member || project.createdById === existingUser.id) {
      throw new ConflictException('This user is already a member of the project');
    }
  }

  return this.inviteRepo.save(
    this.inviteRepo.create({
      projectId,
      email,
      role: dto.role ?? ProjectPermissionLevel.VIEWER,
      token: generateToken(),
      invitedById: projectId, // placeholder overwritten below
    }),
  );
}

getInvites(projectId: string): Promise<ProjectInvite[]> {
  return this.inviteRepo.find({ where: { projectId }, order: { createdAt: 'ASC' } });
}

async revokeInvite(projectId: string, inviteId: string): Promise<void> {
  await this.inviteRepo.delete({ id: inviteId, projectId });
}
```

Note on `invitedById`: the controller passes the current user id — update the signature to accept it. Change `createInvite` signature to `createInvite(projectId: string, dto: CreateInviteDto, invitedById: string)` and set `invitedById` from the parameter instead of the placeholder. Update the test calls to pass a third arg `'user-1'`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter backend test -- projects.service`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/projects/projects.service.ts \
  apps/backend/src/modules/projects/projects.service.spec.ts
git commit -m "feat(invitations): add invite create/list/revoke service methods"
```

---

### Task 4: Share link service methods

**Files:**
- Modify: `apps/backend/src/modules/projects/projects.service.ts`
- Modify: `apps/backend/src/modules/projects/projects.service.spec.ts`

**Interfaces:**
- Consumes: `generateToken`, `SaveShareLinkDto`, `ProjectShareLink`, `shareLinkRepo` (Task 3 constructor injection).
- Produces:
  - `getShareLink(projectId: string): Promise<ProjectShareLink | null>`
  - `saveShareLink(projectId: string, dto: SaveShareLinkDto, createdById: string, regenerate: boolean): Promise<ProjectShareLink>`

- [ ] **Step 1: Write failing tests**

Add to `projects.service.spec.ts`:

```typescript
describe('saveShareLink', () => {
  it('creates a new link when none exists', async () => {
    mockShareLinkRepo.findOne.mockResolvedValue(null);
    const link = await service.saveShareLink(
      'proj-1', { role: ProjectPermissionLevel.VIEWER, enabled: true }, 'user-1', false,
    );
    expect(mockShareLinkRepo.create).toHaveBeenCalled();
    const created = mockShareLinkRepo.create.mock.calls[0][0];
    expect(created.token).toEqual(expect.any(String));
    expect(created.projectId).toBe('proj-1');
    expect(link.id).toBe('link-1');
  });

  it('updates role/enabled but keeps the token when not regenerating', async () => {
    mockShareLinkRepo.findOne.mockResolvedValue({
      id: 'link-1', projectId: 'proj-1', token: 'keep-me',
      role: ProjectPermissionLevel.VIEWER, enabled: true, createdById: 'user-1',
    });
    await service.saveShareLink(
      'proj-1', { role: ProjectPermissionLevel.ADMIN, enabled: false }, 'user-1', false,
    );
    const saved = mockShareLinkRepo.save.mock.calls[0][0];
    expect(saved.token).toBe('keep-me');
    expect(saved.role).toBe(ProjectPermissionLevel.ADMIN);
    expect(saved.enabled).toBe(false);
  });

  it('rotates the token when regenerate is true', async () => {
    mockShareLinkRepo.findOne.mockResolvedValue({
      id: 'link-1', projectId: 'proj-1', token: 'old-token',
      role: ProjectPermissionLevel.VIEWER, enabled: true, createdById: 'user-1',
    });
    await service.saveShareLink(
      'proj-1', { role: ProjectPermissionLevel.VIEWER, enabled: true }, 'user-1', true,
    );
    const saved = mockShareLinkRepo.save.mock.calls[0][0];
    expect(saved.token).not.toBe('old-token');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter backend test -- projects.service`
Expected: FAIL — `service.saveShareLink is not a function`.

- [ ] **Step 3: Implement the methods**

Add import in `projects.service.ts`:

```typescript
import { SaveShareLinkDto } from './dto/save-share-link.dto';
```

Add methods:

```typescript
getShareLink(projectId: string): Promise<ProjectShareLink | null> {
  return this.shareLinkRepo.findOne({ where: { projectId } });
}

async saveShareLink(
  projectId: string, dto: SaveShareLinkDto, createdById: string, regenerate: boolean,
): Promise<ProjectShareLink> {
  await this.projectRepo.findOneByOrFail({ id: projectId });
  const existing = await this.shareLinkRepo.findOne({ where: { projectId } });

  if (!existing) {
    return this.shareLinkRepo.save(
      this.shareLinkRepo.create({
        projectId, token: generateToken(), role: dto.role, enabled: dto.enabled, createdById,
      }),
    );
  }

  existing.role = dto.role;
  existing.enabled = dto.enabled;
  if (regenerate) existing.token = generateToken();
  return this.shareLinkRepo.save(existing);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter backend test -- projects.service`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/projects/projects.service.ts \
  apps/backend/src/modules/projects/projects.service.spec.ts
git commit -m "feat(invitations): add share-link get/upsert service methods"
```

---

### Task 5: Extend getMembers to include pending invites

**Files:**
- Modify: `apps/backend/src/modules/projects/projects.service.ts`
- Modify: `apps/backend/src/modules/projects/projects.service.spec.ts`

**Interfaces:**
- Modifies: `getMembers(projectId, currentUserId)` return type from `{ members, myPermission }` to `{ members, invites, myPermission }`.

- [ ] **Step 1: Write a failing test**

Add to `projects.service.spec.ts`:

```typescript
describe('getMembers', () => {
  it('includes pending invites alongside members', async () => {
    mockMemberRepoForInvite.find.mockResolvedValue([]);
    mockInviteRepo.find.mockResolvedValue([
      { id: 'invite-1', projectId: 'proj-1', email: 'pending@example.com',
        role: ProjectPermissionLevel.VIEWER, token: 't', invitedById: 'user-1' },
    ]);
    const result = await service.getMembers('proj-1', 'user-1');
    expect(result.invites).toHaveLength(1);
    expect(result.invites[0].email).toBe('pending@example.com');
    expect(result.myPermission).toBe(ProjectPermissionLevel.ADMIN);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter backend test -- projects.service`
Expected: FAIL — `result.invites` is undefined.

- [ ] **Step 3: Update `getMembers`**

In `projects.service.ts`, replace the `getMembers` body:

```typescript
async getMembers(projectId: string, currentUserId: string) {
  const [members, invites, myPermission] = await Promise.all([
    this.memberRepo.find({ where: { projectId } }),
    this.inviteRepo.find({ where: { projectId }, order: { createdAt: 'ASC' } }),
    this.permissionService.getUserProjectPermission(currentUserId, projectId),
  ]);
  return { members, invites, myPermission };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter backend test -- projects.service`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/projects/projects.service.ts \
  apps/backend/src/modules/projects/projects.service.spec.ts
git commit -m "feat(invitations): include pending invites in members response"
```

---

### Task 6: Admin controller endpoints for invites and share link

**Files:**
- Modify: `apps/backend/src/modules/projects/projects.controller.ts`

**Interfaces:**
- Consumes: service methods `createInvite`, `getInvites`, `revokeInvite`, `getShareLink`, `saveShareLink` (Tasks 3–4).
- Produces HTTP routes:
  - `POST /projects/:id/invites`
  - `DELETE /projects/:id/invites/:inviteId`
  - `GET /projects/:id/share-link`
  - `PUT /projects/:id/share-link` (+ `?regenerate=true`)

- [ ] **Step 1: Add the endpoints**

In `apps/backend/src/modules/projects/projects.controller.ts`, add imports:

```typescript
import { Query } from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { SaveShareLinkDto } from './dto/save-share-link.dto';
```

Add these handlers inside the controller class (after `removeMember`):

```typescript
@Post(':id/invites')
@UseGuards(ProjectPermissionGuard)
@RequireProjectPermission(ProjectPermissionLevel.ADMIN)
createInvite(
  @Param('id') id: string,
  @Body() dto: CreateInviteDto,
  @Req() req: { currentUser: User },
) {
  return this.service.createInvite(id, dto, req.currentUser.id);
}

@Delete(':id/invites/:inviteId')
@HttpCode(204)
@UseGuards(ProjectPermissionGuard)
@RequireProjectPermission(ProjectPermissionLevel.ADMIN)
revokeInvite(@Param('id') id: string, @Param('inviteId') inviteId: string) {
  return this.service.revokeInvite(id, inviteId);
}

@Get(':id/share-link')
@UseGuards(ProjectPermissionGuard)
@RequireProjectPermission(ProjectPermissionLevel.ADMIN)
getShareLink(@Param('id') id: string) {
  return this.service.getShareLink(id);
}

@Put(':id/share-link')
@UseGuards(ProjectPermissionGuard)
@RequireProjectPermission(ProjectPermissionLevel.ADMIN)
saveShareLink(
  @Param('id') id: string,
  @Body() dto: SaveShareLinkDto,
  @Query('regenerate') regenerate: string,
  @Req() req: { currentUser: User },
) {
  return this.service.saveShareLink(id, dto, req.currentUser.id, regenerate === 'true');
}
```

Add `Put` to the `@nestjs/common` import list at the top of the file (it currently imports `Controller, Get, Post, Delete, Patch, Param, Body, HttpCode, Req, UseGuards`).

- [ ] **Step 2: Verify compilation and existing tests**

Run: `pnpm --filter backend build && pnpm --filter backend test`
Expected: build succeeds; all tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/projects/projects.controller.ts
git commit -m "feat(invitations): expose admin invite and share-link endpoints"
```

---

### Task 7: Join resolver service

**Files:**
- Create: `apps/backend/src/modules/join/join.service.ts`
- Create: `apps/backend/src/modules/join/join.service.spec.ts`

**Interfaces:**
- Consumes: `ProjectInvite`, `ProjectShareLink`, `ProjectMember`, `Project` repositories.
- Produces:
  - `getPreview(token: string): Promise<{ projectName: string; kind: 'invite' | 'link'; invitedEmail?: string }>` — throws `NotFoundException` for unknown/disabled tokens.
  - `accept(token: string, user: { id: string; email: string }): Promise<{ projectId: string }>` — throws `NotFoundException` (unknown/disabled) or `ForbiddenException` (email mismatch).

- [ ] **Step 1: Write failing tests**

Create `apps/backend/src/modules/join/join.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JoinService } from './join.service';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';
import { ProjectInvite } from '../projects/project-invite.entity';
import { ProjectShareLink } from '../projects/project-share-link.entity';

const inviteRepo = { findOne: jest.fn(), delete: jest.fn() };
const shareLinkRepo = { findOne: jest.fn() };
const memberRepo = {
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockImplementation((v) => Promise.resolve({ id: 'm1', ...v })),
};
const projectRepo = { findOne: jest.fn() };

describe('JoinService', () => {
  let service: JoinService;

  beforeEach(async () => {
    jest.clearAllMocks();
    inviteRepo.findOne.mockResolvedValue(null);
    shareLinkRepo.findOne.mockResolvedValue(null);
    memberRepo.findOne.mockResolvedValue(null);
    projectRepo.findOne.mockResolvedValue({ id: 'proj-1', name: 'Alpha', createdById: 'owner-1' });

    const module = await Test.createTestingModule({
      providers: [
        JoinService,
        { provide: getRepositoryToken(ProjectInvite), useValue: inviteRepo },
        { provide: getRepositoryToken(ProjectShareLink), useValue: shareLinkRepo },
        { provide: getRepositoryToken(ProjectMember), useValue: memberRepo },
        { provide: getRepositoryToken(Project), useValue: projectRepo },
      ],
    }).compile();
    service = module.get(JoinService);
  });

  it('previews an invite token', async () => {
    inviteRepo.findOne.mockResolvedValue({
      projectId: 'proj-1', email: 'p@x.com', role: ProjectPermissionLevel.VIEWER, token: 't',
    });
    const preview = await service.getPreview('t');
    expect(preview).toEqual({ projectName: 'Alpha', kind: 'invite', invitedEmail: 'p@x.com' });
  });

  it('404s on unknown token', async () => {
    await expect(service.getPreview('nope')).rejects.toThrow(NotFoundException);
  });

  it('404s on a disabled share link preview', async () => {
    shareLinkRepo.findOne.mockResolvedValue({ projectId: 'proj-1', enabled: false, token: 't' });
    await expect(service.getPreview('t')).rejects.toThrow(NotFoundException);
  });

  it('accepts a matching invite, creates membership, and deletes the invite', async () => {
    inviteRepo.findOne.mockResolvedValue({
      id: 'inv-1', projectId: 'proj-1', email: 'p@x.com', role: ProjectPermissionLevel.COLLABORATOR, token: 't',
    });
    const result = await service.accept('t', { id: 'user-9', email: 'P@X.com' });
    expect(memberRepo.save).toHaveBeenCalled();
    expect(inviteRepo.delete).toHaveBeenCalledWith({ id: 'inv-1' });
    expect(result).toEqual({ projectId: 'proj-1' });
  });

  it('rejects an invite accepted with a mismatched email', async () => {
    inviteRepo.findOne.mockResolvedValue({
      id: 'inv-1', projectId: 'proj-1', email: 'p@x.com', role: ProjectPermissionLevel.VIEWER, token: 't',
    });
    await expect(service.accept('t', { id: 'user-9', email: 'other@x.com' }))
      .rejects.toThrow(ForbiddenException);
  });

  it('is idempotent for an existing member (Flow 1)', async () => {
    inviteRepo.findOne.mockResolvedValue({
      id: 'inv-1', projectId: 'proj-1', email: 'p@x.com', role: ProjectPermissionLevel.VIEWER, token: 't',
    });
    memberRepo.findOne.mockResolvedValue({ id: 'm1', userId: 'user-9' });
    const result = await service.accept('t', { id: 'user-9', email: 'p@x.com' });
    expect(memberRepo.save).not.toHaveBeenCalled();
    expect(inviteRepo.delete).toHaveBeenCalledWith({ id: 'inv-1' });
    expect(result).toEqual({ projectId: 'proj-1' });
  });

  it('accepts an enabled share link', async () => {
    shareLinkRepo.findOne.mockResolvedValue({
      projectId: 'proj-1', enabled: true, role: ProjectPermissionLevel.VIEWER, token: 't',
    });
    const result = await service.accept('t', { id: 'user-9', email: 'anyone@x.com' });
    expect(memberRepo.save).toHaveBeenCalled();
    expect(result).toEqual({ projectId: 'proj-1' });
  });

  it('does not create a duplicate membership for the project owner', async () => {
    shareLinkRepo.findOne.mockResolvedValue({
      projectId: 'proj-1', enabled: true, role: ProjectPermissionLevel.VIEWER, token: 't',
    });
    projectRepo.findOne.mockResolvedValue({ id: 'proj-1', name: 'Alpha', createdById: 'user-9' });
    const result = await service.accept('t', { id: 'user-9', email: 'owner@x.com' });
    expect(memberRepo.save).not.toHaveBeenCalled();
    expect(result).toEqual({ projectId: 'proj-1' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter backend test -- join.service`
Expected: FAIL — cannot find module `./join.service`.

- [ ] **Step 3: Implement the join service**

Create `apps/backend/src/modules/join/join.service.ts`:

```typescript
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';
import { ProjectInvite } from '../projects/project-invite.entity';
import { ProjectShareLink } from '../projects/project-share-link.entity';

interface JoinPreview {
  projectName: string;
  kind: 'invite' | 'link';
  invitedEmail?: string;
}

@Injectable()
export class JoinService {
  constructor(
    @InjectRepository(ProjectInvite) private readonly inviteRepo: Repository<ProjectInvite>,
    @InjectRepository(ProjectShareLink) private readonly shareLinkRepo: Repository<ProjectShareLink>,
    @InjectRepository(ProjectMember) private readonly memberRepo: Repository<ProjectMember>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
  ) {}

  async getPreview(token: string): Promise<JoinPreview> {
    const invite = await this.inviteRepo.findOne({ where: { token } });
    if (invite) {
      const project = await this.projectRepo.findOne({ where: { id: invite.projectId } });
      if (!project) throw new NotFoundException('This link is no longer valid');
      return { projectName: project.name, kind: 'invite', invitedEmail: invite.email };
    }

    const link = await this.shareLinkRepo.findOne({ where: { token } });
    if (link && link.enabled) {
      const project = await this.projectRepo.findOne({ where: { id: link.projectId } });
      if (!project) throw new NotFoundException('This link is no longer valid');
      return { projectName: project.name, kind: 'link' };
    }

    throw new NotFoundException('This link is no longer valid');
  }

  async accept(
    token: string,
    user: { id: string; email: string },
  ): Promise<{ projectId: string }> {
    const invite = await this.inviteRepo.findOne({ where: { token } });
    if (invite) {
      if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
        throw new ForbiddenException(
          `This invite is for ${invite.email}. Sign in with that email to accept it.`,
        );
      }
      await this.ensureMember(invite.projectId, user.id, invite.role);
      await this.inviteRepo.delete({ id: invite.id });
      return { projectId: invite.projectId };
    }

    const link = await this.shareLinkRepo.findOne({ where: { token } });
    if (link && link.enabled) {
      await this.ensureMember(link.projectId, user.id, link.role);
      return { projectId: link.projectId };
    }

    throw new NotFoundException('This link is no longer valid');
  }

  /** Idempotent: no-op if the user already owns or is a member of the project. */
  private async ensureMember(
    projectId: string,
    userId: string,
    role: ProjectPermissionLevel,
  ): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (project?.createdById === userId) return;

    const existing = await this.memberRepo.findOne({ where: { projectId, userId } });
    if (existing) return;

    await this.memberRepo.save(this.memberRepo.create({ projectId, userId, role }));
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter backend test -- join.service`
Expected: PASS (all 8 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/join/join.service.ts \
  apps/backend/src/modules/join/join.service.spec.ts
git commit -m "feat(invitations): add join preview/accept resolver service"
```

---

### Task 8: Join controller and module wiring

**Files:**
- Create: `apps/backend/src/modules/join/join.controller.ts`
- Create: `apps/backend/src/modules/join/join.module.ts`
- Modify: `apps/backend/src/app.module.ts`

**Interfaces:**
- Consumes: `JoinService` (Task 7), `@Public()` decorator, `User` from request.
- Produces HTTP routes:
  - `GET /join/:token` (public)
  - `POST /join/:token/accept` (authenticated)

- [ ] **Step 1: Create the controller**

Create `apps/backend/src/modules/join/join.controller.ts`:

```typescript
import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JoinService } from './join.service';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/user.entity';

@ApiTags('join')
@Controller('join')
export class JoinController {
  constructor(private readonly service: JoinService) {}

  @Get(':token')
  @Public()
  preview(@Param('token') token: string) {
    return this.service.getPreview(token);
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @Req() req: { currentUser: User }) {
    return this.service.accept(token, {
      id: req.currentUser.id,
      email: req.currentUser.email,
    });
  }
}
```

- [ ] **Step 2: Create the module**

Create `apps/backend/src/modules/join/join.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { ProjectInvite } from '../projects/project-invite.entity';
import { ProjectShareLink } from '../projects/project-share-link.entity';
import { JoinService } from './join.service';
import { JoinController } from './join.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, ProjectInvite, ProjectShareLink]),
  ],
  providers: [JoinService],
  controllers: [JoinController],
})
export class JoinModule {}
```

- [ ] **Step 3: Register the module**

In `apps/backend/src/app.module.ts`, add the import and include it in the `imports` array (after `AiModule`):

```typescript
import { JoinModule } from './modules/join/join.module';
```

```typescript
    AiModule,
    JoinModule,
```

- [ ] **Step 4: Verify build and full test suite**

Run: `pnpm --filter backend build && pnpm --filter backend test`
Expected: build succeeds; all tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/join/join.controller.ts \
  apps/backend/src/modules/join/join.module.ts apps/backend/src/app.module.ts
git commit -m "feat(invitations): add public join controller and module"
```

---

### Task 9: Frontend types and API client methods

**Files:**
- Modify: `apps/frontend/src/lib/types.ts`
- Modify: `apps/frontend/src/lib/api.ts`

**Interfaces:**
- Produces types `ProjectInvite`, `ShareLink`, `JoinPreview`.
- Produces `api` methods: `createInvite`, `revokeInvite`, `getShareLink`, `saveShareLink`, `getJoinPreview`, `acceptJoin`; extends `getProjectMembers` return type.

- [ ] **Step 1: Add the types**

In `apps/frontend/src/lib/types.ts`, add:

```typescript
export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: ProjectPermissionLevel;
  token: string;
  invitedById: string;
  createdAt: string;
}

export interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  role: ProjectPermissionLevel;
  enabled: boolean;
  createdById: string;
  createdAt: string;
}

export interface JoinPreview {
  projectName: string;
  kind: 'invite' | 'link';
  invitedEmail?: string;
}
```

- [ ] **Step 2: Update the members API type and add methods**

In `apps/frontend/src/lib/api.ts`, update the import to include the new types:

```typescript
import type {
  User, Project, BoardData, Card, CardDraft, Stage, ProjectMember, ProjectPermissionLevel,
  ProjectInvite, ShareLink, JoinPreview,
} from './types';
```

Replace the `getProjectMembers` method so its response carries invites:

```typescript
  getProjectMembers: (projectId: string) =>
    fetchJson<{ members: ProjectMember[]; invites: ProjectInvite[]; myPermission: ProjectPermissionLevel }>(
      `/projects/${projectId}/members`,
    ),
```

Add these methods to the `api` object (after `removeProjectMember`):

```typescript
  // Invites
  createInvite: (projectId: string, email: string, role: ProjectPermissionLevel) =>
    fetchJson<ProjectInvite>(`/projects/${projectId}/invites`, {
      method: 'POST', body: JSON.stringify({ email, role }),
    }),
  revokeInvite: (projectId: string, inviteId: string) =>
    fetchJson<void>(`/projects/${projectId}/invites/${inviteId}`, { method: 'DELETE' }),

  // Share link
  getShareLink: (projectId: string) =>
    fetchJson<ShareLink | null>(`/projects/${projectId}/share-link`),
  saveShareLink: (
    projectId: string,
    data: { role: ProjectPermissionLevel; enabled: boolean },
    regenerate = false,
  ) =>
    fetchJson<ShareLink>(
      `/projects/${projectId}/share-link${regenerate ? '?regenerate=true' : ''}`,
      { method: 'PUT', body: JSON.stringify(data) },
    ),

  // Join (share links / invites)
  getJoinPreview: (token: string) => fetchJson<JoinPreview>(`/join/${token}`),
  acceptJoin: (token: string) =>
    fetchJson<{ projectId: string }>(`/join/${token}/accept`, { method: 'POST' }),
```

- [ ] **Step 3: Update the settings modal's member-load destructuring**

`ProjectSettingsModal.tsx` reads `membersData.members`; the response now also has `invites`. No change is required for compilation, but confirm the build passes in the next step. (Task 12 consumes `invites`.)

- [ ] **Step 4: Verify the frontend builds**

Run: `pnpm --filter frontend build`
Expected: build succeeds (types compile, lint clean).

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/types.ts apps/frontend/src/lib/api.ts
git commit -m "feat(invitations): add invite/share-link/join API client methods"
```

---

### Task 10: Join page

**Files:**
- Create: `apps/frontend/src/app/join/[token]/page.tsx`
- Create: `apps/frontend/src/app/join/[token]/JoinClient.tsx`
- Create: `apps/frontend/src/app/join/[token]/join.module.css`

**Interfaces:**
- Consumes: `api.getJoinPreview`, `api.acceptJoin`, `api.register`, `api.login`, `api.loginMattermost`, `useAuth()`.
- Produces the `/join/:token` route handling both Flow 1 (already a member → board) and Flow 2 (register/login → board).

- [ ] **Step 1: Create the route page (server wrapper)**

Create `apps/frontend/src/app/join/[token]/page.tsx`:

```tsx
import { JoinClient } from './JoinClient';

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <JoinClient token={token} />;
}
```

- [ ] **Step 2: Create the client component**

Create `apps/frontend/src/app/join/[token]/JoinClient.tsx`:

```tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { JoinPreview } from '@/lib/types';
import styles from './join.module.css';

type Mode = 'loading' | 'accepting' | 'auth' | 'error' | 'mismatch';

export function JoinClient({ token }: { token: string }) {
  const router = useRouter();
  const { currentUser, loading, setCurrentUser } = useAuth();
  const [preview, setPreview] = useState<JoinPreview | null>(null);
  const [mode, setMode] = useState<Mode>('loading');
  const [message, setMessage] = useState<string | null>(null);

  // Auth form state (used when the visitor is not signed in).
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const mattermostEnabled = process.env.NEXT_PUBLIC_MATTERMOST_ENABLED === 'true';

  // Load the preview once.
  useEffect(() => {
    api.getJoinPreview(token)
      .then((p) => {
        setPreview(p);
        if (p.kind === 'invite' && p.invitedEmail) setEmail(p.invitedEmail);
      })
      .catch(() => {
        setMode('error');
        setMessage('This link is no longer valid.');
      });
  }, [token]);

  // Once the preview is loaded and auth is resolved, decide what to do.
  useEffect(() => {
    if (!preview || loading || mode === 'error') return;
    if (currentUser) {
      void acceptAndGo();
    } else {
      setMode('auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, loading, currentUser]);

  const acceptAndGo = async () => {
    setMode('accepting');
    try {
      const { projectId } = await api.acceptJoin(token);
      router.replace(`/projects/${projectId}/board`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setMode('mismatch');
        setMessage(err.message);
      } else {
        setMode('error');
        setMessage('Could not join this project.');
      }
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const user = await api.register({ name, lastName, email, password });
      setCurrentUser(user);
      await acceptAndGo();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Registration failed');
      setBusy(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      await acceptAndGo();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Login failed');
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setMode('auth');
    setMessage(null);
  };

  const inviteEmailLocked = preview?.kind === 'invite' && !!preview.invitedEmail;

  if (mode === 'loading' || mode === 'accepting' || loading) {
    return <div className={styles.center}>Joining {preview?.projectName ?? ''}…</div>;
  }

  if (mode === 'error') {
    return <div className={styles.center}>{message}</div>;
  }

  if (mode === 'mismatch') {
    return (
      <div className={styles.center}>
        <p>{message}</p>
        <button className={styles.primary} onClick={() => void handleLogout()}>
          Log out &amp; switch account
        </button>
      </div>
    );
  }

  // mode === 'auth'
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Join {preview?.projectName}</h1>
      {message && <div className={styles.error}>{message}</div>}

      <div className={styles.tabs}>
        <button
          className={tab === 'register' ? styles.tabActive : styles.tab}
          onClick={() => setTab('register')}
        >
          Create account
        </button>
        <button
          className={tab === 'login' ? styles.tabActive : styles.tab}
          onClick={() => setTab('login')}
        >
          Sign in
        </button>
      </div>

      {tab === 'register' ? (
        <form onSubmit={(e) => void handleRegister(e)}>
          <input className={styles.input} placeholder="First name" value={name}
            onChange={(e) => setName(e.target.value)} required />
          <input className={styles.input} placeholder="Last name" value={lastName}
            onChange={(e) => setLastName(e.target.value)} required />
          <input className={styles.input} type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required readOnly={inviteEmailLocked} />
          <input className={styles.input} type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          <button className={styles.primary} type="submit" disabled={busy}>
            {busy ? 'Joining…' : 'Create account & join'}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => void handleLogin(e)}>
          <input className={styles.input} type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required readOnly={inviteEmailLocked} />
          <input className={styles.input} type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          <button className={styles.primary} type="submit" disabled={busy}>
            {busy ? 'Joining…' : 'Sign in & join'}
          </button>
        </form>
      )}

      {mattermostEnabled && (
        <p className={styles.hint}>
          Mattermost users: sign in on the{' '}
          <a href="/login">login page</a> first, then reopen this link.
        </p>
      )}
    </div>
  );
}
```

Note on Mattermost: the reusable login accordion in `login/page.tsx` redirects to `/projects`, which would lose the token. To keep this task focused, the join page offers email register/login inline and points Mattermost users at the login page then back to the link (the token URL is idempotent, so reopening it after Mattermost login triggers Flow 1). Full inline Mattermost on the join page is deferred (YAGNI for first cut).

- [ ] **Step 3: Create the stylesheet**

Create `apps/frontend/src/app/join/[token]/join.module.css`:

```css
.center {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  color: var(--color-text);
}

.card {
  max-width: 24rem;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 12px;
  background: var(--color-surface);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.title {
  margin: 0 0 1.25rem;
  font-size: 1.35rem;
  color: var(--color-text);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab, .tabActive {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
}

.tabActive {
  background: var(--color-indigo);
  color: #fff;
}

.input {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
}

.primary {
  width: 100%;
  padding: 0.65rem;
  border: none;
  border-radius: 8px;
  background: var(--color-indigo);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.primary:disabled { opacity: 0.6; cursor: default; }

.error {
  margin-bottom: 1rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  font-size: 0.9rem;
}

.hint {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
```

Note: confirm the CSS variable names against `apps/frontend/src/app/(auth)/form.module.css` / `variables.css` while implementing; substitute the project's actual token names if any differ (e.g. `--color-surface`, `--color-text-muted`).

- [ ] **Step 4: Verify the frontend builds**

Run: `pnpm --filter frontend build`
Expected: build succeeds.

- [ ] **Step 5: Manual verification**

Start backend + frontend (`pnpm dev:backend`, `pnpm dev:frontend`). As an admin, create an invite (via Task 12 UI, or a REST call) and open `/join/<token>`:
- Logged in as the invited email → redirected to the board.
- Logged out → register/login form with email prefilled; completing it lands on the board.
- Logged in as a different email → mismatch message + logout button.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/app/join
git commit -m "feat(invitations): add /join/[token] page with register/login flows"
```

---

### Task 11: Invite-by-email UI in the settings modal

**Files:**
- Modify: `apps/frontend/src/components/board/ProjectSettingsModal.tsx`
- Modify: `apps/frontend/src/components/board/ProjectSettingsModal.module.css`

**Interfaces:**
- Consumes: `api.createInvite`, `api.revokeInvite`, extended `api.getProjectMembers` (returns `invites`), `ProjectInvite` type.

- [ ] **Step 1: Load and store invites**

In `ProjectSettingsModal.tsx`, add `ProjectInvite` to the type import and add state:

```typescript
import type { ProjectInvite, ProjectMember, ProjectPermissionLevel, User } from '@/lib/types';
```

```typescript
const [invites, setInvites] = useState<ProjectInvite[]>([]);
const [inviteEmail, setInviteEmail] = useState('');
const [inviteRole, setInviteRole] = useState<ProjectPermissionLevel>('viewer');
```

In `load()`, capture invites from the response:

```typescript
setMembers(membersData.members);
setInvites(membersData.invites);
setMyPermission(membersData.myPermission);
```

- [ ] **Step 2: Add invite handlers**

```typescript
const handleInvite = async () => {
  if (!inviteEmail) return;
  setError(null);
  try {
    await api.createInvite(projectId, inviteEmail, inviteRole);
    setInviteEmail('');
    setInviteRole('viewer');
    await refresh();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to send invite');
  }
};

const handleRevoke = async (invite: ProjectInvite) => {
  if (!window.confirm(`Revoke the invite for ${invite.email}?`)) return;
  setError(null);
  try {
    await api.revokeInvite(projectId, invite.id);
    await refresh();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to revoke invite');
  }
};
```

- [ ] **Step 3: Render the invite row and pending list**

Inside the `isAdmin` block, below the existing `addRow`, add an invite-by-email row:

```tsx
{isAdmin && (
  <div className={styles.addRow}>
    <input
      className={styles.addSelect}
      type="email"
      placeholder="Invite by email…"
      value={inviteEmail}
      onChange={(e) => setInviteEmail(e.target.value)}
    />
    <select
      className={styles.roleSelect}
      value={inviteRole}
      onChange={(e) => setInviteRole(e.target.value as ProjectPermissionLevel)}
      aria-label="Role for invited email"
    >
      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
    </select>
    <Button disabled={!inviteEmail} onClick={() => void handleInvite()}>
      Invite
    </Button>
  </div>
)}
```

After the members `.list` block, render pending invites:

```tsx
{invites.length > 0 && (
  <>
    <div className={styles.sectionTitle}>
      Pending invites <span className={styles.count}>{invites.length}</span>
    </div>
    <div className={styles.list}>
      {invites.map((invite) => (
        <div key={invite.id} className={styles.row}>
          <Avatar name={invite.email} seed={invite.id} />
          <div className={styles.who}>
            <div className={styles.name}>{invite.email}</div>
            <div className={styles.meta}>account not created yet · {invite.role}</div>
          </div>
          {isAdmin && (
            <button className={styles.remove} onClick={() => void handleRevoke(invite)}>
              Revoke
            </button>
          )}
        </div>
      ))}
    </div>
  </>
)}
```

- [ ] **Step 4: Verify the frontend builds**

Run: `pnpm --filter frontend build`
Expected: build succeeds.

- [ ] **Step 5: Manual verification**

Open a project's settings modal as admin → invite an email → it appears under "Pending invites" as "account not created yet" → Revoke removes it.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components/board/ProjectSettingsModal.tsx \
  apps/frontend/src/components/board/ProjectSettingsModal.module.css
git commit -m "feat(invitations): invite-by-email and pending list in settings modal"
```

---

### Task 12: Share link section in the settings modal

**Files:**
- Modify: `apps/frontend/src/components/board/ProjectSettingsModal.tsx`
- Modify: `apps/frontend/src/components/board/ProjectSettingsModal.module.css`

**Interfaces:**
- Consumes: `api.getShareLink`, `api.saveShareLink`, `ShareLink` type.

- [ ] **Step 1: Load and store the share link**

Add to the import: `import type { ProjectInvite, ProjectMember, ProjectPermissionLevel, ShareLink, User } from '@/lib/types';`

Add state:

```typescript
const [shareLink, setShareLink] = useState<ShareLink | null>(null);
const [copied, setCopied] = useState(false);
```

Load it for admins (after the existing `getUsers` effect):

```typescript
useEffect(() => {
  if (myPermission === 'admin') {
    api.getShareLink(projectId).then(setShareLink).catch(() => {});
  }
}, [myPermission, projectId]);
```

- [ ] **Step 2: Add handlers and a join-URL helper**

```typescript
const joinUrl = (token: string) =>
  `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${token}`;

const saveLink = async (data: { role: ProjectPermissionLevel; enabled: boolean }, regenerate = false) => {
  setError(null);
  try {
    const link = await api.saveShareLink(projectId, data, regenerate);
    setShareLink(link);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to update share link');
  }
};

const copyLink = async () => {
  if (!shareLink) return;
  await navigator.clipboard.writeText(joinUrl(shareLink.token));
  setCopied(true);
  window.setTimeout(() => setCopied(false), 1500);
};
```

- [ ] **Step 3: Render the share-link section (admins only)**

Add after the pending-invites block, before the closing error `div`:

```tsx
{isAdmin && (
  <div className={styles.shareSection}>
    <div className={styles.sectionTitle}>Share link</div>
    <label className={styles.shareToggle}>
      <input
        type="checkbox"
        checked={!!shareLink?.enabled}
        onChange={(e) =>
          void saveLink({ role: shareLink?.role ?? 'viewer', enabled: e.target.checked })
        }
      />
      Anyone with the link can join
    </label>

    {shareLink?.enabled && (
      <>
        <div className={styles.addRow}>
          <input className={styles.addSelect} readOnly value={joinUrl(shareLink.token)} />
          <Button onClick={() => void copyLink()}>{copied ? 'Copied!' : 'Copy'}</Button>
        </div>
        <div className={styles.addRow}>
          <select
            className={styles.roleSelect}
            value={shareLink.role}
            onChange={(e) =>
              void saveLink({ role: e.target.value as ProjectPermissionLevel, enabled: true })
            }
            aria-label="Role granted by share link"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            className={styles.remove}
            onClick={() => void saveLink({ role: shareLink.role, enabled: true }, true)}
          >
            Regenerate
          </button>
        </div>
      </>
    )}
  </div>
)}
```

- [ ] **Step 4: Add minimal styles**

In `ProjectSettingsModal.module.css`, append:

```css
.shareSection {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.shareToggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-text);
}
```

- [ ] **Step 5: Verify the frontend builds**

Run: `pnpm --filter frontend build`
Expected: build succeeds.

- [ ] **Step 6: Manual verification**

As admin: toggle the share link on → URL appears → Copy works → changing the role persists → Regenerate changes the token (old `/join/<oldtoken>` now shows "no longer valid"). Toggle off disables joining.

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/components/board/ProjectSettingsModal.tsx \
  apps/frontend/src/components/board/ProjectSettingsModal.module.css
git commit -m "feat(invitations): share-link management in settings modal"
```

---

## Self-Review Notes

**Spec coverage:**
- Reusable link (toggle, role, regenerate) → Tasks 4, 6, 9, 12.
- Per-email invite (Trello-like pending, revoke, email-match, single-use) → Tasks 3, 5, 6, 7, 11.
- Join flows (Flow 1 member→board; Flow 2 register/login→board) → Tasks 7, 10.
- Sign-up methods (register, existing login, Mattermost) → Task 10 (Mattermost via login-page hop, documented).
- Admin-only management → Tasks 6, 11, 12 (guards + `isAdmin` UI gating).
- Security (random tokens, safe preview, server-side match/enabled) → Tasks 1, 7.
- Testing → Tasks 1, 3, 4, 5, 7.

**Known deviations from spec (intentional, documented):**
- Mattermost sign-up on the join page is handled by redirecting to `/login` then reopening the idempotent token URL, rather than inline. Recorded in Task 10 as a first-cut simplification; can be upgraded later if inline Mattermost-on-join is wanted.

**Type consistency:** `generateToken`, `createInvite(projectId, dto, invitedById)`, `saveShareLink(projectId, dto, createdById, regenerate)`, `getMembers → { members, invites, myPermission }`, `getPreview`, `accept` signatures are consistent across service, controller, spec, and client tasks.
