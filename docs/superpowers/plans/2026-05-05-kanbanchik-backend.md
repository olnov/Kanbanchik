# Kanbanchik Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the pnpm monorepo and build the full NestJS backend — all modules, PostgreSQL entities, REST API with Fastify/Pino/Swagger, UserInterceptor, AI mock, and seed data.

**Architecture:** pnpm monorepo with `apps/backend` as a self-contained NestJS app. Fastify adapter, TypeORM for PostgreSQL, Pino logging, Swagger docs at `/api/docs`. All routes versioned under `/api/v1/`. Auth is a mocked `X-User-Id` header; AI is a swappable `AiProvider` interface backed by a mock.

**Tech Stack:** pnpm workspaces, NestJS, `@nestjs/platform-fastify`, TypeORM, PostgreSQL, `nestjs-pino`, `pino-pretty`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `@nestjs/config`, Jest

---

## File Map

```
kanbanchik/
  package.json                               # pnpm workspaces root
  pnpm-workspace.yaml
  tsconfig.base.json
  .gitignore
  .eslintrc.json

  apps/backend/
    package.json
    tsconfig.json
    .env.example
    src/
      main.ts
      app.module.ts
      common/
        interceptors/
          user.interceptor.ts
          user.interceptor.spec.ts
      modules/
        users/
          user.entity.ts
          users.module.ts
          users.service.ts
          users.service.spec.ts
          users.controller.ts
          dto/
            create-user.dto.ts
            update-user.dto.ts
        teams/
          team.entity.ts
          teams.module.ts
          teams.service.ts
          teams.service.spec.ts
          teams.controller.ts
          dto/
            create-team.dto.ts
        projects/
          project.entity.ts
          projects.module.ts
          projects.service.ts
          projects.service.spec.ts
          projects.controller.ts
          dto/
            create-project.dto.ts
        stages/
          stage.entity.ts
          stages.module.ts
          stages.service.ts
          stages.service.spec.ts
          stages.controller.ts
          dto/
            create-stage.dto.ts
            update-stage.dto.ts
        cards/
          card.entity.ts
          cards.module.ts
          cards.service.ts
          cards.service.spec.ts
          cards.controller.ts
          dto/
            create-card.dto.ts
            update-card.dto.ts
            move-card.dto.ts
        ai/
          ai.module.ts
          ai.service.ts
          ai.service.spec.ts
          ai.controller.ts
          dto/
            import-spec.dto.ts
            confirm-import.dto.ts
          providers/
            ai-provider.interface.ts
            mock.provider.ts
            mock.provider.spec.ts
      database/
        seed.ts
```

---

