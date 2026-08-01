const segment = (value: string) => encodeURIComponent(value);

export function boardPath(projectId: string): string {
  return `/projects/${segment(projectId)}/board`;
}

export function cardPath(projectId: string, cardId: string): string {
  return `${boardPath(projectId)}/cards/${segment(cardId)}`;
}
