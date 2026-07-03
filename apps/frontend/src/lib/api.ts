import type {
  User,
  Project,
  BoardData,
  Card,
  CardDraft,
  Stage,
  ProjectMember,
  ProjectPermissionLevel,
  ProjectInvite,
  ShareLink,
  JoinPreview,
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
  } catch {
    /* ignore */
  }
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
  loginMattermost: (loginId: string, password: string) =>
    fetchJson<User>('/auth/login/mattermost', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
    }),
  register: (data: { name: string; lastName: string; email: string; password: string }) =>
    fetchJson<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchJson<void>('/auth/logout', { method: 'POST' }),

  // Users
  getUsers: () => fetchJson<User[]>('/users'),

  // Projects
  getProjects: () => fetchJson<Project[]>('/projects'),
  createProject: (data: { name: string }) =>
    fetchJson<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id: string) => fetchJson<void>(`/projects/${id}`, { method: 'DELETE' }),

  // Users who can be assigned to cards in a project (owner + members)
  getProjectAssignees: (projectId: string) => fetchJson<User[]>(`/projects/${projectId}/assignees`),

  // Project members
  getProjectMembers: (projectId: string) =>
    fetchJson<{
      members: ProjectMember[];
      invites: ProjectInvite[];
      myPermission: ProjectPermissionLevel;
    }>(`/projects/${projectId}/members`),
  addProjectMember: (projectId: string, userId: string, role?: ProjectPermissionLevel) =>
    fetchJson<ProjectMember>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),
  updateProjectMemberRole: (projectId: string, userId: string, role: ProjectPermissionLevel) =>
    fetchJson<ProjectMember>(`/projects/${projectId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  removeProjectMember: (projectId: string, userId: string) =>
    fetchJson<void>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),

  // Invites
  createInvite: (projectId: string, email: string, role: ProjectPermissionLevel) =>
    fetchJson<ProjectInvite>(`/projects/${projectId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
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

  // Stages
  createStage: (projectId: string, data: { name: string; order?: number }) =>
    fetchJson<Stage>(`/projects/${projectId}/stages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reorderStages: (projectId: string, stageIds: string[]) =>
    fetchJson<Stage[]>(`/projects/${projectId}/stages/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ stageIds }),
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
    fetchJson<Card>(`/cards/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ stageId, order }),
    }),

  // AI
  importSpec: (text: string) =>
    fetchJson<CardDraft[]>('/ai/import', { method: 'POST', body: JSON.stringify({ text }) }),
  confirmImport: (projectId: string, stageId: string, cards: CardDraft[]) =>
    fetchJson<Card[]>('/ai/confirm', {
      method: 'POST',
      body: JSON.stringify({ projectId, stageId, cards }),
    }),
};
