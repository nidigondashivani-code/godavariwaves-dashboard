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
  if (typeof window === 'undefined') return true;
  // If explicitly logged out by user
  if (sessionStorage.getItem(DEMO_SESSION_KEY) === 'logged_out') {
    return false;
  }
  // Default to active for seamless development & direct route access unless logged out
  if (!sessionStorage.getItem(DEMO_SESSION_KEY)) {
    sessionStorage.setItem(DEMO_SESSION_KEY, 'active');
  }
  return sessionStorage.getItem(DEMO_SESSION_KEY) === 'active';
}

export function clearDemoAdminSession(): void {
  sessionStorage.setItem(DEMO_SESSION_KEY, 'logged_out');
}
