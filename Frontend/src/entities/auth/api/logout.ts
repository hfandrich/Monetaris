import { csrfService } from '../../../services/csrfService';

/**
 * Logout user and clear all authentication data
 * This function only clears local storage and does not make a backend call
 */
export async function logout(): Promise<void> {
  // Clear authentication data from localStorage
  localStorage.removeItem('monetaris_token');
  localStorage.removeItem('monetaris_refresh_token');
  localStorage.removeItem('monetaris_user');
  localStorage.removeItem('monetaris_last_activity');

  // Invalidate CSRF token
  csrfService.invalidate();
}
