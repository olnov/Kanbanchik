const USER_KEY = 'kanbanchik_user_id';

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_KEY);
}

export function setStoredUserId(id: string): void {
  localStorage.setItem(USER_KEY, id);
}
