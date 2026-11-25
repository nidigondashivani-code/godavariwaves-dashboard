import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, clearAuthTokens, getStoredToken, saveAuthTokens } from '../api/apiClient';
import { AuthUser } from '../types/user.types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  login: (email: string, password: string, remember?: boolean, portal?: 'admin' | 'employee') => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data.data);
    } catch {
      clearAuthTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const handleExpired = () => {
      clearAuthTokens();
      setUser(null);
    };
    window.addEventListener('gw:auth-expired', handleExpired);
    return () => window.removeEventListener('gw:auth-expired', handleExpired);
  }, [refreshUser]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      remember = true,
      portal?: 'admin' | 'employee'
    ): Promise<AuthUser> => {
      const res = await apiClient.post('/auth/login', { email, password, portal });
      const { accessToken, refreshToken, user: loggedInUser } = res.data.data;
      saveAuthTokens(accessToken, refreshToken, remember);
      setUser(loggedInUser);
      return loggedInUser;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuthTokens();
      setUser(null);
    }
  }, []);

  const isAdmin = Boolean(
    user &&
      (user.role === 'Admin' || user.role === 'HR') &&
      (user.dashboardAccess === 'admin' || user.dashboardAccess === 'both')
  );

  const isEmployee = Boolean(
    user &&
      user.employee &&
      (user.dashboardAccess === 'employee' || user.dashboardAccess === 'both')
  );

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin,
      isEmployee,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, isAdmin, isEmployee, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
