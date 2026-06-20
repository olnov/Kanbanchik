# Mattermost Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Sign in with Mattermost" as an alternative login that proxies the user's Mattermost credentials to a configured Mattermost server and issues a normal Kanbanchik session.

**Architecture:** A new backend `MattermostService` calls the Mattermost Login API (`POST {MATTERMOST_URL}/api/v4/users/login`). `AuthService.loginWithMattermost` re-matches returning users by `mattermostUserId`, rejects email collisions with an existing account, and otherwise JIT-provisions a local user. A new public controller endpoint sets the same `access_token` JWT cookie as local login. The frontend login page gains a Mattermost button that reveals a credential panel.

**Tech Stack:** NestJS + TypeORM (Fastify), `@nestjs/config`, Jest, global `fetch` (Node 22), Next.js 16 / React 19 client component, CSS modules.

## Global Constraints

- Backend API base path: `/api/v1` (controllers use bare paths, e.g. `auth/login/mattermost`).
- New env vars: `MATTERMOST_URL`, `MATTERMOST_ENABLED` (backend); `NEXT_PUBLIC_MATTERMOST_ENABLED` (frontend).
- Cookie handling for any successful login: `reply.setCookie('access_token', signToken(user.id), COOKIE_OPTIONS)` where `COOKIE_OPTIONS = { httpOnly: true, sameSite: 'strict', path: '/' }`.
- Provisioned Mattermost users have `passwordHash: ''` and `authProvider: 'mattermost'`; they are Mattermost-only (no local password).
- DTO/Swagger style: `@ApiProperty()` + `class-validator` decorators on each field, matching `LoginDto`.
- Run backend tests with `pnpm --filter backend test`.

---

### Task 1: MattermostService — proxy to the Mattermost Login API

**Files:**
- Create: `apps/backend/src/modules/auth/mattermost.service.ts`
- Test: `apps/backend/src/modules/auth/mattermost.service.spec.ts`

**Interfaces:**
- Consumes: `ConfigService` (`MATTERMOST_URL`, `MATTERMOST_ENABLED`).
- Produces:
  - `interface MattermostProfile { id: string; email: string; firstName: string; lastName: string; username: string; }`
  - `MattermostService.authenticate(loginId: string, password: string): Promise<MattermostProfile>`

- [ ] **Step 1: Write the failing test**

```ts
// apps/backend/src/modules/auth/mattermost.service.spec.ts
import { Test } from '@nestjs/testing';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MattermostService } from './mattermost.service';

const config = {
  get: jest.fn((key: string) => {
    if (key === 'MATTERMOST_URL') return 'https://mm.example.com';
    if (key === 'MATTERMOST_ENABLED') return 'true';
    return undefined;
  }),
};

describe('MattermostService', () => {
  let service: MattermostService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        MattermostService,
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(MattermostService);
  });

  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockRestore?.();
  });

  it('returns a mapped profile on 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'mm-1', email: 'a@b.com', first_name: 'Al', last_name: 'Ice', username: 'alice',
      }),
    }) as unknown as typeof fetch;

    const profile = await service.authenticate('alice', 'pw');

    expect(profile).toEqual({
      id: 'mm-1', email: 'a@b.com', firstName: 'Al', lastName: 'Ice', username: 'alice',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://mm.example.com/api/v4/users/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: 'alice', password: 'pw' }),
      }),
    );
  });

  it('throws UnauthorizedException on 401', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as unknown as typeof fetch;
    await expect(service.authenticate('alice', 'bad')).rejects.toThrow(UnauthorizedException);
  });

  it('throws ServiceUnavailableException when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    await expect(service.authenticate('alice', 'pw')).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws ServiceUnavailableException when not configured', async () => {
    config.get.mockReturnValue(undefined);
    await expect(service.authenticate('alice', 'pw')).rejects.toThrow(ServiceUnavailableException);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter backend test -- mattermost.service`
Expected: FAIL — cannot find module `./mattermost.service`.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/backend/src/modules/auth/mattermost.service.ts
import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MattermostProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface MattermostUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username: string;
}

@Injectable()
export class MattermostService {
  constructor(private readonly config: ConfigService) {}

