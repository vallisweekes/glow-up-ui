import { User } from '@/types/routine';

/**
 * Client-side session storage for current user only.
 * All data is now stored in the database via API calls.
 * This file only handles the current logged-in user session.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'glowup-current-user',
};

// Current User (session only - persists during browser session)
export const saveCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) as User | null;
};

export const clearCurrentUser = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};
