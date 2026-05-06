# Kanbanchik Frontend + Electron Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js frontend (sidebar layout, board with drag-and-drop, card modal, AI import UI, user switcher) and the Electron shell that wraps it.

**Architecture:** Next.js App Router with a persistent sidebar layout. CSS Modules for styling with CSS custom properties for color tokens. `@hello-pangea/dnd` for drag-and-drop with optimistic updates. Plain `fetch` via a typed `lib/api.ts` client — no extra data-fetching library. User context via `localStorage` + `X-User-Id` header. Electron thin shell: dev loads `localhost:3000`, prod serves static Next.js export.

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, CSS Modules, `@hello-pangea/dnd`, Jest, React Testing Library, Electron, `electron-serve`, `electron-builder`

**Prerequisite:** Backend plan complete and backend running on `http://localhost:3001`.

---

## File Map

```
apps/frontend/
  package.json
  tsconfig.json
  next.config.ts
  src/
    app/
      layout.tsx
      globals.css
      projects/
        page.tsx
        page.module.css
        [id]/
          board/
            page.tsx
            page.module.css
      teams/
        page.tsx
        page.module.css
    components/
      layout/
        Sidebar.tsx
        Sidebar.module.css
      board/
        Board.tsx
        Board.module.css
        Column.tsx
        Column.module.css
        Card.tsx
        Card.module.css
        CardModal.tsx
        CardModal.module.css
        AddCardButton.tsx
        AiImportModal.tsx
        AiImportModal.module.css
      ui/
        Badge.tsx
        Badge.module.css
        Button.tsx
        Button.module.css
        Modal.tsx
        Modal.module.css
    lib/
      api.ts
      types.ts
      user-context.ts

apps/electron/
  package.json
  tsconfig.json
  src/
    main.ts
    preload.ts
```

---

## Task 1: Frontend — package scaffold

**Files:**
- Create: `apps/frontend/package.json`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/next.config.ts`

- [ ] **Step 1: Create `apps/frontend/package.json`**

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@hello-pangea/dnd": "^16.6.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.4.0"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterFramework": ["@testing-library/jest-dom"],
    "roots": ["<rootDir>/src"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1",
      "\\.module\\.css$": "<rootDir>/src/__mocks__/styleMock.js"
    },
    "transform": { "^.+\\.(t|j)sx?$": "ts-jest" }
  }
}
```

- [ ] **Step 2: Create `apps/frontend/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `apps/frontend/next.config.ts`**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
};

export default nextConfig;
```

- [ ] **Step 4: Create CSS module mock for Jest**

Create `apps/frontend/src/__mocks__/styleMock.js`:
```javascript
module.exports = new Proxy({}, { get: (_, prop) => prop });
```

- [ ] **Step 5: Install dependencies**

```bash
pnpm --filter frontend install
```

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/
git commit -m "chore(frontend): package scaffold"
```

---

## Task 2: Types and API client

**Files:**
- Create: `apps/frontend/src/lib/types.ts`
- Create: `apps/frontend/src/lib/api.ts`
- Create: `apps/frontend/src/lib/user-context.ts`

- [ ] **Step 1: Create `apps/frontend/src/lib/types.ts`**

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  competencies: string[];
  availability: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  teamId: string | null;
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

export interface BoardData {
  project: Project;
  stages: Stage[];
  cards: Card[];
}

export interface CardDraft {
  summary: string;
  description: string;
  type: string;
  priority: string;
}
```

- [ ] **Step 2: Create `apps/frontend/src/lib/user-context.ts`**

```typescript
const USER_KEY = 'kanbanchik_user_id';

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_KEY);
}

export function setStoredUserId(id: string): void {
  localStorage.setItem(USER_KEY, id);
}
```

- [ ] **Step 3: Create `apps/frontend/src/lib/api.ts`**

