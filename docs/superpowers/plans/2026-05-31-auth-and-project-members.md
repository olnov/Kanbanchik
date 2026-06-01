# Auth & Project Member Management — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock X-User-Id auth with JWT httpOnly cookies, add register/login/logout pages, and replace the Team/ProjectTeamPermission model with a direct ProjectMember(projectId, userId, role) model managed from a new Project Settings page.

**Architecture:** Backend gains an AuthModule (bcrypt + JWT) and a ProjectMember entity; the UserGuard switches from reading an X-User-Id header to verifying a JWT cookie; PermissionService is rewritten to query ProjectMember rows directly. Frontend gains AuthContext + RequireAuth, login/register pages in a `(auth)` route group, and a `/projects/:id/settings` page; the App Router is restructured into `(auth)` and `(main)` route groups so auth pages render without the AppShell.

**Tech Stack:** `bcrypt`, `@nestjs/jwt`, `@fastify/cookie` (backend); Next.js App Router route groups, React context (frontend). No new frontend dependencies.

**⚠ Before starting:** Add `JWT_SECRET=replace-me-with-a-long-random-string` to `apps/backend/.env`.

---

## File Map

**Create (backend):**
- `apps/backend/src/modules/auth/auth.module.ts`
- `apps/backend/src/modules/auth/auth.service.ts`
- `apps/backend/src/modules/auth/auth.service.spec.ts`
- `apps/backend/src/modules/auth/auth.controller.ts`
- `apps/backend/src/modules/auth/dto/register.dto.ts`
- `apps/backend/src/modules/auth/dto/login.dto.ts`
- `apps/backend/src/modules/projects/project-member.entity.ts`
- `apps/backend/src/modules/projects/dto/add-project-member.dto.ts`
- `apps/backend/src/modules/projects/dto/update-project-member-role.dto.ts`

**Create (frontend):**
- `apps/frontend/src/contexts/AuthContext.tsx`
- `apps/frontend/src/components/auth/RequireAuth.tsx`
- `apps/frontend/src/app/(auth)/layout.tsx`
- `apps/frontend/src/app/(auth)/login/page.tsx`
- `apps/frontend/src/app/(auth)/login/page.module.css`
- `apps/frontend/src/app/(auth)/register/page.tsx`
- `apps/frontend/src/app/(auth)/register/page.module.css`
- `apps/frontend/src/app/(main)/layout.tsx`
- `apps/frontend/src/app/(main)/projects/page.tsx` *(moved)*
- `apps/frontend/src/app/(main)/projects/page.module.css` *(moved)*
- `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx` *(moved)*
- `apps/frontend/src/app/(main)/projects/[id]/board/page.module.css` *(moved)*
- `apps/frontend/src/app/(main)/projects/[id]/settings/page.tsx`
- `apps/frontend/src/app/(main)/projects/[id]/settings/page.module.css`

**Modify (backend):**
- `apps/backend/src/modules/users/user.entity.ts` — add `passwordHash`
- `apps/backend/src/modules/projects/project.entity.ts` — remove `teamId`, `team`, `teamPermissions`
- `apps/backend/src/modules/projects/dto/create-project.dto.ts` — remove `teamId`, `teamPermissions`
- `apps/backend/src/modules/projects/projects.service.ts` — rewrite (remove team logic, add member methods)
- `apps/backend/src/modules/projects/projects.service.spec.ts` — update for new model
- `apps/backend/src/modules/projects/projects.controller.ts` — add member endpoints, remove setTeamPermissions
- `apps/backend/src/modules/projects/projects.module.ts` — add ProjectMember + User, remove Team + ProjectTeamPermission
- `apps/backend/src/modules/permissions/permission.service.ts` — rewrite to use ProjectMember
- `apps/backend/src/modules/permissions/permission.service.spec.ts` — update tests
- `apps/backend/src/modules/permissions/permissions.module.ts` — swap entity registrations
- `apps/backend/src/common/guards/user.guard.ts` — JWT cookie instead of X-User-Id
- `apps/backend/src/common/guards/user.guard.spec.ts` — update tests
- `apps/backend/src/common/guards/project-permission.guard.ts` — update import for ProjectPermissionLevel
- `apps/backend/src/common/decorators/project-permission.decorator.ts` — update import
- `apps/backend/src/modules/stages/stages.controller.ts` — update import
- `apps/backend/src/modules/cards/cards.controller.ts` — update import
- `apps/backend/src/modules/ai/ai.controller.ts` — update import
- `apps/backend/src/app.module.ts` — add AuthModule, remove TeamsModule
- `apps/backend/src/main.ts` — register @fastify/cookie, credentials CORS, cookie Swagger
- `apps/backend/src/database/demo-data.ts` — passwords + ProjectMembers

**Modify (frontend):**
- `apps/frontend/src/app/layout.tsx` — AuthProvider only, no AppShell
- `apps/frontend/src/lib/api.ts` — credentials, remove X-User-Id, add auth+member calls
- `apps/frontend/src/lib/types.ts` — add ProjectMember, update Project
- `apps/frontend/src/components/layout/Sidebar.tsx` — remove switcher/teams, add user+logout
- `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx` — add gear icon

**Delete:**
- `apps/backend/src/modules/teams/` *(entire directory)*
- `apps/backend/src/modules/projects/project-team-permission.entity.ts`
- `apps/backend/src/modules/projects/dto/project-team-permission.dto.ts`
- `apps/backend/src/modules/projects/dto/set-project-team-permissions.dto.ts`
- `apps/backend/src/common/interceptors/user.interceptor.ts`
- `apps/frontend/src/app/teams/page.tsx`
- `apps/frontend/src/lib/user-context.ts`
- `apps/frontend/src/app/projects/` *(after moving to `(main)`)*

---

## Task 1: Install dependencies + add passwordHash to User

**Files:**
- Modify: `apps/backend/src/modules/users/user.entity.ts`

- [ ] **Step 1: Install backend dependencies**

```bash
cd apps/backend
pnpm add bcrypt @nestjs/jwt @fastify/cookie
pnpm add -D @types/bcrypt
```

- [ ] **Step 2: Add `passwordHash` to User entity**

Replace `apps/backend/src/modules/users/user.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../teams/team.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ default: '' })
  lastName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  role: string;

  @ApiProperty({ type: [String] })
  @Column('simple-array', { default: '' })
  competencies: string[];

  @ApiProperty()
  @Column({ default: 'available' })
  availability: string;

  @Column({ select: false, default: '' })
  passwordHash: string;

  @ManyToMany(() => Team, (team) => team.members)
  teams: Team[];
}
```

> `select: false` ensures `passwordHash` is never returned in normal `find` queries. The `Team` relation will be removed in Task 7 after TeamsModule is dropped — leave it for now to avoid cascade errors.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/backend
npx tsc --noEmit 2>&1
```

Expected: no output (clean).

- [ ] **Step 4: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/backend/src/modules/users/user.entity.ts apps/backend/package.json apps/backend/pnpm-lock.yaml
git commit -m "feat: add passwordHash to User entity, install auth deps"
```

---

## Task 2: Create ProjectMember entity + clean Project entity

**Files:**
- Create: `apps/backend/src/modules/projects/project-member.entity.ts`
- Modify: `apps/backend/src/modules/projects/project.entity.ts`

`ProjectPermissionLevel` moves from `project-team-permission.entity.ts` to `project-member.entity.ts`. All downstream imports will be updated in later tasks — for now they still point at the old file.

- [ ] **Step 1: Create ProjectMember entity**

Create `apps/backend/src/modules/projects/project-member.entity.ts`:

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { User } from '../users/user.entity';

export enum ProjectPermissionLevel {
  VIEWER = 'viewer',
  COLLABORATOR = 'collaborator',
  ADMIN = 'admin',
}