  async authenticate(loginId: string, password: string): Promise<MattermostProfile> {
    const baseUrl = this.config.get<string>('MATTERMOST_URL');
    const enabled = this.config.get<string>('MATTERMOST_ENABLED') === 'true';
    if (!baseUrl || !enabled) {
      throw new ServiceUnavailableException('Mattermost login is not enabled');
    }

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/api/v4/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, password }),
      });
    } catch {
      throw new ServiceUnavailableException('Mattermost unreachable');
    }

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Mattermost credentials');
    }

    const user = (await res.json()) as MattermostUser;
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name ?? '',
      lastName: user.last_name ?? '',
      username: user.username,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter backend test -- mattermost.service`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/auth/mattermost.service.ts apps/backend/src/modules/auth/mattermost.service.spec.ts
git commit -m "feat(backend): add MattermostService to proxy Mattermost login API"
```

---

### Task 2: User entity columns + AuthService.loginWithMattermost

**Files:**
- Modify: `apps/backend/src/modules/users/user.entity.ts`
- Modify: `apps/backend/src/modules/auth/auth.service.ts`
- Test: `apps/backend/src/modules/auth/auth.service.spec.ts` (add a `loginWithMattermost` describe block)

**Interfaces:**
- Consumes: `MattermostService.authenticate(loginId, password): Promise<MattermostProfile>` (Task 1).
- Produces: `AuthService.loginWithMattermost(loginId: string, password: string): Promise<User>`.
- Entity gains: `authProvider: string` (default `'local'`), `mattermostUserId: string | null` (nullable).

- [ ] **Step 1: Add the entity columns**

In `apps/backend/src/modules/users/user.entity.ts`, add after the `availability` column and before `passwordHash`:

```ts
  @ApiProperty()
  @Column({ default: 'local' })
  authProvider: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  mattermostUserId: string | null;
```

- [ ] **Step 2: Write the failing tests**

In `apps/backend/src/modules/auth/auth.service.spec.ts`, add `ConflictException` is already imported. Add a `MattermostService` mock at the top alongside the other mocks:

```ts
import { MattermostService } from './mattermost.service';

const mockMattermost = { authenticate: jest.fn() };
```

Register it as a provider inside `Test.createTestingModule` (add to the `providers` array):

```ts
        { provide: MattermostService, useValue: mockMattermost },
```

Then add this describe block before the final `signToken` test:

```ts
  describe('loginWithMattermost', () => {
    const profile = {
      id: 'mm-1', email: 'a@b.com', firstName: 'Al', lastName: 'Ice', username: 'alice',
    };

    it('returns existing user matched by mattermostUserId', async () => {
      mockMattermost.authenticate.mockResolvedValue(profile);
      mockUserRepo.findOneBy.mockImplementation(({ mattermostUserId }) =>
        mattermostUserId === 'mm-1' ? { id: 'u1', email: 'a@b.com' } : null,
      );

      const result = await service.loginWithMattermost('alice', 'pw');

      expect(result).toEqual({ id: 'u1', email: 'a@b.com' });
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when email already belongs to another account', async () => {
      mockMattermost.authenticate.mockResolvedValue(profile);
      mockUserRepo.findOneBy.mockImplementation(({ mattermostUserId, email }) => {
        if (mattermostUserId) return null;
        if (email === 'a@b.com') return { id: 'local-1', email: 'a@b.com' };
        return null;
      });

      await expect(service.loginWithMattermost('alice', 'pw')).rejects.toThrow(ConflictException);
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('provisions a new Mattermost user when no match exists', async () => {
      mockMattermost.authenticate.mockResolvedValue(profile);
      mockUserRepo.findOneBy.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation((v) => v);
      mockUserRepo.save.mockResolvedValue({ id: 'new-1' });
      mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 'new-1', email: 'a@b.com' });

      const result = await service.loginWithMattermost('alice', 'pw');

      expect(result).toEqual({ id: 'new-1', email: 'a@b.com' });
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          name: 'Al',
          lastName: 'Ice',
          authProvider: 'mattermost',
          mattermostUserId: 'mm-1',
          passwordHash: '',
        }),
      );
    });
  });
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter backend test -- auth.service`
Expected: FAIL — `service.loginWithMattermost is not a function`.