## Task 1: Monorepo root scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.eslintrc.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "kanbanchik",
  "private": true,
  "scripts": {
    "dev:backend": "pnpm --filter backend dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:electron": "pnpm --filter electron dev",
    "test": "pnpm -r test",
    "build": "pnpm -r build"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
```

- [ ] **Step 3: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.env
*.local
.DS_Store
.superpowers/
```

- [ ] **Step 5: Create `.eslintrc.json`**

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

- [ ] **Step 6: Install root dev dependencies**

```bash
pnpm install
```

Expected: `node_modules/` created at root with ESLint and TypeScript.

- [ ] **Step 7: Commit**

```bash
git init
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore .eslintrc.json pnpm-lock.yaml
git commit -m "chore: monorepo root scaffold"
```

---

## Task 2: Backend — package scaffold

**Files:**
- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/.env.example`

- [ ] **Step 1: Create `apps/backend/package.json`**

```json
{
  "name": "backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ts-node -r tsconfig-paths/register src/main.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "seed": "ts-node -r tsconfig-paths/register src/database/seed.ts",
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-fastify": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/config": "^3.0.0",
    "typeorm": "^0.3.20",
    "pg": "^8.11.0",
    "nestjs-pino": "^4.0.0",
    "pino-http": "^9.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "ts-node": "^10.9.0",
    "tsconfig-paths": "^4.2.0",
    "pino-pretty": "^11.0.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create `apps/backend/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `apps/backend/.env.example`**

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/kanbanchik
PORT=3001
NODE_ENV=development
AI_PROVIDER=mock
```

- [ ] **Step 4: Copy to `.env` and fill in your local DB URL**

```bash
cp apps/backend/.env.example apps/backend/.env
```

- [ ] **Step 5: Install backend dependencies**

```bash
pnpm --filter backend install
```

- [ ] **Step 6: Commit**

```bash
git add apps/backend/package.json apps/backend/tsconfig.json apps/backend/.env.example pnpm-lock.yaml
git commit -m "chore: backend package scaffold"
```

---

## Task 3: Backend — bootstrap (main.ts + app.module.ts)

**Files:**
- Create: `apps/backend/src/main.ts`
- Create: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create `apps/backend/src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'app://-'],
  });

  const config = new DocumentBuilder()
    .setTitle('Kanbanchik API')
    .setDescription('Kanban board REST API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}

bootstrap();
```

- [ ] **Step 2: Create `apps/backend/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { StagesModule } from './modules/stages/stages.module';
import { CardsModule } from './modules/cards/cards.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
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
    UsersModule,
    TeamsModule,
    ProjectsModule,
    StagesModule,
    CardsModule,
    AiModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/main.ts apps/backend/src/app.module.ts
git commit -m "feat(backend): bootstrap NestJS with Fastify, Pino, Swagger"
```

---

## Task 4: TypeORM entities

**Files:**
- Create: `apps/backend/src/modules/users/user.entity.ts`
- Create: `apps/backend/src/modules/teams/team.entity.ts`
- Create: `apps/backend/src/modules/projects/project.entity.ts`
- Create: `apps/backend/src/modules/stages/stage.entity.ts`
- Create: `apps/backend/src/modules/cards/card.entity.ts`

- [ ] **Step 1: Create `apps/backend/src/modules/users/user.entity.ts`**

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
}
```

- [ ] **Step 2: Create `apps/backend/src/modules/teams/team.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('teams')
export class Team {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;
}
```

- [ ] **Step 3: Create `apps/backend/src/modules/projects/project.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../teams/team.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  teamId: string | null;

  @ManyToOne(() => Team, { nullable: true, eager: false })
  team: Team | null;
}
```

- [ ] **Step 4: Create `apps/backend/src/modules/stages/stage.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../projects/project.entity';

@Entity('stages')
export class Stage {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ default: 0 })
  order: number;

  @ApiProperty()
  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;
}
```

- [ ] **Step 5: Create `apps/backend/src/modules/cards/card.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../projects/project.entity';
import { Stage } from '../stages/stage.entity';
import { User } from '../users/user.entity';

@Entity('cards')
export class Card {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  summary: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @ApiProperty()
  @Column()
  type: string;

  @ApiProperty()
  @Column()
  priority: string;

  @ApiProperty()
  @Column({ default: 0 })
  order: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true, type: 'date' })
  dueDate: string | null;

  @ApiProperty()
  @Column()
  projectId: string;

  @ApiProperty()
  @Column()
  stageId: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true })
  assigneeId: string | null;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => Stage, { onDelete: 'CASCADE' })
  stage: Stage;

  @ManyToOne(() => User, { nullable: true })
  assignee: User | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/
git commit -m "feat(backend): add TypeORM entities (User, Team, Project, Stage, Card)"
```

---

## Task 5: Users module

**Files:**
- Create: `apps/backend/src/modules/users/dto/create-user.dto.ts`
- Create: `apps/backend/src/modules/users/dto/update-user.dto.ts`
- Create: `apps/backend/src/modules/users/users.service.ts`
- Create: `apps/backend/src/modules/users/users.service.spec.ts`
- Create: `apps/backend/src/modules/users/users.controller.ts`
- Create: `apps/backend/src/modules/users/users.module.ts`

- [ ] **Step 1: Create `apps/backend/src/modules/users/dto/create-user.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  competencies?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  availability?: string;
}
```

- [ ] **Step 2: Create `apps/backend/src/modules/users/dto/update-user.dto.ts`**

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

- [ ] **Step 3: Write the failing test for UsersService**

Create `apps/backend/src/modules/users/users.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockUser: User = {
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'developer',
  competencies: ['typescript', 'react'],
  availability: 'available',
};

const mockRepo = {
  find: jest.fn().mockResolvedValue([mockUser]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockReturnValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('findAll returns array of users', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockUser]);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('findOne returns a single user', async () => {
    const result = await service.findOne('uuid-1');
    expect(result).toEqual(mockUser);
    expect(mockRepo.findOneByOrFail).toHaveBeenCalledWith({ id: 'uuid-1' });
  });
});
```

- [ ] **Step 4: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=users.service
```

Expected: `Cannot find module './users.service'`

- [ ] **Step 5: Create `apps/backend/src/modules/users/users.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<User> {
    return this.repo.findOneByOrFail({ id });
  }

  create(dto: CreateUserDto): Promise<User> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
}
```

- [ ] **Step 6: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=users.service
```

Expected: `PASS src/modules/users/users.service.spec.ts`

- [ ] **Step 7: Create `apps/backend/src/modules/users/users.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiSecurity('x-user-id')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }
}
```

