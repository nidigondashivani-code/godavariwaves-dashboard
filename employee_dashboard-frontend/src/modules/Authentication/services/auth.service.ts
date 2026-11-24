const DEMO_SESSION_KEY = 'ems-admin-demo-session';

export const DEMO_ADMIN_EMAIL = 'admin@godavariwaves.com';
export const DEMO_ADMIN_PASSWORD = 'Admin@123';

export function authenticateDemoAdmin(email: string, password: string): boolean {
  if (email.trim() !== DEMO_ADMIN_EMAIL || password !== DEMO_ADMIN_PASSWORD) {
    return false;
  }

  sessionStorage.setItem(DEMO_SESSION_KEY, 'active');
  return true;
}

export function isDemoAdminAuthenticated(): boolean {
  return sessionStorage.getItem(DEMO_SESSION_KEY) === 'active';
}

export function clearDemoAdminSession(): void {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}