- [ ] **Step 4: Implement the method**

In `apps/backend/src/modules/auth/auth.service.ts`, add `ConflictException` is already imported. Inject `MattermostService` in the constructor and add the method:

```ts
import { MattermostService } from './mattermost.service';
```

Constructor — add the parameter:

```ts
    private readonly mattermostService: MattermostService,
```

Method (add after `login`):

```ts
  async loginWithMattermost(loginId: string, password: string): Promise<User> {
    const profile = await this.mattermostService.authenticate(loginId, password);

    const existingByMm = await this.userRepo.findOneBy({ mattermostUserId: profile.id });
    if (existingByMm) return existingByMm;

    const emailTaken = await this.userRepo.findOneBy({ email: profile.email });
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists');
    }

    const saved = await this.userRepo.save(
      this.userRepo.create({
        name: (profile.firstName || profile.username).trim(),
        lastName: profile.lastName.trim(),
        email: profile.email,
        role: '',
        passwordHash: '',
        authProvider: 'mattermost',
        mattermostUserId: profile.id,
      }),
    );
    return this.userRepo.findOneByOrFail({ id: saved.id });
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter backend test -- auth.service`
Expected: PASS (all existing tests plus the 3 new ones).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/users/user.entity.ts apps/backend/src/modules/auth/auth.service.ts apps/backend/src/modules/auth/auth.service.spec.ts
git commit -m "feat(backend): add loginWithMattermost with JIT provisioning and email-collision guard"
```

---

### Task 3: DTO, controller endpoint, and module wiring

**Files:**
- Create: `apps/backend/src/modules/auth/dto/login-mattermost.dto.ts`
- Modify: `apps/backend/src/modules/auth/auth.controller.ts`
- Modify: `apps/backend/src/modules/auth/auth.module.ts`
- Modify: `apps/backend/.env.example`

**Interfaces:**
- Consumes: `AuthService.loginWithMattermost(loginId, password)` (Task 2), `MattermostService` (Task 1).
- Produces: `POST /auth/login/mattermost` accepting `{ loginId, password }`, setting `access_token` cookie, returning `User`.

- [ ] **Step 1: Create the DTO**

```ts
// apps/backend/src/modules/auth/dto/login-mattermost.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginMattermostDto {
  @ApiProperty() @IsString() @IsNotEmpty() loginId: string;
  @ApiProperty() @IsString() @IsNotEmpty() password: string;
}
```

- [ ] **Step 2: Add the controller endpoint**

In `apps/backend/src/modules/auth/auth.controller.ts`, import the DTO:

```ts
import { LoginMattermostDto } from './dto/login-mattermost.dto';
```

Add this handler after the existing `login` handler:

```ts
  @Post('login/mattermost')
  @Public()
  async loginMattermost(
    @Body() dto: LoginMattermostDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const user = await this.authService.loginWithMattermost(dto.loginId, dto.password);
    reply.setCookie('access_token', this.authService.signToken(user.id), COOKIE_OPTIONS);
    return user;
  }
```

- [ ] **Step 3: Register MattermostService in the module**

In `apps/backend/src/modules/auth/auth.module.ts`, import and add to providers:

```ts
import { MattermostService } from './mattermost.service';
```

```ts
  providers: [AuthService, MattermostService],
```

- [ ] **Step 4: Document env vars**

Append to `apps/backend/.env.example`:

```env
MATTERMOST_ENABLED=false
MATTERMOST_URL=
```

- [ ] **Step 5: Verify it builds and all backend tests pass**

Run: `pnpm --filter backend build`
Expected: build succeeds with no TypeScript errors.

Run: `pnpm --filter backend test`
Expected: PASS — full backend suite green.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/auth/dto/login-mattermost.dto.ts apps/backend/src/modules/auth/auth.controller.ts apps/backend/src/modules/auth/auth.module.ts apps/backend/.env.example
git commit -m "feat(backend): expose POST /auth/login/mattermost endpoint"
```

---

### Task 4: Frontend — API method and Mattermost login UI

**Files:**
- Modify: `apps/frontend/src/lib/api.ts`
- Modify: `apps/frontend/src/app/(auth)/login/page.tsx`
- Modify: `apps/frontend/src/app/(auth)/login/page.module.css`