@Entity('project_members')
@Unique(['projectId', 'userId'])
export class ProjectMember {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  projectId: string;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @Column({
    type: 'enum',
    enum: ProjectPermissionLevel,
    default: ProjectPermissionLevel.VIEWER,
  })
  role: ProjectPermissionLevel;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

- [ ] **Step 2: Remove teamId + teamPermissions from Project entity**

Replace `apps/backend/src/modules/projects/project.entity.ts`:

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  DeleteDateColumn, OneToMany, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { ProjectMember } from './project-member.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  creator: User | null;

  @OneToMany(() => ProjectMember, (m) => m.project)
  members: ProjectMember[];

  @ApiProperty({ required: false, nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd /c/Work/Kanbanchik/apps/backend
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors only about removed `teamId`/`teamPermissions` references — those will be fixed in subsequent tasks. No errors inside the two entity files themselves.

- [ ] **Step 4: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/backend/src/modules/projects/project-member.entity.ts \
        apps/backend/src/modules/projects/project.entity.ts
git commit -m "feat: add ProjectMember entity, remove teamId+teamPermissions from Project"
```

---

## Task 3: Rewrite PermissionService for ProjectMember

**Files:**
- Modify: `apps/backend/src/modules/permissions/permission.service.ts`
- Modify: `apps/backend/src/modules/permissions/permission.service.spec.ts`
- Modify: `apps/backend/src/modules/permissions/permissions.module.ts`

- [ ] **Step 1: Write failing tests**

Replace `apps/backend/src/modules/permissions/permission.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';

const mockRepo = () => ({ findOne: jest.fn(), createQueryBuilder: jest.fn() });

describe('PermissionService', () => {
  let service: PermissionService;
  let projectRepo: { findOne: jest.Mock };
  let memberRepo: { findOne: jest.Mock; createQueryBuilder: jest.Mock };

  const userId = 'user-1';
  const projectId = 'proj-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: getRepositoryToken(Project), useFactory: mockRepo },
        { provide: getRepositoryToken(ProjectMember), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(PermissionService);
    projectRepo = module.get(getRepositoryToken(Project));
    memberRepo = module.get(getRepositoryToken(ProjectMember));
  });

  it('returns ADMIN when user is the project creator', async () => {
    projectRepo.findOne.mockResolvedValue({ id: projectId, createdById: userId });
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBe(ProjectPermissionLevel.ADMIN);
  });

  it('returns null when project does not exist', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBeNull();
  });

  it('returns null when user has no ProjectMember row', async () => {
    projectRepo.findOne.mockResolvedValue({ id: projectId, createdById: 'other' });
    memberRepo.findOne.mockResolvedValue(null);
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBeNull();
  });

  it('returns the member role when a ProjectMember row exists', async () => {
    projectRepo.findOne.mockResolvedValue({ id: projectId, createdById: 'other' });
    memberRepo.findOne.mockResolvedValue({ role: ProjectPermissionLevel.COLLABORATOR });
    const result = await service.getUserProjectPermission(userId, projectId);
    expect(result).toBe(ProjectPermissionLevel.COLLABORATOR);
  });

  it('getAccessibleProjectIds returns owned + member project ids', async () => {
    const ownedQb = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'proj-1' }]),
    };
    const memberQb = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ projectId: 'proj-2' }]),
    };
    projectRepo.createQueryBuilder = jest.fn().mockReturnValue(ownedQb);
    memberRepo.createQueryBuilder = jest.fn().mockReturnValue(memberQb);

    const result = await service.getAccessibleProjectIds(userId);
    expect(result).toEqual(expect.arrayContaining(['proj-1', 'proj-2']));
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd /c/Work/Kanbanchik/apps/backend
npx jest permission.service.spec.ts --no-coverage 2>&1 | tail -8
```

Expected: FAIL — `PermissionService` still references old Team/ProjectTeamPermission.

- [ ] **Step 3: Rewrite PermissionService**

Replace `apps/backend/src/modules/permissions/permission.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../projects/project-member.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly memberRepo: Repository<ProjectMember>,
  ) {}

  async getUserProjectPermission(
    userId: string,
    projectId: string,
  ): Promise<ProjectPermissionLevel | null> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) return null;

    if (project.createdById === userId) return ProjectPermissionLevel.ADMIN;

    const member = await this.memberRepo.findOne({ where: { projectId, userId } });
    return member?.role ?? null;
  }

  async getAccessibleProjectIds(userId: string): Promise<string[]> {
    const ownedIds = await this.projectRepo
      .createQueryBuilder('project')
      .where('project.createdById = :userId', { userId })
      .select(['project.id'])
      .getMany();

    const memberProjects = await this.memberRepo
      .createQueryBuilder('member')
      .where('member.userId = :userId', { userId })
      .select(['member.projectId'])
      .getMany();

    const allIds = new Set([
      ...ownedIds.map((p) => p.id),
      ...memberProjects.map((m) => m.projectId),
    ]);
    return [...allIds];
  }
}
```

- [ ] **Step 4: Update PermissionsModule**

Replace `apps/backend/src/modules/permissions/permissions.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { PermissionService } from './permission.service';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember, Stage, Card])],
  providers: [PermissionService, ProjectPermissionGuard],
  exports: [PermissionService, ProjectPermissionGuard, TypeOrmModule],
})
export class PermissionsModule {}
```

- [ ] **Step 5: Update ProjectPermissionLevel imports in guard and decorator**

In `apps/backend/src/common/guards/project-permission.guard.ts`, change:
```typescript
// old:
import { ProjectPermissionLevel } from '../../modules/projects/project-team-permission.entity';
// new:
import { ProjectPermissionLevel } from '../../modules/projects/project-member.entity';
```

In `apps/backend/src/common/decorators/project-permission.decorator.ts`, change:
```typescript
// old:
import { ProjectPermissionLevel } from '../../modules/projects/project-team-permission.entity';
// new:
import { ProjectPermissionLevel } from '../../modules/projects/project-member.entity';
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npx jest permission.service.spec.ts --no-coverage 2>&1 | tail -8
```

Expected: 5 tests pass.

- [ ] **Step 7: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/backend/src/modules/permissions/ \
        apps/backend/src/common/guards/project-permission.guard.ts \
        apps/backend/src/common/decorators/project-permission.decorator.ts
git commit -m "feat: rewrite PermissionService to use ProjectMember"
```

---

## Task 4: Create AuthModule

**Files:**
- Create: `apps/backend/src/modules/auth/dto/register.dto.ts`
- Create: `apps/backend/src/modules/auth/dto/login.dto.ts`
- Create: `apps/backend/src/modules/auth/auth.service.ts`
- Create: `apps/backend/src/modules/auth/auth.service.spec.ts`
- Create: `apps/backend/src/modules/auth/auth.controller.ts`
- Create: `apps/backend/src/modules/auth/auth.module.ts`

- [ ] **Step 1: Create DTOs**

Create `apps/backend/src/modules/auth/dto/register.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
}
```

Create `apps/backend/src/modules/auth/dto/login.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}
```

- [ ] **Step 2: Write failing AuthService tests**

Create `apps/backend/src/modules/auth/auth.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';

const mockUserRepo = {
  findOneBy: jest.fn(),
  findOneByOrFail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};
const mockJwt = { sign: jest.fn().mockReturnValue('token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('register', () => {
    it('throws ConflictException when email already exists', async () => {
      mockUserRepo.findOneBy.mockResolvedValue({ id: 'u1' });
      await expect(service.register({ name: 'A', lastName: 'B', email: 'a@b.com', password: 'pass' }))
        .rejects.toThrow(ConflictException);
    });

    it('creates user with hashed password and returns user without hash', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation((v) => v);
      mockUserRepo.save.mockResolvedValue({ id: 'u1' });
      mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

      const result = await service.register({ name: 'Alice', lastName: 'J', email: 'a@b.com', password: 'password123' });
      expect(result).toEqual({ id: 'u1', email: 'a@b.com' });
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: expect.any(String) }),
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      const qb = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      await expect(service.login({ email: 'x@y.com', password: 'abc' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      const qb = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: hash }) };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      await expect(service.login({ email: 'x@y.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('returns user without hash on correct credentials', async () => {
      const hash = await bcrypt.hash('secret', 10);
      const qb = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: hash }) };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 'u1', email: 'x@y.com' });
      const result = await service.login({ email: 'x@y.com', password: 'secret' });
      expect(result).toEqual({ id: 'u1', email: 'x@y.com' });
    });
  });

  it('signToken delegates to JwtService.sign', () => {
    const token = service.signToken('u1');
    expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 'u1' });
    expect(token).toBe('token');
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
cd /c/Work/Kanbanchik/apps/backend
npx jest auth.service.spec.ts --no-coverage 2>&1 | tail -8
```

