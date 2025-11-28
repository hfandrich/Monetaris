import type { User } from '../types/auth.types';

/**
 * Get the currently authenticated user from localStorage
 * @returns User object or null if not authenticated
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem('monetaris_user');
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Get the current access token from localStorage
 * @returns Access token or null
 */
export function getToken(): string | null {
  return localStorage.getItem('monetaris_token');
}

/**
 * Check if user is currently authenticated
 * @returns True if user has valid token and user data
 */
export function isAuthenticated(): boolean {
  return !!getToken() && !!getCurrentUser();
}