```typescript
import { getStoredUserId } from './user-context';
import type { User, Team, Project, BoardData, Card, CardDraft } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const userId = getStoredUserId();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  getUsers: () => request<User[]>('/users'),
  getTeams: () => request<Team[]>('/teams'),
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: { name: string; teamId?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),

  getBoard: (projectId: string) => request<BoardData>(`/projects/${projectId}/board`),

  createCard: (data: Omit<Card, 'id' | 'order' | 'createdAt' | 'updatedAt'>) =>
    request<Card>('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id: string, data: Partial<Card>) =>
    request<Card>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCard: (id: string) =>
    request<void>(`/cards/${id}`, { method: 'DELETE' }),
  moveCard: (id: string, stageId: string, order: number) =>
    request<Card>(`/cards/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ stageId, order }),
    }),

  importSpec: (text: string) =>
    request<CardDraft[]>('/ai/import', { method: 'POST', body: JSON.stringify({ text }) }),
  confirmImport: (projectId: string, stageId: string, cards: CardDraft[]) =>
    request<Card[]>('/ai/confirm', {
      method: 'POST',
      body: JSON.stringify({ projectId, stageId, cards }),
    }),
};
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/lib/
git commit -m "feat(frontend): add types and API client"
```

---

## Task 3: Global styles and layout

**Files:**
- Create: `apps/frontend/src/app/globals.css`
- Create: `apps/frontend/src/app/layout.tsx`
- Create: `apps/frontend/src/components/layout/Sidebar.tsx`
- Create: `apps/frontend/src/components/layout/Sidebar.module.css`

- [ ] **Step 1: Create `apps/frontend/src/app/globals.css`**

```css
:root {
  --color-indigo: #6366f1;
  --color-indigo-bg: #f8f9ff;
  --color-amber: #f59e0b;
  --color-amber-bg: #fff7ed;
  --color-green: #22c55e;
  --color-green-bg: #f0fdf4;
  --color-purple: #a855f7;
  --color-purple-bg: #fdf4ff;

  --color-text-primary: #374151;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  --color-bg: #f0f4ff;
  --color-surface: #ffffff;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.16);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg);
  height: 100vh;
  overflow: hidden;
}

a { color: inherit; text-decoration: none; }
button { cursor: pointer; border: none; background: none; font: inherit; }
```

- [ ] **Step 2: Create `apps/frontend/src/components/layout/Sidebar.module.css`**

```css
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 4px;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-indigo);
  padding: 4px 8px 12px;
}

.section {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  padding: 8px 8px 4px;
}

.navItem {
  padding: 6px 8px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.1s;
  display: block;
  width: 100%;
  text-align: left;
}

.navItem:hover {
  background: var(--color-bg);
}

.navItem.active {
  background: #eef2ff;
  color: var(--color-indigo);
  font-weight: 600;
}

.spacer { flex: 1; }

.userSection {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  margin-top: 8px;
}

.userLabel {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.userSelect {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-surface);
  cursor: pointer;
}
```

- [ ] **Step 3: Create `apps/frontend/src/components/layout/Sidebar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredUserId, setStoredUserId } from '@/lib/user-context';
import type { User, Project } from '@/lib/types';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getStoredUserId());
    api.getUsers().then((data) => {
      setUsers(data);
      if (!getStoredUserId() && data.length > 0) {
        setStoredUserId(data[0].id);
        setUserId(data[0].id);
      }
    });
    api.getProjects().then(setProjects);
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStoredUserId(e.target.value);
    setUserId(e.target.value);
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>Kanbanchik</div>

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

      <div className={styles.section}>Workspace</div>
      <Link
        href="/teams"
        className={`${styles.navItem} ${pathname === '/teams' ? styles.active : ''}`}
      >
        Teams
      </Link>

      <div className={styles.spacer} />

      <div className={styles.userSection}>
        <div className={styles.userLabel}>Active User</div>
        <select className={styles.userSelect} value={userId ?? ''} onChange={handleUserChange}>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create `apps/frontend/src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Kanbanchik',
  description: 'Kanban board',
};

const layoutStyle = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
};

const mainStyle = {
  flex: 1,
  overflow: 'auto',
  padding: '24px',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={layoutStyle}>
          <Sidebar />
          <main style={mainStyle}>{children}</main>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app/ apps/frontend/src/components/layout/
git commit -m "feat(frontend): global styles, root layout, sidebar with user switcher"
```

---

## Task 4: UI primitives