Expected: FAIL — `Cannot find module './auth.service'`.

- [ ] **Step 4: Implement AuthService**

Create `apps/backend/src/modules/auth/auth.service.ts`:

```typescript
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const saved = await this.userRepo.save(
      this.userRepo.create({
        name: dto.name.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email,
        role: '',
        passwordHash,
      }),
    );
    return this.userRepo.findOneByOrFail({ id: saved.id });
  }

  async login(dto: LoginDto): Promise<User> {
    const userWithHash = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!userWithHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, userWithHash.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.userRepo.findOneByOrFail({ id: userWithHash.id });
  }

  signToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npx jest auth.service.spec.ts --no-coverage 2>&1 | tail -8
```

Expected: 5 tests pass.

- [ ] **Step 6: Create AuthController**

Create `apps/backend/src/modules/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Get, Body, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/user.entity';

const COOKIE_OPTIONS = { httpOnly: true, sameSite: 'strict' as const, path: '/' };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = await this.authService.register(dto);
    reply.setCookie('access_token', this.authService.signToken(user.id), COOKIE_OPTIONS);
    return user;
  }

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = await this.authService.login(dto);
    reply.setCookie('access_token', this.authService.signToken(user.id), COOKIE_OPTIONS);
    return user;
  }

  @Post('logout')
  @Public()
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out' };
  }

  @Get('me')
  me(@Req() req: { currentUser: User }) {
    return req.currentUser;
  }
}
```

- [ ] **Step 7: Create AuthModule**

Create `apps/backend/src/modules/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
```

- [ ] **Step 8: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/backend/src/modules/auth/
git commit -m "feat: add AuthModule with register/login/logout/me endpoints"
```

---

## Task 5: Update UserGuard + main.ts for JWT cookies

**Files:**
- Modify: `apps/backend/src/common/guards/user.guard.ts`
- Modify: `apps/backend/src/common/guards/user.guard.spec.ts`
- Modify: `apps/backend/src/app.module.ts`
- Modify: `apps/backend/src/main.ts`

- [ ] **Step 1: Update UserGuard spec**

Replace `apps/backend/src/common/guards/user.guard.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGuard } from './user.guard';
import { User } from '../../modules/users/user.entity';

const mockUserRepo = { findOneBy: jest.fn() };
const mockJwt = { verify: jest.fn() };

function makeCtx(cookies: Record<string, string>, isPublic = false): ExecutionContext {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(isPublic) };
  const request = { cookies };
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('UserGuard', () => {
  let guard: UserGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UserGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    guard = module.get(UserGuard);
    reflector = module.get(Reflector);
  });

  it('passes through public endpoints without checking cookie', async () => {
    const ctx = makeCtx({}, true);
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockUserRepo.findOneBy).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when cookie is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    await expect(guard.canActivate(makeCtx({}))).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when JWT is invalid', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    mockJwt.verify.mockImplementation(() => { throw new Error('bad'); });
    await expect(guard.canActivate(makeCtx({ access_token: 'bad' }))).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user not found', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    mockJwt.verify.mockReturnValue({ sub: 'u1' });
    mockUserRepo.findOneBy.mockResolvedValue(null);
    await expect(guard.canActivate(makeCtx({ access_token: 'tok' }))).rejects.toThrow(UnauthorizedException);
  });

  it('sets currentUser and returns true for valid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    mockJwt.verify.mockReturnValue({ sub: 'u1' });
    const user = { id: 'u1' };
    mockUserRepo.findOneBy.mockResolvedValue(user);
    const request: Record<string, unknown> = { cookies: { access_token: 'tok' } };
    const ctx = {
      getHandler: jest.fn(), getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(request.currentUser).toBe(user);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd /c/Work/Kanbanchik/apps/backend
npx jest user.guard.spec.ts --no-coverage 2>&1 | tail -8
```

Expected: FAIL — guard still reads X-User-Id.

- [ ] **Step 3: Rewrite UserGuard**

Replace `apps/backend/src/common/guards/user.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      cookies: Record<string, string>;
      currentUser?: User;
    }>();

    const token = request.cookies?.access_token;
    if (!token) throw new UnauthorizedException('Authentication required');

    let sub: string;
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userRepo.findOneBy({ id: sub });
    if (!user) throw new UnauthorizedException('User not found');

    request.currentUser = user;
    return true;
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest user.guard.spec.ts --no-coverage 2>&1 | tail -8
```

Expected: 5 tests pass.

- [ ] **Step 5: Add AuthModule to AppModule**

Replace `apps/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { StagesModule } from './modules/stages/stages.module';
import { CardsModule } from './modules/cards/cards.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserGuard } from './common/guards/user.guard';
import { DevBootstrapService } from './database/dev-bootstrap.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    TeamsModule,
    ProjectsModule,
    StagesModule,
    CardsModule,
    AiModule,
  ],
  providers: [
    DevBootstrapService,
    { provide: APP_GUARD, useClass: UserGuard },
  ],
})
export class AppModule {}
```

> `TeamsModule` stays in AppModule for now — it is removed in Task 7.

- [ ] **Step 6: Update main.ts**

Replace `apps/backend/src/main.ts`:

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  await app.register(fastifyCookie as Parameters<typeof app.register>[0]);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: ['http://localhost:3000', 'app://-'],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Kanbanchik API')
    .setDescription('Kanban board REST API')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}

bootstrap();
```

- [ ] **Step 7: Run full backend tests**

```bash
cd /c/Work/Kanbanchik/apps/backend
npx jest --no-coverage 2>&1 | tail -10
```

Expected: all existing tests pass (some may fail due to still-present team references in ProjectsService — those are fixed in Task 6).

- [ ] **Step 8: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/backend/src/common/guards/user.guard.ts \
        apps/backend/src/common/guards/user.guard.spec.ts \
        apps/backend/src/app.module.ts \
        apps/backend/src/main.ts
git commit -m "feat: switch UserGuard to JWT cookie, register @fastify/cookie"
```

---

## Task 6: ProjectMember endpoints in ProjectsService + ProjectsController

**Files:**
- Create: `apps/backend/src/modules/projects/dto/add-project-member.dto.ts`
- Create: `apps/backend/src/modules/projects/dto/update-project-member-role.dto.ts`
- Modify: `apps/backend/src/modules/projects/projects.service.ts`
- Modify: `apps/backend/src/modules/projects/projects.service.spec.ts`
- Modify: `apps/backend/src/modules/projects/projects.controller.ts`
- Modify: `apps/backend/src/modules/projects/projects.module.ts`
- Modify: `apps/backend/src/modules/projects/dto/create-project.dto.ts`
- Modify: `apps/backend/src/modules/stages/stages.controller.ts`
- Modify: `apps/backend/src/modules/cards/cards.controller.ts`
- Modify: `apps/backend/src/modules/ai/ai.controller.ts`

- [ ] **Step 1: Create member DTOs**

Create `apps/backend/src/modules/projects/dto/add-project-member.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class AddProjectMemberDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty({ enum: ProjectPermissionLevel, required: false })
  @IsEnum(ProjectPermissionLevel) @IsOptional()
  role?: ProjectPermissionLevel;
}
```

Create `apps/backend/src/modules/projects/dto/update-project-member-role.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProjectPermissionLevel } from '../project-member.entity';

