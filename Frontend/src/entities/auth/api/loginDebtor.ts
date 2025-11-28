import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { LoginDebtorRequest, AuthResponse, User } from '../types/auth.types';
import { transformUser } from '../types/auth.types';

/**
 * Debtor "magic link" login via invoice number and zip code
 * @param request - Invoice number and zip code
 * @returns Transformed user object with DEBTOR role
 */
export async function loginDebtor(request: LoginDebtorRequest): Promise<User> {
  const response = await HttpClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.LOGIN_DEBTOR,
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
