export const ROLES = {
  ADMIN: 'Admin',
  HR: 'HR',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: readonly string[] = [ROLES.ADMIN, ROLES.HR];
export const ALL_ROLES: readonly string[] = [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE];

export default ROLES;