export class UpdateProjectMemberRoleDto {
  @ApiProperty({ enum: ProjectPermissionLevel })
  @IsEnum(ProjectPermissionLevel)
  role: ProjectPermissionLevel;
}
```

- [ ] **Step 2: Simplify CreateProjectDto**

Replace `apps/backend/src/modules/projects/dto/create-project.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty() @IsString() name: string;
}
```

- [ ] **Step 3: Rewrite ProjectsService**

Replace the entire `apps/backend/src/modules/projects/projects.service.ts`:

```typescript
import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from './project.entity';
import { ProjectMember, ProjectPermissionLevel } from './project-member.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';
import { DEFAULT_PROJECT_STAGES } from '../../database/project-defaults';
import { PermissionService } from '../permissions/permission.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    @InjectRepository(ProjectMember) private readonly memberRepo: Repository<ProjectMember>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    const accessibleIds = await this.permissionService.getAccessibleProjectIds(userId);
    if (accessibleIds.length === 0) return [];
    return this.projectRepo.findBy({ id: In(accessibleIds) });
  }

  findOne(id: string): Promise<Project> {
    return this.projectRepo.findOneByOrFail({ id });
  }

  async create(dto: CreateProjectDto, createdById: string): Promise<Project> {
    return this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const stageRepo = manager.getRepository(Stage);

      const project = await projectRepo.save(
        projectRepo.create({ name: dto.name.trim(), createdById }),
      );

      await stageRepo.save(
        DEFAULT_PROJECT_STAGES.map((stage) =>
          stageRepo.create({ ...stage, projectId: project.id })),
      );

      return projectRepo.findOneByOrFail({ id: project.id });
    });
  }

  async remove(id: string): Promise<void> {
    await this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const memberRepo = manager.getRepository(ProjectMember);
      const stageRepo = manager.getRepository(Stage);
      const cardRepo = manager.getRepository(Card);

      await projectRepo.findOneByOrFail({ id });
      await memberRepo.createQueryBuilder().delete().where('projectId = :id', { id }).execute();
      await cardRepo.softDelete({ projectId: id });
      await stageRepo.softDelete({ projectId: id });
      await projectRepo.softDelete(id);
    });
  }

  async getBoard(projectId: string, userId: string) {
    const [project, stages, cards, myPermission] = await Promise.all([
      this.projectRepo.findOneByOrFail({ id: projectId }),
      this.stageRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.cardRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.permissionService.getUserProjectPermission(userId, projectId),
    ]);
    return { project, stages, cards, myPermission };
  }

  async getMembers(projectId: string, currentUserId: string) {
    const [members, myPermission] = await Promise.all([
      this.memberRepo.find({ where: { projectId } }),
      this.permissionService.getUserProjectPermission(currentUserId, projectId),
    ]);
    return { members, myPermission };
  }

  async addMember(projectId: string, dto: AddProjectMemberDto): Promise<ProjectMember> {
    const project = await this.projectRepo.findOneByOrFail({ id: projectId });
    if (project.createdById === dto.userId) {
      throw new BadRequestException('Project creator is always admin — no member row needed');
    }

    const existing = await this.memberRepo.findOne({ where: { projectId, userId: dto.userId } });
    if (existing) throw new ConflictException('User is already a member of this project');

    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

    return this.memberRepo.save(
      this.memberRepo.create({
        projectId,
        userId: dto.userId,
        role: dto.role ?? ProjectPermissionLevel.VIEWER,
      }),
    );
  }

  async updateMemberRole(
    projectId: string, userId: string, dto: UpdateProjectMemberRoleDto,
  ): Promise<ProjectMember> {
    const project = await this.projectRepo.findOneByOrFail({ id: projectId });
    if (project.createdById === userId) {
      throw new BadRequestException('Cannot change the role of the project creator');
    }
    const member = await this.memberRepo.findOneOrFail({ where: { projectId, userId } });
    member.role = dto.role;
    return this.memberRepo.save(member);
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepo.findOneByOrFail({ id: projectId });
    if (project.createdById === userId) {
      throw new BadRequestException('Cannot remove the project creator');
    }
    await this.memberRepo.delete({ projectId, userId });
  }
}
```

- [ ] **Step 4: Update ProjectsModule**

Replace `apps/backend/src/modules/projects/projects.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { User } from '../users/user.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, Stage, Card, User]),
    PermissionsModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
```

- [ ] **Step 5: Update ProjectsController**

Replace `apps/backend/src/modules/projects/projects.controller.ts`:

```typescript
import {
  Controller, Get, Post, Delete, Patch, Param, Body, HttpCode, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequireProjectPermission } from '../../common/decorators/project-permission.decorator';
import { ProjectPermissionLevel } from './project-member.entity';
import { User } from '../users/user.entity';

@ApiTags('projects')
@ApiSecurity('access_token')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  findAll(@Req() req: { currentUser: User }) {
    return this.service.findAll(req.currentUser.id);
  }

  @Get(':id')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: { currentUser: User }) {
    return this.service.create(dto, req.currentUser.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/board')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER)
  getBoard(@Param('id') id: string, @Req() req: { currentUser: User }) {
    return this.service.getBoard(id, req.currentUser.id);
  }

  @Get(':id/members')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.VIEWER)
  getMembers(@Param('id') id: string, @Req() req: { currentUser: User }) {
    return this.service.getMembers(id, req.currentUser.id);
  }

  @Post(':id/members')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  addMember(@Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    return this.service.addMember(id, dto);
  }

  @Patch(':id/members/:userId')
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
  ) {
    return this.service.updateMemberRole(id, userId, dto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(204)
  @UseGuards(ProjectPermissionGuard)
  @RequireProjectPermission(ProjectPermissionLevel.ADMIN)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.removeMember(id, userId);
  }
}
```

- [ ] **Step 6: Fix ProjectPermissionLevel imports in stages, cards, ai controllers**

In `apps/backend/src/modules/stages/stages.controller.ts`, change:
```typescript
// old:
import { ProjectPermissionLevel } from '../projects/project-team-permission.entity';
// new:
import { ProjectPermissionLevel } from '../projects/project-member.entity';
```

In `apps/backend/src/modules/cards/cards.controller.ts`, change:
```typescript
// old:
import { ProjectPermissionLevel } from '../projects/project-team-permission.entity';
// new:
import { ProjectPermissionLevel } from '../projects/project-member.entity';
```

In `apps/backend/src/modules/ai/ai.controller.ts`, change:
```typescript
// old:
import { ProjectPermissionLevel } from '../projects/project-team-permission.entity';
// new:
import { ProjectPermissionLevel } from '../projects/project-member.entity';
```

- [ ] **Step 7: Update ProjectsService spec**

Replace `apps/backend/src/modules/projects/projects.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ProjectMember, ProjectPermissionLevel } from './project-member.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { User } from '../users/user.entity';
import { PermissionService } from '../permissions/permission.service';

const mockProject: Project = {
  id: 'proj-1', name: 'Alpha', createdById: 'user-1', creator: null, members: [], deletedAt: null,
};

const txProjectRepo = {
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  softDelete: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockImplementation((v) => v),
  save: jest.fn().mockResolvedValue(mockProject),
};
const txMemberRepo = { createQueryBuilder: jest.fn().mockReturnValue({ delete: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), execute: jest.fn() }) };
const txStageRepo = { create: jest.fn(), save: jest.fn(), softDelete: jest.fn().mockResolvedValue(undefined) };
const txCardRepo = { softDelete: jest.fn().mockResolvedValue(undefined) };