- [ ] **Step 8: Create `apps/backend/src/modules/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
```

- [ ] **Step 9: Commit**

```bash
git add apps/backend/src/modules/users/
git commit -m "feat(backend): add Users module (CRUD)"
```

---

## Task 6: Teams module

**Files:**
- Create: `apps/backend/src/modules/teams/dto/create-team.dto.ts`
- Create: `apps/backend/src/modules/teams/teams.service.ts`
- Create: `apps/backend/src/modules/teams/teams.service.spec.ts`
- Create: `apps/backend/src/modules/teams/teams.controller.ts`
- Create: `apps/backend/src/modules/teams/teams.module.ts`

- [ ] **Step 1: Create `apps/backend/src/modules/teams/dto/create-team.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  name: string;
}
```

- [ ] **Step 2: Write failing test**

Create `apps/backend/src/modules/teams/teams.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { Team } from './team.entity';

const mockTeam: Team = { id: 'team-1', name: 'Dev Team' };
const mockRepo = {
  find: jest.fn().mockResolvedValue([mockTeam]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockTeam),
  create: jest.fn().mockReturnValue(mockTeam),
  save: jest.fn().mockResolvedValue(mockTeam),
};

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(TeamsService);
  });

  it('findAll returns teams', async () => {
    expect(await service.findAll()).toEqual([mockTeam]);
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=teams.service
```

Expected: `Cannot find module './teams.service'`

- [ ] **Step 4: Create `apps/backend/src/modules/teams/teams.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}

  findAll(): Promise<Team[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<Team> {
    return this.repo.findOneByOrFail({ id });
  }

  create(dto: CreateTeamDto): Promise<Team> {
    return this.repo.save(this.repo.create(dto));
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=teams.service
```

Expected: `PASS`

- [ ] **Step 6: Create `apps/backend/src/modules/teams/teams.controller.ts`**

```typescript
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('teams')
@ApiSecurity('x-user-id')
@Controller('teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateTeamDto) { return this.service.create(dto); }
}
```

- [ ] **Step 7: Create `apps/backend/src/modules/teams/teams.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team])],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
```

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/modules/teams/
git commit -m "feat(backend): add Teams module (CRUD)"
```

---

## Task 7: Projects module

**Files:**
- Create: `apps/backend/src/modules/projects/dto/create-project.dto.ts`
- Create: `apps/backend/src/modules/projects/projects.service.ts`
- Create: `apps/backend/src/modules/projects/projects.service.spec.ts`
- Create: `apps/backend/src/modules/projects/projects.controller.ts`
- Create: `apps/backend/src/modules/projects/projects.module.ts`

- [ ] **Step 1: Create `apps/backend/src/modules/projects/dto/create-project.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  teamId?: string;
}
```

- [ ] **Step 2: Write failing test**

Create `apps/backend/src/modules/projects/projects.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';

const mockProject: Project = { id: 'proj-1', name: 'Alpha', teamId: null, team: null };
const mockRepo = {
  find: jest.fn().mockResolvedValue([mockProject]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockProject),
  create: jest.fn().mockReturnValue(mockProject),
  save: jest.fn().mockResolvedValue(mockProject),
};
const mockStageRepo = { find: jest.fn().mockResolvedValue([]) };
const mockCardRepo = { find: jest.fn().mockResolvedValue([]) };

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockRepo },
        { provide: getRepositoryToken(Stage), useValue: mockStageRepo },
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
      ],
    }).compile();
    service = module.get(ProjectsService);
  });

  it('findAll returns projects', async () => {
    expect(await service.findAll()).toEqual([mockProject]);
  });

  it('getBoard returns project with stages and cards', async () => {
    const board = await service.getBoard('proj-1');
    expect(board.project).toEqual(mockProject);
    expect(board.stages).toEqual([]);
    expect(board.cards).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=projects.service
```

Expected: `Cannot find module './projects.service'`

- [ ] **Step 4: Create `apps/backend/src/modules/projects/projects.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectRepo.find();
  }

  findOne(id: string): Promise<Project> {
    return this.projectRepo.findOneByOrFail({ id });
  }

  create(dto: CreateProjectDto): Promise<Project> {
    return this.projectRepo.save(this.projectRepo.create(dto));
  }

  async getBoard(projectId: string) {
    const [project, stages, cards] = await Promise.all([
      this.projectRepo.findOneByOrFail({ id: projectId }),
      this.stageRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.cardRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
    ]);
    return { project, stages, cards };
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=projects.service
```

Expected: `PASS`

- [ ] **Step 6: Create `apps/backend/src/modules/projects/projects.controller.ts`**

```typescript
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('projects')
@ApiSecurity('x-user-id')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateProjectDto) { return this.service.create(dto); }

  @Get(':id/board')
  getBoard(@Param('id') id: string) { return this.service.getBoard(id); }
}
```

- [ ] **Step 7: Create `apps/backend/src/modules/projects/projects.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Stage, Card])],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
```

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/modules/projects/
git commit -m "feat(backend): add Projects module with board endpoint"
```

