import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, loginDebtor as apiLoginDebtor, logout as apiLogout, refreshToken } from '../api';
import { getCurrentUser } from '../api/me';
import type { User, LoginRequest, LoginDebtorRequest } from '../types/auth.types';

/**
 * Main authentication hook
 * Provides login, logout, and user state management
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const existingUser = getCurrentUser();
    setUser(existingUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await apiLogin(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginDebtor = useCallback(async (credentials: LoginDebtorRequest) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await apiLoginDebtor(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Debtor login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    const newToken = await refreshToken();
    if (!newToken) {
      setUser(null);
    }
    return newToken;
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    loginDebtor,
    logout,
    refresh,
  };
}
