
import { User, AuthState, UserRole } from '../types';
import { API_ENDPOINTS } from './api/config';
import { HttpClient } from './api/httpClient';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export const authService = {
  // Standard Login (Admin, Agent, Client via Email)
  login: async (email: string, password: string = 'password'): Promise<AuthState> => {
    try {
      const response = await HttpClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      // Store tokens
      localStorage.setItem('monetaris_token', response.accessToken);
      localStorage.setItem('monetaris_refresh_token', response.refreshToken);
      localStorage.setItem('monetaris_user', JSON.stringify(response.user));

      return {
        user: response.user,
        isAuthenticated: true,
        token: response.accessToken,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Debtor "Magic" Login via Case Number + Zip Code
  loginDebtor: async (invoiceNumber: string, zipCode: string): Promise<AuthState> => {
    try {
      const response = await HttpClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN_DEBTOR, {
        invoiceNumber,
        zipCode,
      });

      localStorage.setItem('monetaris_token', response.accessToken);
      localStorage.setItem('monetaris_refresh_token', response.refreshToken);
      localStorage.setItem('monetaris_user', JSON.stringify(response.user));

      return {
        user: response.user,
        isAuthenticated: true,
        token: response.accessToken,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Debtor login failed');
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('monetaris_refresh_token');

    if (refreshToken) {
      try {
        await HttpClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      } catch (error) {
        // Ignore logout errors
      }
    }

    localStorage.removeItem('monetaris_token');
    localStorage.removeItem('monetaris_refresh_token');
    localStorage.removeItem('monetaris_user');
  },

  checkSession: (): AuthState => {
    const token = localStorage.getItem('monetaris_token');
    const userStr = localStorage.getItem('monetaris_user');

    if (token && userStr) {
      return {
        user: JSON.parse(userStr),
        isAuthenticated: true,
        token,
      };
    }

    return { user: null, isAuthenticated: false, token: null };
  },
};