---

## Task 8: Stages module

**Files:**
- Create: `apps/backend/src/modules/stages/dto/create-stage.dto.ts`
- Create: `apps/backend/src/modules/stages/dto/update-stage.dto.ts`
- Create: `apps/backend/src/modules/stages/stages.service.ts`
- Create: `apps/backend/src/modules/stages/stages.service.spec.ts`
- Create: `apps/backend/src/modules/stages/stages.controller.ts`
- Create: `apps/backend/src/modules/stages/stages.module.ts`

- [ ] **Step 1: Create DTOs**

`apps/backend/src/modules/stages/dto/create-stage.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateStageDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
```

`apps/backend/src/modules/stages/dto/update-stage.dto.ts`:
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateStageDto } from './create-stage.dto';

export class UpdateStageDto extends PartialType(CreateStageDto) {}
```

- [ ] **Step 2: Write failing test**

Create `apps/backend/src/modules/stages/stages.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StagesService } from './stages.service';
import { Stage } from './stage.entity';

const mockStage: Stage = { id: 's-1', name: 'To Do', order: 0, projectId: 'proj-1', project: null as any };
const mockRepo = {
  find: jest.fn().mockResolvedValue([mockStage]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockStage),
  create: jest.fn().mockReturnValue(mockStage),
  save: jest.fn().mockResolvedValue(mockStage),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('StagesService', () => {
  let service: StagesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StagesService,
        { provide: getRepositoryToken(Stage), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(StagesService);
  });

  it('findByProject returns stages for project', async () => {
    const result = await service.findByProject('proj-1');
    expect(result).toEqual([mockStage]);
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { projectId: 'proj-1' },
      order: { order: 'ASC' },
    });
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=stages.service
```

- [ ] **Step 4: Create `apps/backend/src/modules/stages/stages.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './stage.entity';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly repo: Repository<Stage>,
  ) {}

  findByProject(projectId: string): Promise<Stage[]> {
    return this.repo.find({ where: { projectId }, order: { order: 'ASC' } });
  }

  findOne(id: string): Promise<Stage> {
    return this.repo.findOneByOrFail({ id });
  }

  async create(projectId: string, dto: CreateStageDto): Promise<Stage> {
    const existing = await this.repo.find({ where: { projectId }, order: { order: 'DESC' } });
    const order = dto.order ?? (existing.length > 0 ? existing[0].order + 100 : 0);
    return this.repo.save(this.repo.create({ ...dto, projectId, order }));
  }

  async update(id: string, dto: UpdateStageDto): Promise<Stage> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=stages.service
```

- [ ] **Step 6: Create `apps/backend/src/modules/stages/stages.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@ApiTags('stages')
@ApiSecurity('x-user-id')
@Controller()
export class StagesController {
  constructor(private readonly service: StagesService) {}

  @Get('projects/:projectId/stages')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  @Post('projects/:projectId/stages')
  create(@Param('projectId') projectId: string, @Body() dto: CreateStageDto) {
    return this.service.create(projectId, dto);
  }

  @Patch('stages/:id')
  update(@Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.service.update(id, dto);
  }

  @Delete('stages/:id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

- [ ] **Step 7: Create `apps/backend/src/modules/stages/stages.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stage } from './stage.entity';
import { StagesService } from './stages.service';
import { StagesController } from './stages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stage])],
  providers: [StagesService],
  controllers: [StagesController],
  exports: [StagesService],
})
export class StagesModule {}
```

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/modules/stages/
git commit -m "feat(backend): add Stages module"
```

---

## Task 9: Cards module — CRUD + move

**Files:**
- Create: `apps/backend/src/modules/cards/dto/create-card.dto.ts`
- Create: `apps/backend/src/modules/cards/dto/update-card.dto.ts`
- Create: `apps/backend/src/modules/cards/dto/move-card.dto.ts`
- Create: `apps/backend/src/modules/cards/cards.service.ts`
- Create: `apps/backend/src/modules/cards/cards.service.spec.ts`
- Create: `apps/backend/src/modules/cards/cards.controller.ts`
- Create: `apps/backend/src/modules/cards/cards.module.ts`

- [ ] **Step 1: Create DTOs**

`apps/backend/src/modules/cards/dto/create-card.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  priority: string;

  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty()
  @IsUUID()
  stageId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
```

`apps/backend/src/modules/cards/dto/update-card.dto.ts`:
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {}
```

`apps/backend/src/modules/cards/dto/move-card.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class MoveCardDto {
  @ApiProperty({ description: 'Target stage ID' })
  @IsUUID()
  stageId: string;

  @ApiProperty({ description: 'Target position index (0-based)' })
  @IsInt()
  @Min(0)
  order: number;
}
```

- [ ] **Step 2: Write failing test — including move logic**

Create `apps/backend/src/modules/cards/cards.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { Card } from './card.entity';

const makeCard = (id: string, stageId: string, order: number): Card =>
  ({ id, stageId, order, summary: id, type: 'task', priority: 'medium',
     projectId: 'proj-1', description: null, dueDate: null, assigneeId: null,
     project: null as any, stage: null as any, assignee: null,
     createdAt: new Date(), updatedAt: new Date() });

describe('CardsService', () => {
  let service: CardsService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(CardsService);
  });

  describe('move', () => {
    it('reassigns order values with 100-gap increments', async () => {
      const cards = [
        makeCard('card-a', 'stage-1', 0),
        makeCard('card-b', 'stage-1', 100),
        makeCard('card-c', 'stage-1', 200),
      ];
      const movingCard = makeCard('card-b', 'stage-1', 100);

      mockRepo.findOneByOrFail.mockResolvedValue(movingCard);
      // cards in target stage (excluding moving card)
      mockRepo.find.mockResolvedValue(cards.filter(c => c.id !== 'card-b'));
      mockRepo.save.mockImplementation((entities: any[]) =>
        Promise.resolve(entities),
      );
      mockRepo.findOneByOrFail.mockResolvedValueOnce(movingCard);

      await service.move('card-b', { stageId: 'stage-1', order: 0 });

      const saved = mockRepo.save.mock.calls[0][0] as Array<{ id: string; order: number }>;
      // card-b inserted at position 0, so order: card-b=0, card-a=100, card-c=200
      const cardBEntry = saved.find((e: any) => e.id === 'card-b');
      expect(cardBEntry?.order).toBe(0);
    });
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=cards.service
```

- [ ] **Step 4: Create `apps/backend/src/modules/cards/cards.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly repo: Repository<Card>,
  ) {}

  async create(dto: CreateCardDto): Promise<Card> {
    const stageCards = await this.repo.find({
      where: { stageId: dto.stageId },
      order: { order: 'DESC' },
      take: 1,
    });
    const order = stageCards.length > 0 ? stageCards[0].order + 100 : 0;
    return this.repo.save(this.repo.create({ ...dto, order }));
  }

  async update(id: string, dto: UpdateCardDto): Promise<Card> {
    await this.repo.update(id, dto);
    return this.repo.findOneByOrFail({ id });
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async move(id: string, dto: MoveCardDto): Promise<Card> {
    const card = await this.repo.findOneByOrFail({ id });
    const stageCards = await this.repo.find({
      where: { stageId: dto.stageId },
      order: { order: 'ASC' },
    });

    // Remove the moving card from the list
    const others = stageCards.filter((c) => c.id !== id);

    // Insert at target position
    const insertAt = Math.min(dto.order, others.length);
    others.splice(insertAt, 0, { ...card, stageId: dto.stageId });

    // Reassign order with 100-gap increments
    const updates = others.map((c, i) => ({
      id: c.id,
      stageId: dto.stageId,
      order: i * 100,
    }));

    await this.repo.save(updates as Partial<Card>[]);
    return this.repo.findOneByOrFail({ id });
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=cards.service
```

Expected: `PASS`

- [ ] **Step 6: Create `apps/backend/src/modules/cards/cards.controller.ts`**

```typescript
import { Controller, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@ApiTags('cards')
@ApiSecurity('x-user-id')
@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Post()
  create(@Body() dto: CreateCardDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/move')
  move(@Param('id') id: string, @Body() dto: MoveCardDto) {
    return this.service.move(id, dto);
  }
}
```

- [ ] **Step 7: Create `apps/backend/src/modules/cards/cards.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService, TypeOrmModule],
})
export class CardsModule {}
```

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/modules/cards/
git commit -m "feat(backend): add Cards module with move/reorder logic"
```

---

## Task 10: UserInterceptor

**Files:**
- Create: `apps/backend/src/common/interceptors/user.interceptor.ts`
- Create: `apps/backend/src/common/interceptors/user.interceptor.spec.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Write failing test**

Create `apps/backend/src/common/interceptors/user.interceptor.spec.ts`:

```typescript
import { BadRequestException } from '@nestjs/common';
import { UserInterceptor } from './user.interceptor';
import { of } from 'rxjs';

const makeCtx = (headers: Record<string, string>) => ({
  switchToHttp: () => ({
    getRequest: () => ({ headers }),
  }),
});

const next = { handle: () => of(null) };

describe('UserInterceptor', () => {
  let interceptor: UserInterceptor;
  const mockUserRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(() => {
    interceptor = new UserInterceptor(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('throws 400 when X-User-Id header is missing', async () => {
    await expect(
      interceptor.intercept(makeCtx({}) as any, next as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws 400 when user does not exist', async () => {
    mockUserRepo.findOneBy.mockResolvedValue(null);
    await expect(
      interceptor.intercept(makeCtx({ 'x-user-id': 'bad-id' }) as any, next as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('attaches user to request when valid', async () => {
    const user = { id: 'uuid-1', name: 'Alice' };
    mockUserRepo.findOneBy.mockResolvedValue(user);
    const req: any = { headers: { 'x-user-id': 'uuid-1' } };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) };
    await interceptor.intercept(ctx as any, next as any);
    expect(req.currentUser).toEqual(user);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=user.interceptor
```

- [ ] **Step 3: Create `apps/backend/src/common/interceptors/user.interceptor.ts`**

```typescript
import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { User } from '../../modules/users/user.entity';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; currentUser?: User }>();
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new BadRequestException('X-User-Id header is required');
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException(`User ${userId} not found`);
    }

    request.currentUser = user;
    return next.handle();
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=user.interceptor
```

- [ ] **Step 5: Register interceptor globally — update `apps/backend/src/app.module.ts`**

Add to imports at top:
```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './common/interceptors/user.interceptor';
```

Add to `@Module` providers array:
```typescript
providers: [
  { provide: APP_INTERCEPTOR, useClass: UserInterceptor },
],
```

The full updated `app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { StagesModule } from './modules/stages/stages.module';
import { CardsModule } from './modules/cards/cards.module';
import { AiModule } from './modules/ai/ai.module';
import { UserInterceptor } from './common/interceptors/user.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
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
    UsersModule,
    TeamsModule,
    ProjectsModule,
    StagesModule,
    CardsModule,
    AiModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: UserInterceptor },
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/common/ apps/backend/src/app.module.ts
git commit -m "feat(backend): add UserInterceptor (X-User-Id guard)"
```

---

## Task 11: AI module

**Files:**
- Create: `apps/backend/src/modules/ai/providers/ai-provider.interface.ts`
- Create: `apps/backend/src/modules/ai/providers/mock.provider.ts`
- Create: `apps/backend/src/modules/ai/providers/mock.provider.spec.ts`
- Create: `apps/backend/src/modules/ai/dto/import-spec.dto.ts`
- Create: `apps/backend/src/modules/ai/dto/confirm-import.dto.ts`
- Create: `apps/backend/src/modules/ai/ai.service.ts`
- Create: `apps/backend/src/modules/ai/ai.service.spec.ts`
- Create: `apps/backend/src/modules/ai/ai.controller.ts`
- Create: `apps/backend/src/modules/ai/ai.module.ts`

- [ ] **Step 1: Create `apps/backend/src/modules/ai/providers/ai-provider.interface.ts`**

```typescript
export interface CardDraft {
  summary: string;
  description: string;
  type: string;
  priority: string;
}

export interface AiProvider {
  generateCards(input: string): Promise<CardDraft[]>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
```

- [ ] **Step 2: Write failing test for MockAiProvider**

Create `apps/backend/src/modules/ai/providers/mock.provider.spec.ts`:

```typescript
import { MockAiProvider } from './mock.provider';

describe('MockAiProvider', () => {
  it('returns 3 card drafts regardless of input', async () => {
    const provider = new MockAiProvider();
    const result = await provider.generateCards('some spec text');
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      summary: expect.any(String),
      description: expect.any(String),
      type: expect.any(String),
      priority: expect.any(String),
    });
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=mock.provider
```

- [ ] **Step 4: Create `apps/backend/src/modules/ai/providers/mock.provider.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AiProvider, CardDraft } from './ai-provider.interface';

@Injectable()
export class MockAiProvider implements AiProvider {
  async generateCards(_input: string): Promise<CardDraft[]> {
    return [
      {
        summary: 'Set up project repository',
        description: 'Initialize the git repository, configure CI/CD, and set up branch protection rules.',
        type: 'task',
        priority: 'high',
      },
      {
        summary: 'Design database schema',
        description: 'Define all entities, relationships, and constraints. Create the initial migration.',
        type: 'task',
        priority: 'high',
      },
      {
        summary: 'Implement core API endpoints',
        description: 'Build CRUD endpoints for the primary resources identified in the spec.',
        type: 'story',
        priority: 'medium',
      },
    ];
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=mock.provider
```

- [ ] **Step 6: Create DTOs**

`apps/backend/src/modules/ai/dto/import-spec.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ImportSpecDto {
  @ApiProperty({ description: 'Raw spec or requirements text' })
  @IsString()
  @MinLength(10)
  text: string;
}
```

`apps/backend/src/modules/ai/dto/confirm-import.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class CardDraftDto {
  @ApiProperty() @IsString() summary: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsString() priority: string;
}

export class ConfirmImportDto {
  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty()
  @IsUUID()
  stageId: string;

  @ApiProperty({ type: [CardDraftDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardDraftDto)
  cards: CardDraftDto[];
}
```

- [ ] **Step 7: Write failing test for AiService**

Create `apps/backend/src/modules/ai/ai.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { Card } from '../cards/card.entity';
import { AI_PROVIDER, CardDraft } from './providers/ai-provider.interface';

const drafts: CardDraft[] = [
  { summary: 'Task A', description: 'Desc A', type: 'task', priority: 'high' },
];
const mockProvider = { generateCards: jest.fn().mockResolvedValue(drafts) };
const mockCardRepo = {
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((dto: any) => dto),
  save: jest.fn().mockImplementation((entities: any[]) => Promise.resolve(entities)),
};

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: AI_PROVIDER, useValue: mockProvider },
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
      ],
    }).compile();
    service = module.get(AiService);
  });

  it('importSpec delegates to AiProvider', async () => {
    const result = await service.importSpec('some text');
    expect(result).toEqual(drafts);
    expect(mockProvider.generateCards).toHaveBeenCalledWith('some text');
  });

  it('confirmImport creates cards starting at order 0 when stage is empty', async () => {
    const result = await service.confirmImport({
      projectId: 'proj-1',
      stageId: 'stage-1',
      cards: drafts,
    });
    expect(result[0]).toMatchObject({ order: 0, projectId: 'proj-1', stageId: 'stage-1' });
  });
});
```

- [ ] **Step 8: Run test — expect FAIL**

```bash
pnpm --filter backend test -- --testPathPattern=ai.service
```

- [ ] **Step 9: Create `apps/backend/src/modules/ai/ai.service.ts`**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/card.entity';
import { AI_PROVIDER, AiProvider, CardDraft } from './providers/ai-provider.interface';
import { ConfirmImportDto } from './dto/confirm-import.dto';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
  ) {}

  importSpec(text: string): Promise<CardDraft[]> {
    return this.provider.generateCards(text);
  }

  async confirmImport(dto: ConfirmImportDto): Promise<Card[]> {
    const { projectId, stageId, cards } = dto;
    const existing = await this.cardRepo.find({
      where: { stageId },
      order: { order: 'DESC' },
      take: 1,
    });
    const startOrder = existing.length > 0 ? existing[0].order + 100 : 0;

    const entities = cards.map((draft, i) =>
      this.cardRepo.create({ ...draft, projectId, stageId, order: startOrder + i * 100 }),
    );
    return this.cardRepo.save(entities);
  }
}
```

- [ ] **Step 10: Run test — expect PASS**

```bash
pnpm --filter backend test -- --testPathPattern=ai.service
```

- [ ] **Step 11: Create `apps/backend/src/modules/ai/ai.controller.ts`**

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ImportSpecDto } from './dto/import-spec.dto';
import { ConfirmImportDto } from './dto/confirm-import.dto';

@ApiTags('ai')
@ApiSecurity('x-user-id')
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('import')
  import(@Body() dto: ImportSpecDto) {
    return this.service.importSpec(dto.text);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmImportDto) {
    return this.service.confirmImport(dto);
  }
}
```

- [ ] **Step 12: Create `apps/backend/src/modules/ai/ai.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Card } from '../cards/card.entity';
import { AI_PROVIDER } from './providers/ai-provider.interface';
import { MockAiProvider } from './providers/mock.provider';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => {
        // Swap provider here when AI_PROVIDER env var changes
        return new MockAiProvider();
      },
    },
    AiService,
  ],
  controllers: [AiController],
})
export class AiModule {}
```

- [ ] **Step 13: Commit**

```bash
git add apps/backend/src/modules/ai/
git commit -m "feat(backend): add AI module with mock provider"
```

---

## Task 12: Seed script

**Files:**
- Create: `apps/backend/src/database/seed.ts`

- [ ] **Step 1: Create `apps/backend/src/database/seed.ts`**

```typescript
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/user.entity';
import { Team } from '../modules/teams/team.entity';
import { Project } from '../modules/projects/project.entity';
import { Stage } from '../modules/stages/stage.entity';
import { Card } from '../modules/cards/card.entity';

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Team, Project, Stage, Card],
  synchronize: true,
});

async function seed() {
  await ds.initialize();

  // Clear in dependency order
  await ds.getRepository(Card).delete({});
  await ds.getRepository(Stage).delete({});
  await ds.getRepository(Project).delete({});
  await ds.getRepository(Team).delete({});
  await ds.getRepository(User).delete({});

  const userRepo = ds.getRepository(User);
  const alice = await userRepo.save(userRepo.create({
    name: 'Alice', email: 'alice@example.com', role: 'developer',
    competencies: ['typescript', 'react'], availability: 'available',
  }));
  const bob = await userRepo.save(userRepo.create({
    name: 'Bob', email: 'bob@example.com', role: 'designer',
    competencies: ['figma', 'css'], availability: 'available',
  }));
  const carol = await userRepo.save(userRepo.create({
    name: 'Carol', email: 'carol@example.com', role: 'product manager',
    competencies: ['planning', 'stakeholder management'], availability: 'partial',
  }));

  const team = await ds.getRepository(Team).save(
    ds.getRepository(Team).create({ name: 'Core Team' }),
  );

  const project = await ds.getRepository(Project).save(
    ds.getRepository(Project).create({ name: 'Alpha Project', teamId: team.id }),
  );

  const stageRepo = ds.getRepository(Stage);
  const [todo, inProgress, review, done] = await stageRepo.save([
    stageRepo.create({ name: 'To Do', order: 0, projectId: project.id }),
    stageRepo.create({ name: 'In Progress', order: 100, projectId: project.id }),
    stageRepo.create({ name: 'Review', order: 200, projectId: project.id }),
    stageRepo.create({ name: 'Done', order: 300, projectId: project.id }),
  ]);

  const cardRepo = ds.getRepository(Card);
  await cardRepo.save([
    cardRepo.create({ summary: 'Set up monorepo', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: done.id, assigneeId: alice.id, description: 'Initialize pnpm workspace.' }),
    cardRepo.create({ summary: 'Design database schema', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: inProgress.id, assigneeId: bob.id, description: 'Define all entities and relationships.' }),
    cardRepo.create({ summary: 'Build board UI', type: 'story', priority: 'high', order: 100, projectId: project.id, stageId: inProgress.id, assigneeId: alice.id, description: 'Implement the Kanban board with columns and cards.' }),
    cardRepo.create({ summary: 'Add drag and drop', type: 'task', priority: 'medium', order: 0, projectId: project.id, stageId: todo.id, assigneeId: alice.id, description: 'Integrate @hello-pangea/dnd into the board.' }),
    cardRepo.create({ summary: 'Write API docs', type: 'task', priority: 'low', order: 0, projectId: project.id, stageId: review.id, assigneeId: carol.id, description: 'Ensure all endpoints have Swagger decorators.' }),
  ]);

  console.log('Seed complete.');
  await ds.destroy();
}

seed().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run seed against local DB**

Make sure PostgreSQL is running and `apps/backend/.env` has a valid `DATABASE_URL`, then:

```bash
pnpm --filter backend seed
```

Expected output: `Seed complete.`

- [ ] **Step 3: Run all backend tests**

```bash
pnpm --filter backend test
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/database/
git commit -m "feat(backend): add seed script with demo users, team, project, stages, and cards"
```

---

## Task 13: Smoke test — start the backend

- [ ] **Step 1: Start the backend**

```bash
pnpm --filter backend dev
```

Expected: Pino logs show server listening on port 3001. No errors.

- [ ] **Step 2: Verify Swagger UI**

Open `http://localhost:3001/api/docs` in a browser.

Expected: Swagger UI renders with all API tags visible (users, teams, projects, stages, cards, ai).

- [ ] **Step 3: Test a protected endpoint**

```bash
# Should return 400 — missing X-User-Id
curl -s http://localhost:3001/api/v1/users | jq .

# Should return users list — use a seeded user's UUID from your DB
curl -s -H "x-user-id: <alice-uuid>" http://localhost:3001/api/v1/users | jq .
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: backend smoke test verified"
```

---

_End of Backend Plan. See `2026-05-05-kanbanchik-frontend.md` for the Frontend + Electron plan._
