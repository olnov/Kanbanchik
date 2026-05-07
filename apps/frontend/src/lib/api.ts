import { getStoredUserId, setStoredUserId } from './user-context';
import type {
  User, Team, Project, BoardData, Card, CardDraft, Stage,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
let usersRequestPromise: Promise<User[]> | null = null;
let usersCache: User[] | null = null;

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly responseText: string,
  ) {
    const message = getErrorMessage(responseText);
    super(`API error ${status}: ${path}${message ? ` - ${message}` : ''}`);
  }
}

function getErrorMessage(responseText: string): string {
  if (!responseText) {
    return '';
  }

  try {
    const parsed = JSON.parse(responseText) as { message?: string | string[] };

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(', ');
    }

    if (typeof parsed.message === 'string') {
      return parsed.message;
    }
  } catch {
    // Ignore invalid JSON and keep the raw text fallback below.
  }

  return responseText;
}

function pickValidUserId(users: User[]): string | null {
  const storedUserId = getStoredUserId();
  const validUserId =
    users.find((user) => user.id === storedUserId)?.id
    ?? users[0]?.id
    ?? null;

  if (validUserId && validUserId !== storedUserId) {
    setStoredUserId(validUserId);
  }

  return validUserId;
}

async function fetchJson<T>(path: string, init?: RequestInit, userId?: string | null): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (userId && !headers.has('x-user-id')) {
    headers.set('x-user-id', userId);
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(res.status, path, await res.text());
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

async function getPublicUsers(forceRefresh = false): Promise<User[]> {
  if (!forceRefresh && usersCache) {
    pickValidUserId(usersCache);
    return usersCache;
  }

  if (!forceRefresh && usersRequestPromise) {
    return usersRequestPromise;
  }

  usersRequestPromise = fetchJson<User[]>('/users')
    .then((users) => {
      usersCache = users;
      pickValidUserId(users);
      return users;
    })
    .finally(() => {
      usersRequestPromise = null;
    });

  return usersRequestPromise;
}

async function ensureUserId(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('User bootstrap is only available in the browser');
  }

  const users = await getPublicUsers();
  const validUserId = pickValidUserId(users);

  if (!validUserId) {
    throw new Error('API returned no users for bootstrap');
  }

  return validUserId;
}

function isUserContextError(error: unknown): error is ApiError {
  if (!(error instanceof ApiError) || error.status !== 400) {
    return false;
  }

  const message = getErrorMessage(error.responseText);

  return /x-user-id|user .* not found/i.test(message);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const userId = await ensureUserId();

  try {
    return await fetchJson<T>(path, init, userId);
  } catch (error) {
    if (!isUserContextError(error)) {
      throw error;
    }

    usersCache = null;
    const refreshedUsers = await getPublicUsers(true);
    const refreshedUserId = pickValidUserId(refreshedUsers);

    if (!refreshedUserId) {
      throw error;
    }

    return fetchJson<T>(path, init, refreshedUserId);
  }
}

export const api = {
  getUsers: () => getPublicUsers(),
  getTeams: () => request<Team[]>('/teams'),
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: { name: string; teamId?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
  createStage: (projectId: string, data: { name: string; order?: number }) =>
    request<Stage>(`/projects/${projectId}/stages`, { method: 'POST', body: JSON.stringify(data) }),
  reorderStages: (projectId: string, stageIds: string[]) =>
    request<Stage[]>(`/projects/${projectId}/stages/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ stageIds }),
    }),
  updateStage: (id: string, data: { name?: string; order?: number }) =>
    request<Stage>(`/stages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStage: (id: string) =>
    request<void>(`/stages/${id}`, { method: 'DELETE' }),

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