**Files:**
- Create: `apps/frontend/src/components/ui/Badge.tsx`
- Create: `apps/frontend/src/components/ui/Badge.module.css`
- Create: `apps/frontend/src/components/ui/Button.tsx`
- Create: `apps/frontend/src/components/ui/Button.module.css`
- Create: `apps/frontend/src/components/ui/Modal.tsx`
- Create: `apps/frontend/src/components/ui/Modal.module.css`

- [ ] **Step 1: Create `apps/frontend/src/components/ui/Badge.module.css`**

```css
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.high { background: #fee2e2; color: #dc2626; }
.medium { background: #fef9c3; color: #ca8a04; }
.low { background: #dcfce7; color: #16a34a; }

.task { background: #dbeafe; color: #2563eb; }
.story { background: #ede9fe; color: #7c3aed; }
.bug { background: #fee2e2; color: #dc2626; }
```

- [ ] **Step 2: Create `apps/frontend/src/components/ui/Badge.tsx`**

```tsx
import styles from './Badge.module.css';

interface BadgeProps {
  value: string;
  variant?: 'priority' | 'type';
}

export function Badge({ value, variant = 'type' }: BadgeProps) {
  const cls = variant === 'priority'
    ? styles[value.toLowerCase() as keyof typeof styles]
    : styles[value.toLowerCase() as keyof typeof styles];
  return <span className={`${styles.badge} ${cls ?? ''}`}>{value}</span>;
}
```

- [ ] **Step 3: Create `apps/frontend/src/components/ui/Button.module.css`**

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  transition: background 0.1s, opacity 0.1s;
  cursor: pointer;
}

.primary {
  background: var(--color-indigo);
  color: #fff;
}
.primary:hover { opacity: 0.9; }

.ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.ghost:hover { background: var(--color-bg); }

