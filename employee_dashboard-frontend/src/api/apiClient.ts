import axios, { AxiosError } from 'axios';
import envConfig from '../config/env.config';

const TOKEN_KEY = 'gw_access_token';
const REFRESH_KEY = 'gw_refresh_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
};

export const saveAuthTokens = (accessToken: string, refreshToken: string, remember = true): void => {
  clearAuthTokens();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_KEY, refreshToken);
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
};

export const apiClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken && !originalRequest.url?.includes('/auth/login')) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(`${envConfig.apiBaseUrl}/auth/refresh`, { refreshToken });
          const newAccess = res.data?.data?.accessToken;
          if (newAccess) {
            const isLocal = Boolean(localStorage.getItem(TOKEN_KEY));
            saveAuthTokens(newAccess, refreshToken, isLocal);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            }
            return apiClient(originalRequest);
          }
        } catch {
          clearAuthTokens();
          window.dispatchEvent(new Event('gw:auth-expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export const extractApiError = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export default apiClient;
