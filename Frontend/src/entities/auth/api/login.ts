import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { LoginRequest, AuthResponse, User } from '../types/auth.types';
import { transformUser } from '../types/auth.types';

/**
 * Standard login for Admin, Agent, and Client users
 * @param request - Email and password credentials
 * @returns Transformed user object
 */
export async function login(request: LoginRequest): Promise<User> {
  const response = await HttpClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    request
  );

  // Transform backend user to frontend user
  const user = transformUser(response.user);

  // Store tokens in localStorage
  localStorage.setItem('monetaris_token', response.accessToken);
  localStorage.setItem('monetaris_refresh_token', response.refreshToken);
  localStorage.setItem('monetaris_user', JSON.stringify(user));

  return user;
}