.danger {
  background: #fee2e2;
  color: #dc2626;
}
.danger:hover { background: #fecaca; }
```

- [ ] **Step 4: Create `apps/frontend/src/components/ui/Button.tsx`**

```tsx
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Create `apps/frontend/src/components/ui/Modal.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.close {
  color: var(--color-text-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  background: none;
  border: none;
}
.close:hover { color: var(--color-text-primary); }
```

- [ ] **Step 6: Create `apps/frontend/src/components/ui/Modal.tsx`**

```tsx
'use client';

import { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/components/ui/
git commit -m "feat(frontend): add Badge, Button, Modal UI primitives"
```

---

## Task 5: Board components (static)

**Files:**
- Create: `apps/frontend/src/components/board/Card.tsx`
- Create: `apps/frontend/src/components/board/Card.module.css`
- Create: `apps/frontend/src/components/board/Column.tsx`
- Create: `apps/frontend/src/components/board/Column.module.css`
- Create: `apps/frontend/src/components/board/Board.tsx`
- Create: `apps/frontend/src/components/board/Board.module.css`

- [ ] **Step 1: Write failing test for Card component**

Create `apps/frontend/src/components/board/Card.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import type { Card as CardType } from '@/lib/types';

const mockCard: CardType = {
  id: 'card-1',
  summary: 'Build login page',
  description: null,
  type: 'story',
  priority: 'high',
  order: 0,
  dueDate: null,
  projectId: 'proj-1',
  stageId: 'stage-1',
  assigneeId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Card', () => {
  it('renders card summary', () => {
    render(<Card card={mockCard} onClick={() => {}} />);
    expect(screen.getByText('Build login page')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<Card card={mockCard} onClick={() => {}} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
pnpm --filter frontend test -- --testPathPattern=Card.spec
```

- [ ] **Step 3: Create `apps/frontend/src/components/board/Card.module.css`**

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.1s;
  margin-bottom: 6px;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.summary {
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.4;
  margin-bottom: 8px;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.assignee {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-indigo);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Create `apps/frontend/src/components/board/Card.tsx`**

```tsx
import styles from './Card.module.css';
import { Badge } from '@/components/ui/Badge';
import type { Card as CardType, User } from '@/lib/types';

interface CardProps {
  card: CardType;
  assignee?: User;
  onClick: (card: CardType) => void;
}

export function Card({ card, assignee, onClick }: CardProps) {
  return (
    <div className={styles.card} onClick={() => onClick(card)}>
      <div className={styles.summary}>{card.summary}</div>
      <div className={styles.footer}>
        <div className={styles.badges}>
          <Badge value={card.priority} variant="priority" />
          <Badge value={card.type} variant="type" />
        </div>
        {assignee && (
          <div className={styles.assignee} title={assignee.name}>
            {assignee.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
pnpm --filter frontend test -- --testPathPattern=Card.spec
```

- [ ] **Step 6: Create `apps/frontend/src/components/board/Column.module.css`**

```css
.column {
  min-width: 260px;
  max-width: 260px;
  border-radius: var(--radius-lg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: calc(100vh - 120px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.count {
  font-size: 11px;
  color: var(--color-text-muted);
  background: rgba(0,0,0,0.06);
  padding: 1px 6px;
  border-radius: 999px;
}

.cards {
  flex: 1;
  overflow-y: auto;
  min-height: 40px;
}
```

- [ ] **Step 7: Create `apps/frontend/src/components/board/Column.tsx`**

```tsx
import styles from './Column.module.css';
import { Card } from './Card';
import { AddCardButton } from './AddCardButton';
import type { Stage, Card as CardType, User } from '@/lib/types';

const COLUMN_COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: 'var(--color-indigo-bg)', color: 'var(--color-indigo)' },
  1: { bg: 'var(--color-amber-bg)', color: 'var(--color-amber)' },
  2: { bg: 'var(--color-purple-bg)', color: 'var(--color-purple)' },
  3: { bg: 'var(--color-green-bg)', color: 'var(--color-green)' },
};

interface ColumnProps {
  stage: Stage;
  stageIndex: number;
  cards: CardType[];
  users: User[];
  onCardClick: (card: CardType) => void;
  onAddCard: (stageId: string) => void;
}

export function Column({ stage, stageIndex, cards, users, onCardClick, onAddCard }: ColumnProps) {
  const colors = COLUMN_COLORS[stageIndex % 4];

  return (
    <div className={styles.column} style={{ background: colors.bg }}>
      <div className={styles.header}>
        <span className={styles.title} style={{ color: colors.color }}>{stage.name}</span>
        <span className={styles.count}>{cards.length}</span>
      </div>
      <div className={styles.cards}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            assignee={users.find((u) => u.id === card.assigneeId)}
            onClick={onCardClick}
          />
        ))}
      </div>
      <AddCardButton onClick={() => onAddCard(stage.id)} />
    </div>
  );
}
```

- [ ] **Step 8: Create `apps/frontend/src/components/board/AddCardButton.tsx`**

```tsx
import styles from './Board.module.css';

export function AddCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.addCard} onClick={onClick}>
      + Add card
    </button>
  );
}
```

- [ ] **Step 9: Create `apps/frontend/src/components/board/Board.module.css`**

```css
.board {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: calc(100vh - 100px);
  align-items: flex-start;
}

.addCard {
  width: 100%;
  padding: 6px;
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--color-text-muted);
  background: rgba(0,0,0,0.04);
  border: 1px dashed var(--color-border);
  cursor: pointer;
  transition: background 0.1s;
}
.addCard:hover {
  background: rgba(0,0,0,0.08);
  color: var(--color-text-secondary);
}
```

- [ ] **Step 10: Create `apps/frontend/src/components/board/Board.tsx` (static, no DnD yet)**

```tsx
'use client';

import styles from './Board.module.css';
import { Column } from './Column';
import type { BoardData, Card, User } from '@/lib/types';

interface BoardProps {
  data: BoardData;
  users: User[];
  onCardClick: (card: Card) => void;
  onAddCard: (stageId: string) => void;
}

export function Board({ data, users, onCardClick, onAddCard }: BoardProps) {
  const { stages, cards } = data;

  return (
    <div className={styles.board}>
      {stages.map((stage, i) => (
        <Column
          key={stage.id}
          stage={stage}
          stageIndex={i}
          cards={cards.filter((c) => c.stageId === stage.id)}
          users={users}
          onCardClick={onCardClick}
          onAddCard={onAddCard}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add apps/frontend/src/components/board/
git commit -m "feat(frontend): static board components (Board, Column, Card)"
```

---

## Task 6: Board page + Projects page

**Files:**
- Create: `apps/frontend/src/app/projects/page.tsx`
- Create: `apps/frontend/src/app/projects/page.module.css`
- Create: `apps/frontend/src/app/projects/[id]/board/page.tsx`
- Create: `apps/frontend/src/app/projects/[id]/board/page.module.css`
- Create: `apps/frontend/src/app/teams/page.tsx`

- [ ] **Step 1: Create `apps/frontend/src/app/projects/page.module.css`**

```css
.heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow 0.15s;
  text-decoration: none;
  display: block;
}
.card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); }

.cardName {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.cardMeta {
  font-size: 12px;
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Create `apps/frontend/src/app/projects/page.tsx`**

```tsx
import Link from 'next/link';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default async function ProjectsPage() {
  const projects = await api.getProjects();

  return (
    <div>
      <h1 className={styles.heading}>Projects</h1>
      <div className={styles.grid}>
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}/board`} className={styles.card}>
            <div className={styles.cardName}>{p.name}</div>
            <div className={styles.cardMeta}>View board →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `apps/frontend/src/app/projects/[id]/board/page.module.css`**

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.heading {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.actions {
  display: flex;
  gap: 8px;
}
```

- [ ] **Step 4: Create `apps/frontend/src/app/projects/[id]/board/page.tsx`**

```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Board } from '@/components/board/Board';
import { CardModal } from '@/components/board/CardModal';
import { AiImportModal } from '@/components/board/AiImportModal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { BoardData, Card, User } from '@/lib/types';
import styles from './page.module.css';

export default function BoardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<BoardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addToStage, setAddToStage] = useState<string | null>(null);
  const [showAiImport, setShowAiImport] = useState(false);

  const loadBoard = useCallback(async () => {
    const [board, allUsers] = await Promise.all([
      api.getBoard(params.id),
      api.getUsers(),
    ]);
    setData(board);
    setUsers(allUsers);
  }, [params.id]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  if (!data) return <div>Loading…</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>{data.project.name}</h1>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => setShowAiImport(true)}>
            Import from spec
          </Button>
        </div>
      </div>

      <Board
        data={data}
        users={users}
        onCardClick={setSelectedCard}
        onAddCard={setAddToStage}
      />

      {selectedCard && (
        <CardModal
          card={selectedCard}
          users={users}
          onClose={() => setSelectedCard(null)}
          onSave={async (updated) => {
            await api.updateCard(updated.id, updated);
            setSelectedCard(null);
            loadBoard();
          }}
          onDelete={async (id) => {
            await api.deleteCard(id);
            setSelectedCard(null);
            loadBoard();
          }}
        />
      )}

      {addToStage && (
        <CardModal
          card={null}
          stageId={addToStage}
          projectId={params.id}
          users={users}
          onClose={() => setAddToStage(null)}
          onSave={async (newCard) => {
            await api.createCard(newCard as any);
            setAddToStage(null);
            loadBoard();
          }}
          onDelete={async () => { setAddToStage(null); }}
        />
      )}

      {showAiImport && (
        <AiImportModal
          projectId={params.id}
          stages={data.stages}
          onClose={() => setShowAiImport(false)}
          onConfirm={async () => {
            setShowAiImport(false);
            loadBoard();
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `apps/frontend/src/app/teams/page.tsx`**

```tsx
import { api } from '@/lib/api';

export default async function TeamsPage() {
  const teams = await api.getTeams();

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Teams</h1>
      {teams.map((t) => (
        <div key={t.id} style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: 12,
          boxShadow: 'var(--shadow-card)',
          fontWeight: 600,
        }}>
          {t.name}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/app/
git commit -m "feat(frontend): add projects, board, and teams pages"
```

---

## Task 7: CardModal and AiImportModal

**Files:**
- Create: `apps/frontend/src/components/board/CardModal.tsx`
- Create: `apps/frontend/src/components/board/CardModal.module.css`
- Create: `apps/frontend/src/components/board/AiImportModal.tsx`
- Create: `apps/frontend/src/components/board/AiImportModal.module.css`

- [ ] **Step 1: Create `apps/frontend/src/components/board/CardModal.module.css`**

```css
.form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }

.label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
}

.input, .textarea, .select {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-surface);
  width: 100%;
}
.input:focus, .textarea:focus, .select:focus {
  outline: 2px solid var(--color-indigo);
  outline-offset: -1px;
}

.textarea { resize: vertical; min-height: 80px; font-family: inherit; }

.row { display: flex; gap: 12px; }
.row .field { flex: 1; }

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  margin-top: 4px;
}
```

- [ ] **Step 2: Create `apps/frontend/src/components/board/CardModal.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Card, User } from '@/lib/types';
import styles from './CardModal.module.css';