const mockRepo = {
  findBy: jest.fn().mockResolvedValue([mockProject]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  create: jest.fn().mockReturnValue(mockProject),
  save: jest.fn().mockResolvedValue(mockProject),
  manager: {
    transaction: jest.fn(async (cb: (m: { getRepository: (e: unknown) => unknown }) => unknown) =>
      cb({
        getRepository: (e: unknown) => {
          if (e === Project) return txProjectRepo;
          if (e === ProjectMember) return txMemberRepo;
          if (e === Stage) return txStageRepo;
          if (e === Card) return txCardRepo;
          throw new Error(`Unexpected ${String(e)}`);
        },
      }),
    ),
  },
};

const mockPermissionService = {
  getAccessibleProjectIds: jest.fn().mockResolvedValue(['proj-1']),
  getUserProjectPermission: jest.fn().mockResolvedValue(ProjectPermissionLevel.ADMIN),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    txProjectRepo.findOneByOrFail.mockResolvedValue(mockProject);
    mockPermissionService.getAccessibleProjectIds.mockResolvedValue(['proj-1']);
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockRepo },
        { provide: getRepositoryToken(Stage), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Card), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(ProjectMember), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(User), useValue: { findOneBy: jest.fn() } },
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compile();
    service = module.get(ProjectsService);
  });

  it('findAll returns projects accessible to the user', async () => {
    const result = await service.findAll('user-1');
    expect(mockPermissionService.getAccessibleProjectIds).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([mockProject]);
  });

  it('findAll returns empty array when user has no accessible projects', async () => {
    mockPermissionService.getAccessibleProjectIds.mockResolvedValue([]);
    expect(await service.findAll('user-1')).toEqual([]);
  });

  it('creates project with createdById and default stages', async () => {
    await service.create({ name: 'Alpha' }, 'user-1');
    expect(mockRepo.manager.transaction).toHaveBeenCalled();
    expect(txProjectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alpha', createdById: 'user-1' }),
    );
  });

  it('soft deletes project with stages, cards, and members', async () => {
    await service.remove('proj-1');
    expect(txProjectRepo.findOneByOrFail).toHaveBeenCalledWith({ id: 'proj-1' });
    expect(txCardRepo.softDelete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txStageRepo.softDelete).toHaveBeenCalledWith({ projectId: 'proj-1' });
    expect(txProjectRepo.softDelete).toHaveBeenCalledWith('proj-1');
  });
});
```

- [ ] **Step 8: Run tests**

```bash
cd /c/Work/Kanbanchik/apps/backend
npx jest --no-coverage 2>&1 | tail -10
```

Expected: all tests pass except any that depend on `TeamsModule` (removed in next task).

- [ ] **Step 9: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/backend/src/modules/projects/ \
        apps/backend/src/modules/stages/stages.controller.ts \
        apps/backend/src/modules/cards/cards.controller.ts \
        apps/backend/src/modules/ai/ai.controller.ts
git commit -m "feat: add ProjectMember endpoints, rewrite ProjectsService without team logic"
```

---

## Task 7: Remove TeamsModule + ProjectTeamPermission + old files

**Files to delete:**
- `apps/backend/src/modules/teams/` *(entire directory)*
- `apps/backend/src/modules/projects/project-team-permission.entity.ts`
- `apps/backend/src/modules/projects/dto/project-team-permission.dto.ts`
- `apps/backend/src/modules/projects/dto/set-project-team-permissions.dto.ts`
- `apps/backend/src/common/interceptors/user.interceptor.ts`
- `apps/backend/src/common/interceptors/user.interceptor.spec.ts`

**Files to modify:**
- `apps/backend/src/app.module.ts` — remove TeamsModule
- `apps/backend/src/modules/users/user.entity.ts` — remove Team relation

- [ ] **Step 1: Remove TeamsModule from AppModule**

In `apps/backend/src/app.module.ts`, remove:
```typescript
// Remove this import:
import { TeamsModule } from './modules/teams/teams.module';
// Remove from imports array: TeamsModule,
```

- [ ] **Step 2: Remove Team relation from User entity**

Replace `apps/backend/src/modules/users/user.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ default: '' })
  lastName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ default: '' })
  role: string;

  @ApiProperty({ type: [String] })
  @Column('simple-array', { default: '' })
  competencies: string[];

  @ApiProperty()
  @Column({ default: 'available' })
  availability: string;

  @Column({ select: false, default: '' })
  passwordHash: string;
}
```

- [ ] **Step 3: Delete old files**

```bash
cd /c/Work/Kanbanchik
rm -rf apps/backend/src/modules/teams
rm apps/backend/src/modules/projects/project-team-permission.entity.ts
rm apps/backend/src/modules/projects/dto/project-team-permission.dto.ts
rm apps/backend/src/modules/projects/dto/set-project-team-permissions.dto.ts
rm apps/backend/src/common/interceptors/user.interceptor.ts
rm apps/backend/src/common/interceptors/user.interceptor.spec.ts
```

- [ ] **Step 4: Remove @Public from GET /users**

In `apps/backend/src/modules/users/users.controller.ts`, remove the `@Public()` decorator and its import from the `findAll` handler:

```typescript
// Remove: import { Public } from '../../common/decorators/public.decorator';
// Remove: @Public() from the findAll method
```

The full updated controller:

```typescript
import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiSecurity('access_token')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateUserDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }
}
```

- [ ] **Step 5: Full type-check**

```bash
cd /c/Work/Kanbanchik/apps/backend
npx tsc --noEmit 2>&1
```

Expected: no output (clean).

- [ ] **Step 6: Run all tests**

```bash
npx jest --no-coverage 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
cd /c/Work/Kanbanchik
git add -A
git commit -m "feat: remove TeamsModule + ProjectTeamPermission + old interceptor"
```

---

## Task 8: Update seed data

**Files:**
- Modify: `apps/backend/src/database/demo-data.ts`

- [ ] **Step 1: Rewrite demo-data.ts**

Replace `apps/backend/src/database/demo-data.ts`:

```typescript
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Project } from '../modules/projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../modules/projects/project-member.entity';
import { Stage } from '../modules/stages/stage.entity';
import { Card } from '../modules/cards/card.entity';
import { DEFAULT_PROJECT_STAGES } from './project-defaults';

export async function seedDemoWorkspace(
  manager: EntityManager,
  options: { reset?: boolean } = {},
) {
  const userRepo = manager.getRepository(User);
  const projectRepo = manager.getRepository(Project);
  const memberRepo = manager.getRepository(ProjectMember);
  const stageRepo = manager.getRepository(Stage);
  const cardRepo = manager.getRepository(Card);

  if (options.reset) {
    await cardRepo.createQueryBuilder().delete().execute();
    await stageRepo.createQueryBuilder().delete().execute();
    await memberRepo.createQueryBuilder().delete().execute();
    await projectRepo.createQueryBuilder().delete().execute();
    await userRepo.createQueryBuilder().delete().execute();
  }

  const hash = await bcrypt.hash('password123', 10);

  let users = await userRepo.find({ order: { name: 'ASC', lastName: 'ASC' } });
  if (users.length === 0) {
    users = await userRepo.save([
      userRepo.create({ name: 'Alice', lastName: 'Johnson', email: 'alice@example.com', role: 'developer', competencies: ['typescript', 'react'], availability: 'available', passwordHash: hash }),
      userRepo.create({ name: 'Bob', lastName: 'Smith', email: 'bob@example.com', role: 'designer', competencies: ['figma', 'css'], availability: 'available', passwordHash: hash }),
      userRepo.create({ name: 'Carol', lastName: 'Taylor', email: 'carol@example.com', role: 'product manager', competencies: ['planning'], availability: 'partial', passwordHash: hash }),
    ]);
  }

  const [alice, bob, carol] = users;

  let project = await projectRepo.findOne({ where: { name: 'Alpha Project' } });
  if (!project) {
    project = await projectRepo.save(
      projectRepo.create({ name: 'Alpha Project', createdById: alice.id }),
    );
  } else if (!project.createdById) {
    project.createdById = alice.id;
    project = await projectRepo.save(project);
  }

  const existingMembers = await memberRepo.find({ where: { projectId: project.id } });
  if (existingMembers.length === 0) {
    await memberRepo.save([
      memberRepo.create({ projectId: project.id, userId: bob.id, role: ProjectPermissionLevel.COLLABORATOR }),
      memberRepo.create({ projectId: project.id, userId: carol.id, role: ProjectPermissionLevel.VIEWER }),
    ]);
  }

  let stages = await stageRepo.find({ where: { projectId: project.id }, order: { order: 'ASC' } });
  if (stages.length === 0) {
    stages = await stageRepo.save(
      DEFAULT_PROJECT_STAGES.map((s) => stageRepo.create({ ...s, projectId: project!.id })),
    );
  }

  const stageByName = Object.fromEntries(stages.map((s) => [s.name, s]));
  if (await cardRepo.count({ where: { projectId: project.id } }) === 0) {
    await cardRepo.save([
      cardRepo.create({ summary: 'Set up monorepo', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: stageByName.Done.id, assigneeId: alice.id, description: 'Initialize pnpm workspace.' }),
      cardRepo.create({ summary: 'Design database schema', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: stageByName['In Progress'].id, assigneeId: bob.id, description: 'Define all entities.' }),
      cardRepo.create({ summary: 'Build board UI', type: 'story', priority: 'high', order: 100, projectId: project.id, stageId: stageByName['In Progress'].id, assigneeId: alice.id, description: 'Implement the Kanban board.' }),
      cardRepo.create({ summary: 'Add drag and drop', type: 'task', priority: 'medium', order: 0, projectId: project.id, stageId: stageByName['To Do'].id, assigneeId: alice.id, description: 'Integrate @hello-pangea/dnd.' }),
      cardRepo.create({ summary: 'Write API docs', type: 'task', priority: 'low', order: 0, projectId: project.id, stageId: stageByName.Review.id, assigneeId: carol.id, description: 'Add Swagger decorators.' }),
    ]);
  }

  return { users, project, stages };
}
```

- [ ] **Step 2: Run seed**

```bash
cd /c/Work/Kanbanchik/apps/backend
npm run seed 2>&1
```

Expected: `Seed complete.`

- [ ] **Step 3: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/backend/src/database/demo-data.ts
git commit -m "feat: update seed — passwords + ProjectMembers, drop Team refs"
```

---

## Task 9: Frontend — api.ts + types.ts refactor

**Files:**
- Modify: `apps/frontend/src/lib/types.ts`
- Modify: `apps/frontend/src/lib/api.ts`
- Delete: `apps/frontend/src/lib/user-context.ts`

- [ ] **Step 1: Update types.ts**

Replace `apps/frontend/src/lib/types.ts`:

```typescript
export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  competencies: string[];
  availability: string;
}

export interface Project {
  id: string;
  name: string;
  createdById: string | null;
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  projectId: string;
}

export interface Card {
  id: string;
  summary: string;
  description: string | null;
  type: string;
  priority: string;
  order: number;
  dueDate: string | null;
  projectId: string;
  stageId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectPermissionLevel = 'viewer' | 'collaborator' | 'admin';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectPermissionLevel;
  user: User;
}

export interface BoardData {
  project: Project;
  stages: Stage[];
  cards: Card[];
  myPermission: ProjectPermissionLevel;
}

export interface CardDraft {
  summary: string;
  description: string;
  type: string;
  priority: string;
}
```

- [ ] **Step 2: Rewrite api.ts**

Replace `apps/frontend/src/lib/api.ts`:

```typescript
import type {
  User, Project, BoardData, Card, CardDraft, Stage, ProjectMember, ProjectPermissionLevel,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly responseText: string,
  ) {
    super(`API ${status}: ${path}${responseText ? ` — ${tryParseMessage(responseText)}` : ''}`);
  }
}

function tryParseMessage(text: string): string {
  try {
    const parsed = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join(', ');
    if (typeof parsed.message === 'string') return parsed.message;
  } catch { /* ignore */ }
  return text;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) throw new ApiError(res.status, path, await res.text());
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  me: () => fetchJson<User>('/auth/me'),
  login: (email: string, password: string) =>
    fetchJson<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { name: string; lastName: string; email: string; password: string }) =>
    fetchJson<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchJson<void>('/auth/logout', { method: 'POST' }),

  // Users
  getUsers: () => fetchJson<User[]>('/users'),

  // Projects
  getProjects: () => fetchJson<Project[]>('/projects'),
  createProject: (data: { name: string }) =>
    fetchJson<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    fetchJson<void>(`/projects/${id}`, { method: 'DELETE' }),

  // Project members
  getProjectMembers: (projectId: string) =>
    fetchJson<{ members: ProjectMember[]; myPermission: ProjectPermissionLevel }>(
      `/projects/${projectId}/members`,
    ),
  addProjectMember: (projectId: string, userId: string, role?: ProjectPermissionLevel) =>
    fetchJson<ProjectMember>(`/projects/${projectId}/members`, {
      method: 'POST', body: JSON.stringify({ userId, role }),
    }),
  updateProjectMemberRole: (projectId: string, userId: string, role: ProjectPermissionLevel) =>
    fetchJson<ProjectMember>(`/projects/${projectId}/members/${userId}`, {
      method: 'PATCH', body: JSON.stringify({ role }),
    }),
  removeProjectMember: (projectId: string, userId: string) =>
    fetchJson<void>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),

  // Stages
  createStage: (projectId: string, data: { name: string; order?: number }) =>
    fetchJson<Stage>(`/projects/${projectId}/stages`, { method: 'POST', body: JSON.stringify(data) }),
  reorderStages: (projectId: string, stageIds: string[]) =>
    fetchJson<Stage[]>(`/projects/${projectId}/stages/reorder`, {
      method: 'PATCH', body: JSON.stringify({ stageIds }),
    }),
  updateStage: (id: string, data: { name?: string; order?: number }) =>
    fetchJson<Stage>(`/stages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStage: (id: string) => fetchJson<void>(`/stages/${id}`, { method: 'DELETE' }),

  // Board
  getBoard: (projectId: string) => fetchJson<BoardData>(`/projects/${projectId}/board`),

  // Cards
  createCard: (data: Omit<Card, 'id' | 'order' | 'createdAt' | 'updatedAt'>) =>
    fetchJson<Card>('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: Partial<Card>) =>
    fetchJson<Card>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCard: (id: string) => fetchJson<void>(`/cards/${id}`, { method: 'DELETE' }),
  moveCard: (id: string, stageId: string, order: number) =>
    fetchJson<Card>(`/cards/${id}/move`, { method: 'POST', body: JSON.stringify({ stageId, order }) }),

  // AI
  importSpec: (text: string) =>
    fetchJson<CardDraft[]>('/ai/import', { method: 'POST', body: JSON.stringify({ text }) }),
  confirmImport: (projectId: string, stageId: string, cards: CardDraft[]) =>
    fetchJson<Card[]>('/ai/confirm', { method: 'POST', body: JSON.stringify({ projectId, stageId, cards }) }),
};
```

- [ ] **Step 3: Delete user-context.ts**

```bash
rm apps/frontend/src/lib/user-context.ts
```

- [ ] **Step 4: Fix broken imports in Sidebar**

`Sidebar.tsx` currently imports `getStoredUserId` and `setStoredUserId`. Those will be fixed in Task 12 when Sidebar is rewritten. For now, to keep compilation passing, open `apps/frontend/src/components/layout/Sidebar.tsx` and temporarily remove those imports and the related state, replacing the body with a placeholder:

```typescript
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { PROJECTS_UPDATED_EVENT } from '@/lib/project-events';
import type { Project } from '@/lib/types';
import styles from './Sidebar.module.css';

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    api.getProjects().then((p) => { if (active) setProjects(p); }).catch(() => {});
    const handler = () => { api.getProjects().then((p) => { if (active) setProjects(p); }).catch(() => {}); };
    window.addEventListener(PROJECTS_UPDATED_EVENT, handler);
    return () => { active = false; window.removeEventListener(PROJECTS_UPDATED_EVENT, handler); };
  }, []);

  return (
    <aside className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <nav className={styles.sidebar}>
        <div className={styles.topRow}>
          <Link href="/projects" className={styles.logoLink} aria-label="Kanbanchik home">
            <Image src="/boar.svg" alt="Kanbanchik" width={60} height={60} className={styles.logo} />
          </Link>
          <button type="button" className={styles.toggleButton} onClick={onToggle}><X size={20} /></button>
        </div>
        <div className={styles.section}>Projects</div>
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}/board`}
            className={`${styles.navItem} ${pathname === `/projects/${p.id}/board` ? styles.active : ''}`}>
            {p.name}
          </Link>
        ))}
        <Link href="/projects" className={`${styles.navItem} ${pathname === '/projects' ? styles.active : ''}`}>
          All Projects
        </Link>
        <div className={styles.spacer} />
        <div className={styles.userSection}>
          <div className={styles.userLabel}>Loading…</div>
        </div>
      </nav>
    </aside>
  );
}
```

> This is a temporary state — it will be properly rewritten in Task 12.

- [ ] **Step 5: Verify frontend type-check**

```bash
cd /c/Work/Kanbanchik/apps/frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (clean).

