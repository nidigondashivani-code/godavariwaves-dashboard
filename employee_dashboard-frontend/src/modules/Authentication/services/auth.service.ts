import { apiClient, clearAuthTokens, getStoredToken, saveAuthTokens } from '../../../api/apiClient';
import { AuthUser } from '../../../types/user.types';

const DEMO_SESSION_KEY = 'ems-admin-demo-session';

export async function loginWithJwt(
  email: string,
  password: string,
  rememberMe = true
): Promise<AuthUser> {
  const res = await apiClient.post('/auth/login', {
    email: email.trim(),
    password,
  });
  const { accessToken, refreshToken, user } = res.data.data as {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
  saveAuthTokens(accessToken, refreshToken, rememberMe);
  if (user.role === 'Admin' || user.role === 'HR') {
    sessionStorage.setItem(DEMO_SESSION_KEY, 'active');
  } else {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }
  return user;
}

export function isDemoAdminAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

export async function clearDemoAdminSession(): Promise<void> {
  try {
    if (getStoredToken()) {
      await apiClient.post('/auth/logout');
    }
  } catch {
    // Ignore network errors during logout
  } finally {
    clearAuthTokens();
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }
}
