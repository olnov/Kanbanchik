# Development-only Swagger UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the backend Swagger document and UI only when `NODE_ENV` is exactly `development`.

**Architecture:** Keep the existing Swagger configuration in `main.ts` and place it inside one strict environment guard. Do not introduce a helper, configuration module, dependency, or endpoint.

**Tech Stack:** NestJS 11, TypeScript, Swagger UI, Jest

## Global Constraints

- Modify only `apps/backend/src/main.ts` for production behavior.
- Use the exact condition `process.env.NODE_ENV === 'development'`.
- Swagger must remain disabled for production, test, and an unset `NODE_ENV`.
- Keep `/api/docs` and the existing Swagger metadata unchanged in development.
- Do not change bootstrap order or server startup behavior.

---

### Task 1: Guard Swagger initialization by environment

**Files:**
- Modify: `apps/backend/src/main.ts:25`

**Interfaces:**
- Consumes: `process.env.NODE_ENV` and the existing NestJS application instance.
- Produces: Swagger UI at `/api/docs` only for the exact environment value `development`.

- [ ] **Step 1: Demonstrate that the development-only guard is absent**

Run:

```powershell
$source = Get-Content -Raw 'apps/backend/src/main.ts'
if ($source -notmatch "if \(process\.env\.NODE_ENV === 'development'\) \{[\s\S]*DocumentBuilder") { throw 'RED: Swagger initialization is not guarded by NODE_ENV=development' }
```

Expected: the command fails with `RED: Swagger initialization is not guarded by NODE_ENV=development`.

- [ ] **Step 2: Add the minimal strict environment guard**

Replace the existing Swagger block with:

```typescript
if (process.env.NODE_ENV === 'development') {
  const config = new DocumentBuilder()
    .setTitle('Kanbanchik API')
    .setDescription('Kanban board REST API')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
}
```

Leave `await app.listen(process.env.PORT ?? 3001, '0.0.0.0');` after the closing brace.

- [ ] **Step 3: Verify the guard and its scope**

Run:

```powershell
$source = Get-Content -Raw 'apps/backend/src/main.ts'
if ($source -notmatch "if \(process\.env\.NODE_ENV === 'development'\) \{[\s\S]*DocumentBuilder[\s\S]*SwaggerModule\.setup[\s\S]*\}[\s\S]*await app\.listen") { throw 'Swagger guard or bootstrap order is incorrect' }
```

Expected: exit code 0. The strict guard contains both document creation and UI setup, while `app.listen` remains unconditional.

- [ ] **Step 4: Run the backend test suite**

Run from `apps/backend`:

```powershell
.\node_modules\.bin\jest.cmd --runInBand
```

Expected: all backend test suites pass.

- [ ] **Step 5: Build the backend**

Run from `apps/backend`:

```powershell
.\node_modules\.bin\tsc.cmd -p tsconfig.json
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 6: Review and commit the change**

Run:

```powershell
git diff --check
git diff -- apps/backend/src/main.ts
git status --short
git add -- apps/backend/src/main.ts
git commit -m "fix(backend): disable Swagger outside development"
```

Expected: the diff contains only the approved environment guard, and the commit succeeds.
