
import { User, AuthState, UserRole } from '../types';
import { API_ENDPOINTS } from './api/config';
import { HttpClient } from './api/httpClient';
import { csrfService } from './csrfService';

// Backend returns numeric role values, frontend uses string enum
const USER_ROLE_MAP: Record<number, UserRole> = {
  0: UserRole.ADMIN,
  1: UserRole.AGENT,
  2: UserRole.CLIENT,
  3: UserRole.DEBTOR,
};

interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: number; // Backend returns numeric
  tenantId?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: BackendUser;
}

// Transform backend user to frontend user
function transformUser(backendUser: BackendUser): User {
  return {
    ...backendUser,
    role: USER_ROLE_MAP[backendUser.role] ?? UserRole.DEBTOR,
  } as User;
}

export const authService = {
  // Standard Login (Admin, Agent, Client via Email)
  login: async (email: string, password: string = 'password'): Promise<AuthState> => {
    try {
      const response = await HttpClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      // Transform user role from numeric to string enum
      const user = transformUser(response.user);

      // Store tokens
      localStorage.setItem('monetaris_token', response.accessToken);
      localStorage.setItem('monetaris_refresh_token', response.refreshToken);
      localStorage.setItem('monetaris_user', JSON.stringify(user));

      return {
        user,
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

      // Transform user role from numeric to string enum
      const user = transformUser(response.user);

      localStorage.setItem('monetaris_token', response.accessToken);
      localStorage.setItem('monetaris_refresh_token', response.refreshToken);
      localStorage.setItem('monetaris_user', JSON.stringify(user));

      return {
        user,
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

    // Clear authentication data
    localStorage.removeItem('monetaris_token');
    localStorage.removeItem('monetaris_refresh_token');
    localStorage.removeItem('monetaris_user');

    // Invalidate CSRF token
    csrfService.invalidate();
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

  getToken: (): string | null => {
    return localStorage.getItem('monetaris_token');
  },
};
