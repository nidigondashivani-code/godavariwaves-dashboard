export interface AdminProfile {
  fullName: string;
  email: string;
  avatarUrl: string;
}

const STORAGE_KEY = 'ems_admin_profile';

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  fullName: 'Admin',
  email: 'admin@godavariwaves.com',
  avatarUrl: '',
};

export function getAdminInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
  return (parts[0] || 'Admin').slice(0, 2).toUpperCase();
}

export function readAdminProfile(): AdminProfile {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) return { ...DEFAULT_ADMIN_PROFILE };

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(storedValue);
  } catch (error) {
    console.error('Saved admin profile could not be parsed.', error);
    return { ...DEFAULT_ADMIN_PROFILE };
  }

  if (typeof parsedValue !== 'object' || parsedValue === null) {
    console.error('Saved admin profile has an invalid format.');
    return { ...DEFAULT_ADMIN_PROFILE };
  }

  const profile = parsedValue as Record<string, unknown>;
  return {
    fullName:
      typeof profile.fullName === 'string' && profile.fullName.trim()
        ? profile.fullName
        : DEFAULT_ADMIN_PROFILE.fullName,
    email:
      typeof profile.email === 'string' && profile.email.trim()
        ? profile.email
        : DEFAULT_ADMIN_PROFILE.email,
    avatarUrl: typeof profile.avatarUrl === 'string' ? profile.avatarUrl : '',
  };
}

export function saveAdminProfile(profile: AdminProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('ems_profile_updated'));
}
