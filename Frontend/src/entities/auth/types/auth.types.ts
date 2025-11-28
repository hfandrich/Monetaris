import { UserRole } from '../../../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginDebtorRequest {
  invoiceNumber: string;
  zipCode: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: BackendUser;
}

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: number; // Backend returns numeric
  tenantId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Role mapping from backend numeric to frontend enum
export const USER_ROLE_MAP: Record<number, UserRole> = {
  0: UserRole.ADMIN,
  1: UserRole.AGENT,
  2: UserRole.CLIENT,
  3: UserRole.DEBTOR,
};

/**
 * Transform backend user to frontend user
 */
export function transformUser(backendUser: BackendUser): User {
  return {
    ...backendUser,
    role: USER_ROLE_MAP[backendUser.role] ?? UserRole.DEBTOR,
  };
}