interface CardModalProps {
  card: Card | null;
  stageId?: string;
  projectId?: string;
  users: User[];
  onClose: () => void;
  onSave: (card: Partial<Card>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CardModal({ card, stageId, projectId, users, onClose, onSave, onDelete }: CardModalProps) {
  const [summary, setSummary] = useState(card?.summary ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [type, setType] = useState(card?.type ?? 'task');
  const [priority, setPriority] = useState(card?.priority ?? 'medium');
  const [assigneeId, setAssigneeId] = useState(card?.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(card?.dueDate ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...(card ?? {}),
      id: card?.id,
      summary,
      description: description || null,
      type,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      stageId: card?.stageId ?? stageId,
      projectId: card?.projectId ?? projectId,
    });
    setSaving(false);
  };

  return (
    <Modal title={card ? 'Edit Card' : 'New Card'} onClose={onClose}>
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Summary</label>
          <input
            className={styles.input}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details…"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <select className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Assignee</label>
            <select className={styles.select} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Due Date</label>
            <input
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <div>
            {card && (
              <Button variant="danger" onClick={() => onDelete(card.id)}>
                Delete
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!summary.trim() || saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Create `apps/frontend/src/components/board/AiImportModal.module.css`**

```css
.textarea {
  width: 100%;
  min-height: 140px;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: monospace;
  resize: vertical;
}

.drafts { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }

.draft {
  background: var(--color-indigo-bg);
  border: 1px solid #e0e7ff;
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.draftContent { flex: 1; }
.draftSummary { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.draftDesc { font-size: 12px; color: var(--color-text-secondary); }

.remove {
  color: var(--color-text-muted);
  font-size: 18px;
  cursor: pointer;
  background: none;
  border: none;
  line-height: 1;
}
.remove:hover { color: #dc2626; }

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.stageSelect {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  margin-bottom: 12px;
  width: 100%;
}
```

- [ ] **Step 4: Create `apps/frontend/src/components/board/AiImportModal.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { CardDraft, Stage } from '@/lib/types';
import styles from './AiImportModal.module.css';

interface AiImportModalProps {
  projectId: string;
  stages: Stage[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function AiImportModal({ projectId, stages, onClose, onConfirm }: AiImportModalProps) {
  const [text, setText] = useState('');
  const [drafts, setDrafts] = useState<CardDraft[] | null>(null);
  const [targetStageId, setTargetStageId] = useState(stages[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    const result = await api.importSpec(text);
    setDrafts(result);
    setLoading(false);
  };

  const handleRemove = (index: number) => {
    setDrafts((prev) => prev?.filter((_, i) => i !== index) ?? null);
  };

  const handleConfirm = async () => {
    if (!drafts) return;
    setLoading(true);
    await api.confirmImport(projectId, targetStageId, drafts);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Modal title="Import from Spec" onClose={onClose}>
      {!drafts ? (
        <>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Paste your project specification or requirements below. The AI will generate cards from it.
          </p>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste spec text here…"
          />
          <div className={styles.footer}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={text.length < 10 || loading}>
              {loading ? 'Generating…' : 'Generate Cards'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Review the generated cards. Remove any you don't need, then confirm to add them to the board.
          </p>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
              Add to stage
            </label>
            <select className={styles.stageSelect} value={targetStageId} onChange={(e) => setTargetStageId(e.target.value)}>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className={styles.drafts}>
            {drafts.map((draft, i) => (
              <div key={i} className={styles.draft}>
                <div className={styles.draftContent}>
                  <div className={styles.draftSummary}>{draft.summary}</div>
                  <div className={styles.draftDesc}>{draft.description}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <Badge value={draft.priority} variant="priority" />
                    <Badge value={draft.type} variant="type" />
                  </div>
                </div>
                <button className={styles.remove} onClick={() => handleRemove(i)}>×</button>
              </div>
            ))}
          </div>
          <div className={styles.footer}>
            <Button variant="ghost" onClick={() => setDrafts(null)}>Back</Button>
            <Button onClick={handleConfirm} disabled={drafts.length === 0 || loading}>
              {loading ? 'Creating…' : `Add ${drafts.length} card${drafts.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/board/CardModal.tsx apps/frontend/src/components/board/CardModal.module.css apps/frontend/src/components/board/AiImportModal.tsx apps/frontend/src/components/board/AiImportModal.module.css
git commit -m "feat(frontend): add CardModal and AiImportModal"
```

---

## Task 8: Drag and drop

**Files:**
- Modify: `apps/frontend/src/components/board/Board.tsx`
- Modify: `apps/frontend/src/components/board/Column.tsx`
- Modify: `apps/frontend/src/components/board/Card.tsx`

- [ ] **Step 1: Update `apps/frontend/src/components/board/Card.tsx` to accept DnD props**

```tsx
import { Draggable } from '@hello-pangea/dnd';
import styles from './Card.module.css';
import { Badge } from '@/components/ui/Badge';
import type { Card as CardType, User } from '@/lib/types';

interface CardProps {
  card: CardType;
  index: number;
  assignee?: User;
  onClick: (card: CardType) => void;
}

export function Card({ card, index, assignee, onClick }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.card}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.85 : 1,
          }}
          onClick={() => onClick(card)}
        >
          <div className={styles.summary}>{card.summary}</div>
          <div className={styles.footer}>
            <div className={styles.badges}>
              <Badge value={card.priority} variant="priority" />
              <Badge value={card.type} variant="type" />
            </div>
            {assignee && (
              <div className={styles.assignee} title={assignee.name}>
                {assignee.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
```

- [ ] **Step 2: Update `apps/frontend/src/components/board/Column.tsx` to use Droppable**

```tsx
import { Droppable } from '@hello-pangea/dnd';
import styles from './Column.module.css';
import { Card } from './Card';
import { AddCardButton } from './AddCardButton';
import type { Stage, Card as CardType, User } from '@/lib/types';

const COLUMN_COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: 'var(--color-indigo-bg)', color: 'var(--color-indigo)' },
  1: { bg: 'var(--color-amber-bg)', color: 'var(--color-amber)' },
  2: { bg: 'var(--color-purple-bg)', color: 'var(--color-purple)' },
  3: { bg: 'var(--color-green-bg)', color: 'var(--color-green)' },
};

interface ColumnProps {
  stage: Stage;
  stageIndex: number;
  cards: CardType[];
  users: User[];
  onCardClick: (card: CardType) => void;
  onAddCard: (stageId: string) => void;
}

export function Column({ stage, stageIndex, cards, users, onCardClick, onAddCard }: ColumnProps) {
  const colors = COLUMN_COLORS[stageIndex % 4];

  return (
    <div className={styles.column} style={{ background: colors.bg }}>
      <div className={styles.header}>
        <span className={styles.title} style={{ color: colors.color }}>{stage.name}</span>
        <span className={styles.count}>{cards.length}</span>
      </div>
      <Droppable droppableId={stage.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.cards}
          >
            {cards.map((card, i) => (
              <Card
                key={card.id}
                card={card}
                index={i}
                assignee={users.find((u) => u.id === card.assigneeId)}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <AddCardButton onClick={() => onAddCard(stage.id)} />
    </div>
  );
}
```

- [ ] **Step 3: Update `apps/frontend/src/components/board/Board.tsx` with DragDropContext and optimistic update**

```tsx
'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import styles from './Board.module.css';
import { Column } from './Column';
import { api } from '@/lib/api';
import type { BoardData, Card, User } from '@/lib/types';

interface BoardProps {
  data: BoardData;
  users: User[];
  onCardClick: (card: Card) => void;
  onAddCard: (stageId: string) => void;
}

export function Board({ data: initialData, users, onCardClick, onAddCard }: BoardProps) {
  const [cards, setCards] = useState(initialData.cards);
  const { stages } = initialData;

  // Sync when parent reloads board data (e.g. after CardModal save)
  useEffect(() => {
    setCards(initialData.cards);
  }, [initialData.cards]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic update
    setCards((prev) => {
      const updated = prev.filter((c) => c.id !== draggableId);
      const moved = { ...prev.find((c) => c.id === draggableId)!, stageId: destination.droppableId };
      const targetCards = updated.filter((c) => c.stageId === destination.droppableId);
      targetCards.splice(destination.index, 0, moved);
      const otherCards = updated.filter((c) => c.stageId !== destination.droppableId);
      return [
        ...otherCards,
        ...targetCards.map((c, i) => ({ ...c, order: i * 100 })),
      ];
    });

    try {
      await api.moveCard(draggableId, destination.droppableId, destination.index);
    } catch {
      // Revert on error
      setCards(initialData.cards);
    }
  }, [initialData.cards]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {stages.map((stage, i) => (
          <Column
            key={stage.id}
            stage={stage}
            stageIndex={i}
            cards={cards.filter((c) => c.stageId === stage.id).sort((a, b) => a.order - b.order)}
            users={users}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
```

- [ ] **Step 4: Run all frontend tests**

```bash
pnpm --filter frontend test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/board/
git commit -m "feat(frontend): add drag-and-drop with optimistic updates"
```

---

## Task 9: Smoke test — start the frontend

- [ ] **Step 1: Start backend (if not already running)**

```bash
pnpm --filter backend dev
```

- [ ] **Step 2: Start frontend**

```bash
pnpm --filter frontend dev
```

- [ ] **Step 3: Open http://localhost:3000**

Expected:
- Sidebar renders with user switcher populated from backend
- Projects listed in sidebar and on `/projects` page
- Board renders with columns and seeded cards
- Cards are draggable between columns
- Clicking a card opens CardModal
- "Import from spec" button opens AI import modal
- Submitting the AI import shows 3 draft cards for review

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: frontend smoke test verified"
```

---

## Task 10: Electron scaffold

**Files:**
- Create: `apps/electron/package.json`
- Create: `apps/electron/tsconfig.json`
- Create: `apps/electron/src/preload.ts`
- Create: `apps/electron/src/main.ts`

- [ ] **Step 1: Create `apps/electron/package.json`**

```json
{
  "name": "electron",
  "version": "0.1.0",
  "private": true,
  "main": "dist/main.js",
  "scripts": {
    "dev": "tsc && electron dist/main.js",
    "build": "tsc",
    "package": "tsc && electron-builder"
  },
  "dependencies": {
    "electron-serve": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "electron": "^30.0.0",
    "electron-builder": "^24.0.0",
    "typescript": "^5.4.0"
  },
  "build": {
    "appId": "com.kanbanchik.app",
    "productName": "Kanbanchik",
    "directories": { "output": "release" },
    "files": ["dist/**/*", "node_modules/**/*"],
    "extraResources": [{ "from": "../frontend/out", "to": "app" }],
    "mac": { "target": "dmg" },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
}
```

- [ ] **Step 2: Create `apps/electron/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "dist",
    "target": "ES2020"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `apps/electron/src/preload.ts`**

```typescript
import { contextBridge } from 'electron';

// No APIs exposed yet — placeholder for future native integrations
contextBridge.exposeInMainWorld('kanbanchik', {});
```

- [ ] **Step 4: Create `apps/electron/src/main.ts`**

```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    // In production: Next.js static export served from extraResources/app
    const serve = require('electron-serve');
    const loadURL = serve({ directory: path.join(process.resourcesPath, 'app') });
    loadURL(win);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

- [ ] **Step 5: Install Electron dependencies**

```bash
pnpm --filter electron install
```

- [ ] **Step 6: Build and smoke test in dev mode**

Make sure the frontend dev server is running on port 3000, then:

```bash
pnpm --filter electron dev
```

Expected: Electron window opens and loads the Next.js frontend.

- [ ] **Step 7: Commit**

```bash
git add apps/electron/
git commit -m "feat(electron): add Electron shell (dev loads localhost:3000)"
```

---

_End of Frontend + Electron Plan._
