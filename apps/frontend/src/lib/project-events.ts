export const PROJECTS_UPDATED_EVENT = 'kanbanchik:projects-updated';

export function dispatchProjectsUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(PROJECTS_UPDATED_EVENT));
}