- [ ] **Step 6: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/frontend/src/lib/ apps/frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: refactor api.ts to credentials+cookie, remove user-context"
```

---

## Task 10: Frontend — AuthContext + RequireAuth + root layout

**Files:**
- Create: `apps/frontend/src/contexts/AuthContext.tsx`
- Create: `apps/frontend/src/components/auth/RequireAuth.tsx`
- Modify: `apps/frontend/src/app/layout.tsx`

- [ ] **Step 1: Create AuthContext**

Create `apps/frontend/src/contexts/AuthContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 2: Create RequireAuth**

Create `apps/frontend/src/components/auth/RequireAuth.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login');
    }
  }, [loading, currentUser, router]);

  if (loading || !currentUser) return null;
  return <>{children}</>;
}
```

- [ ] **Step 3: Update root layout to AuthProvider only**

Replace `apps/frontend/src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const geist = Geist({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Kanbanchik',
  description: 'Kanban board',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify type-check**

```bash
cd /c/Work/Kanbanchik/apps/frontend && npx tsc --noEmit 2>&1
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/frontend/src/contexts/ apps/frontend/src/components/auth/ apps/frontend/src/app/layout.tsx
git commit -m "feat: add AuthContext, RequireAuth, update root layout"
```

---

## Task 11: Frontend — Route restructure + login/register pages

**Overview:** Move existing pages under `app/(main)/`, add `(main)/layout.tsx` with AppShell+RequireAuth, create `(auth)/` for login/register.

- [ ] **Step 1: Create (main)/layout.tsx**

Create `apps/frontend/src/app/(main)/layout.tsx`:

```typescript
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
```

- [ ] **Step 2: Move existing pages under (main)**

```bash
cd /c/Work/Kanbanchik/apps/frontend/src/app
mkdir -p "(main)/projects/[id]/board"
# Copy files
cp projects/page.tsx "(main)/projects/page.tsx"
cp projects/page.module.css "(main)/projects/page.module.css"
cp "projects/[id]/board/page.tsx" "(main)/projects/[id]/board/page.tsx"
cp "projects/[id]/board/page.module.css" "(main)/projects/[id]/board/page.module.css"
# Delete originals
rm -rf projects teams
```

- [ ] **Step 3: Create (auth)/layout.tsx**

Create `apps/frontend/src/app/(auth)/layout.tsx`:

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 4: Create login page CSS**

Create `apps/frontend/src/app/(auth)/login/page.module.css`:

```css
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.heading {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--color-text);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-bg);
  color: var(--color-text);
}

.input:focus {
  outline: none;
  border-color: var(--color-indigo);
}

.error {
  color: #ef4444;
  font-size: 13px;
  margin-bottom: 12px;
}

.footer {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.link {
  font-size: 13px;
  color: var(--color-indigo);
  text-decoration: none;
}

.link:hover { text-decoration: underline; }
```

- [ ] **Step 5: Create login page**

Create `apps/frontend/src/app/(auth)/login/page.tsx`:

```typescript
'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      router.replace('/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign in</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.footer}>
            <Button type="submit" disabled={loading || !email || !password}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <Link href="/register" className={styles.link}>
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create register page CSS**

Create `apps/frontend/src/app/(auth)/register/page.module.css` with the same content as `login/page.module.css` above.

- [ ] **Step 7: Create register page**

Create `apps/frontend/src/app/(auth)/register/page.tsx`:

```typescript
'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await api.register(form);
      setCurrentUser(user);
      router.replace('/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Create account</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className={styles.field}>
            <label className={styles.label}>First name</label>
            <input className={styles.input} value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Last name</label>
            <input className={styles.input} value={form.lastName} onChange={set('lastName')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={form.password} onChange={set('password')} required minLength={8} />
          </div>
          <div className={styles.footer}>
            <Button type="submit" disabled={loading || !form.name || !form.email || !form.password}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
            <Link href="/login" className={styles.link}>
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Verify frontend type-check**

```bash
cd /c/Work/Kanbanchik/apps/frontend && npx tsc --noEmit 2>&1
```

Expected: no output.

- [ ] **Step 9: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/frontend/src/app/
git commit -m "feat: route groups (auth)/(main), login/register pages"
```

---

## Task 12: Frontend — Sidebar update

**Files:**
- Modify: `apps/frontend/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Rewrite Sidebar**

Replace `apps/frontend/src/components/layout/Sidebar.tsx`:

```typescript
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PROJECTS_UPDATED_EVENT } from '@/lib/project-events';
import type { Project } from '@/lib/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = () => {
    api.getProjects().then(setProjects).catch(() => {});
  };

  useEffect(() => {
    loadProjects();
    window.addEventListener(PROJECTS_UPDATED_EVENT, loadProjects);
    return () => window.removeEventListener(PROJECTS_UPDATED_EVENT, loadProjects);
  }, []);

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setCurrentUser(null);
    router.replace('/login');
  };

  return (
    <aside className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <nav className={styles.sidebar}>
        <div className={styles.topRow}>
          <Link href="/projects" className={styles.logoLink} aria-label="Kanbanchik home">
            <Image src="/boar.svg" alt="Kanbanchik" width={60} height={60} className={styles.logo} />
          </Link>
          <button type="button" className={styles.toggleButton} onClick={onToggle}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.section}>Projects</div>
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}/board`}
            className={`${styles.navItem} ${pathname === `/projects/${p.id}/board` ? styles.active : ''}`}
          >
            {p.name}
          </Link>
        ))}
        <Link
          href="/projects"
          className={`${styles.navItem} ${pathname === '/projects' ? styles.active : ''}`}
        >
          All Projects
        </Link>

        <div className={styles.spacer} />

        <div className={styles.userSection}>
          {currentUser && (
            <>
              <div className={styles.userLabel}>
                {currentUser.name} {currentUser.lastName}
              </div>
              {currentUser.role && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {currentUser.role}
                </div>
              )}
            </>
          )}
          <button
            type="button"
            className={styles.userSelect}
            style={{ cursor: 'pointer', textAlign: 'left' }}
            onClick={() => void handleLogout()}
          >
            Log out
          </button>
        </div>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Verify type-check**

```bash
cd /c/Work/Kanbanchik/apps/frontend && npx tsc --noEmit 2>&1
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: replace user-switcher with logged-in user display + logout"
```

---

## Task 13: Frontend — Project Settings page + gear icon on board

**Files:**
- Create: `apps/frontend/src/app/(main)/projects/[id]/settings/page.module.css`
- Create: `apps/frontend/src/app/(main)/projects/[id]/settings/page.tsx`
- Modify: `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx`

- [ ] **Step 1: Create settings page CSS**

Create `apps/frontend/src/app/(main)/projects/[id]/settings/page.module.css`:

```css
.page { max-width: 720px; margin: 0 auto; padding: 32px 24px; }

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.heading { font-size: 22px; font-weight: 700; flex: 1; }

