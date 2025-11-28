import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import { logout } from './logout';

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Refresh the access token using the refresh token
 * @returns New access token or null if refresh failed
 */
export async function refreshToken(): Promise<string | null> {
  const currentRefreshToken = localStorage.getItem('monetaris_refresh_token');

  if (!currentRefreshToken) {
    return null;
  }

  try {
    const response = await HttpClient.post<RefreshResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken: currentRefreshToken }
    );

    // Update tokens in localStorage
    localStorage.setItem('monetaris_token', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('monetaris_refresh_token', response.refreshToken);
    }

    return response.accessToken;
  } catch (error) {
    // If refresh fails, logout user
    await logout();
    return null;
  }
}
