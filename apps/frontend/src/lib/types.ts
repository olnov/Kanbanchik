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