.backLink {
  font-size: 13px;
  color: var(--color-indigo);
  text-decoration: none;
}
.backLink:hover { text-decoration: underline; }

.sectionTitle {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.memberRow {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: 8px;
  box-shadow: var(--shadow-card);
}

.memberName { flex: 1; font-weight: 600; }
.memberEmail { font-size: 12px; color: var(--color-text-secondary); }
.ownerBadge { font-size: 12px; color: var(--color-text-secondary); font-style: italic; }

.roleSelect {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  background: var(--color-bg);
  cursor: pointer;
}

.addRow {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  align-items: center;
}

.addSelect {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-bg);
}

.error { color: #ef4444; font-size: 13px; margin-top: 8px; }
.status { color: var(--color-text-secondary); font-size: 14px; }
```

- [ ] **Step 2: Create settings page**

Create `apps/frontend/src/app/(main)/projects/[id]/settings/page.tsx`:

```typescript
'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectMember, ProjectPermissionLevel, User } from '@/lib/types';
import styles from './page.module.css';

const ROLES: ProjectPermissionLevel[] = ['viewer', 'collaborator', 'admin'];

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [myPermission, setMyPermission] = useState<ProjectPermissionLevel | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [projectName, setProjectName] = useState('');
  const [createdById, setCreatedById] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [boardData, membersData] = await Promise.all([
      api.getBoard(id),
      api.getProjectMembers(id),
    ]);
    setProjectName(boardData.project.name);
    setCreatedById(boardData.project.createdById);
    setMembers(membersData.members);
    setMyPermission(membersData.myPermission);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (myPermission === 'admin') {
      api.getUsers().then(setAllUsers).catch(() => {});
    }
  }, [myPermission]);

  const isAdmin = myPermission === 'admin';
  const memberUserIds = new Set([
    ...(createdById ? [createdById] : []),
    ...members.map((m) => m.userId),
  ]);
  const addablUsers = allUsers.filter((u) => !memberUserIds.has(u.id));

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setError(null);
    try {
      await api.addProjectMember(id, selectedUserId);
      setSelectedUserId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRoleChange = async (userId: string, role: ProjectPermissionLevel) => {
    setError(null);
    try {
      await api.updateProjectMemberRole(id, userId, role);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleRemove = async (member: ProjectMember) => {
    if (!window.confirm(`Remove ${member.user.name} from this project?`)) return;
    setError(null);
    try {
      await api.removeProjectMember(id, member.userId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  if (loading) return <div className={styles.status}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Settings — {projectName}</h1>
        <Link href={`/projects/${id}/board`} className={styles.backLink}>← Back to board</Link>
      </div>

      <div className={styles.sectionTitle}>Members</div>

      {createdById && currentUser && (
        <div className={styles.memberRow}>
          <div style={{ flex: 1 }}>
            <div className={styles.memberName}>
              {allUsers.find((u) => u.id === createdById)?.name ?? 'Project Owner'}
              {createdById === currentUser.id ? ' (you)' : ''}
            </div>
          </div>
          <span className={styles.ownerBadge}>Admin — owner</span>
        </div>
      )}

      {members.map((member) => (
        <div key={member.id} className={styles.memberRow}>
          <div style={{ flex: 1 }}>
            <div className={styles.memberName}>
              {member.user.name} {member.user.lastName}
              {member.userId === currentUser?.id ? ' (you)' : ''}
            </div>
            <div className={styles.memberEmail}>{member.user.email}</div>
          </div>
          {isAdmin ? (
            <>
              <select
                className={styles.roleSelect}
                value={member.role}
                onChange={(e) => void handleRoleChange(member.userId, e.target.value as ProjectPermissionLevel)}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <Button variant="danger" onClick={() => void handleRemove(member)}>Remove</Button>
            </>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{member.role}</span>
          )}
        </div>
      ))}

      {isAdmin && (
        <div className={styles.addRow}>
          <select
            className={styles.addSelect}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Add member…</option>
            {addablUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.lastName} ({u.email})
              </option>
            ))}
          </select>
          <Button disabled={!selectedUserId} onClick={() => void handleAdd()}>
            Add
          </Button>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Add gear icon to board page**

In `apps/frontend/src/app/(main)/projects/[id]/board/page.tsx`, add the `Settings` import and gear link:

At the top, add to imports:
```typescript
import Link from 'next/link';
import { Settings } from 'lucide-react';
```

In the page header JSX, add the settings link inside `styles.actions` (next to "Import from spec"):
```tsx
<div className={styles.actions}>
  <Link href={`/projects/${id}/settings`} title="Project Settings"
    style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: 6, color: 'var(--color-text-secondary)' }}>
    <Settings size={18} />
  </Link>
  <Button variant="ghost" onClick={() => setShowAiImport(true)}>
    Import from spec
  </Button>
</div>
```

- [ ] **Step 4: Verify full frontend type-check**

```bash
cd /c/Work/Kanbanchik/apps/frontend && npx tsc --noEmit 2>&1
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd /c/Work/Kanbanchik
git add apps/frontend/src/app/(main)/projects/
git commit -m "feat: project settings page with member management + gear icon on board"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|---|---|
| JWT httpOnly cookie auth | Tasks 4, 5 |
| Register: name, lastName, email, password | Task 4 |
| Login: email + password | Task 4 |
| Logout clears cookie | Task 4 |
| `/auth/me` returns current user | Task 4 |
| UserGuard reads JWT from cookie | Task 5 |
| X-User-Id removed entirely | Tasks 5, 7 |
| `@fastify/cookie` registered | Task 5 |
| CORS `credentials: true` | Task 5 |
| `passwordHash` on User, `select: false` | Task 1 |
| Drop Team + ProjectTeamPermission | Tasks 2, 7 |
| ProjectMember entity (projectId, userId, role) | Task 2 |
| PermissionService uses ProjectMember | Task 3 |
| Creator always ADMIN via `createdById` | Task 3 |
| GET /users requires auth | Task 7 |
| ProjectMember CRUD endpoints | Task 6 |
| Creator row immutable (400 on PATCH/DELETE) | Task 6 |
| Settings page at `/projects/:id/settings` | Task 13 |
| Gear icon on board header | Task 13 |
| ADMIN-only controls on settings page | Task 13 |
| Read-only member list for non-ADMIN | Task 13 |
| Sidebar: remove user switcher + teams | Task 12 |
| Sidebar: show user + logout | Task 12 |
| login/register pages outside AppShell | Task 11 |
| RequireAuth redirects to /login | Task 10 |
| AuthContext on mount calls /auth/me | Task 10 |
| api.ts: credentials: include | Task 9 |
| Seed: passwords + ProjectMembers | Task 8 |

### Placeholder Scan

No TBDs or incomplete sections. Task 12 Sidebar rewrite references `styles.userSelect` (existing CSS class from the old user switcher) for the logout button styling — this reuses an existing class for a similar visual element.

### Type Consistency

- `ProjectPermissionLevel` is defined once in `project-member.entity.ts` (Task 2) and `types.ts` (Task 9); all downstream references use the same three values: `viewer`, `collaborator`, `admin`.
- `ProjectsService.create(dto, createdById)` — signature matches controller call in Task 6.
- `api.getProjectMembers()` returns `{ members, myPermission }` — matches Task 13 destructuring.
- `BoardData.myPermission` — added in previous sprint, used by board page, consistent with Task 9 `types.ts`.
