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