**Interfaces:**
- Consumes: `POST /auth/login/mattermost` (Task 3).
- Produces: `api.loginMattermost(loginId, password): Promise<User>`; a Mattermost panel on the login page gated by `NEXT_PUBLIC_MATTERMOST_ENABLED === 'true'`.

- [ ] **Step 1: Add the API method**

In `apps/frontend/src/lib/api.ts`, add inside the `// Auth` block, after `login`:

```ts
  loginMattermost: (loginId: string, password: string) =>
    fetchJson<User>('/auth/login/mattermost', {
      method: 'POST', body: JSON.stringify({ loginId, password }),
    }),
```

- [ ] **Step 2: Add Mattermost UI to the login page**

In `apps/frontend/src/app/(auth)/login/page.tsx`, add state and a handler, and render the panel. Replace the component body so it includes the Mattermost section. Add these state hooks after the existing ones:

```tsx
  const mattermostEnabled = process.env.NEXT_PUBLIC_MATTERMOST_ENABLED === 'true';
  const [showMattermost, setShowMattermost] = useState(false);
  const [mmLoginId, setMmLoginId] = useState('');
  const [mmPassword, setMmPassword] = useState('');
```

Add this handler after `handleSubmit`:

```tsx
  const handleMattermostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await api.loginMattermost(mmLoginId, mmPassword);
      setCurrentUser(user);
      router.replace('/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mattermost login failed');
    } finally {
      setLoading(false);
    }
  };
```

Inside the `.card` div, after the closing `</form>` of the local form, add:

```tsx
        {mattermostEnabled && (
          <div className={styles.altAuth}>
            <div className={styles.divider}><span>or</span></div>
            {!showMattermost ? (
              <Button type="button" variant="ghost" onClick={() => setShowMattermost(true)}>
                Sign in with Mattermost
              </Button>
            ) : (
              <form onSubmit={(e) => void handleMattermostSubmit(e)}>
                <div className={styles.field}>
                  <label className={styles.label}>Mattermost username or email</label>
                  <input className={styles.input} type="text" value={mmLoginId}
                    onChange={(e) => setMmLoginId(e.target.value)} required autoFocus />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mattermost password</label>
                  <input className={styles.input} type="password" value={mmPassword}
                    onChange={(e) => setMmPassword(e.target.value)} required />
                </div>
                <div className={styles.footer}>
                  <Button type="submit" disabled={loading || !mmLoginId || !mmPassword}>
                    {loading ? 'Signing in…' : 'Sign in with Mattermost'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
```

- [ ] **Step 3: Add the supporting styles**

Append to `apps/frontend/src/app/(auth)/login/page.module.css`:

```css
.altAuth {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.divider span { padding: 0 12px; }
```

- [ ] **Step 4: Verify it builds and typechecks**

Run: `pnpm --filter frontend build`
Expected: build succeeds with no TypeScript/lint errors.

- [ ] **Step 5: Document the frontend flag**

If `apps/frontend/.env.example` exists, append `NEXT_PUBLIC_MATTERMOST_ENABLED=false`. Otherwise note it in the README's local-development env list. Verify by reading the file before editing.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/lib/api.ts "apps/frontend/src/app/(auth)/login/page.tsx" "apps/frontend/src/app/(auth)/login/page.module.css"
git commit -m "feat(frontend): add Sign in with Mattermost option to login form"
```

---

## Manual verification (after all tasks)

1. Set `MATTERMOST_ENABLED=true` and `MATTERMOST_URL=<your server>` in `apps/backend/.env`, and `NEXT_PUBLIC_MATTERMOST_ENABLED=true` for the frontend.
2. Run `pnpm dev:backend` and `pnpm dev:frontend`.
3. On the login page, click "Sign in with Mattermost", enter valid Mattermost credentials → lands on `/projects`; a new user appears in the DB with `authProvider='mattermost'`.
4. Log out and back in via Mattermost → same user, no duplicate (matched by `mattermostUserId`).
5. Enter invalid credentials → "Invalid Mattermost credentials".
6. Pre-create a local user with email X, then log in via Mattermost with a profile whose email is X → "An account with this email already exists".
