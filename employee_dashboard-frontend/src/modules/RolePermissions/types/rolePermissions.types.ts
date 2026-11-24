/**
 * Role & Permissions Module - TypeScript Definitions
 * Enterprise Employee Management System
 */

export type RoleType = 'Admin' | 'Employee';

export type RoleStatus = 'Active' | 'Inactive';

export type PermissionAction =
  | 'View'
  | 'Create'
  | 'Edit'
  | 'Delete'
  | 'Export'
  | 'Approve'
  | 'Reject'
  | 'Assign';

export type AppModule =
  | 'Employee Management'
  | 'Attendance'
  | 'Attendance Correction'
  | 'Leave Management'
  | 'Holiday Configuration'
  | 'Calendar'
  | 'Task Management'
  | 'Work Updates'
  | 'Performance Review'
  | 'Announcements'
  | 'Notifications'
  | 'Reports'
  | 'Settings';

export type ModuleCategory =
  | 'Core HR & Staffing'
  | 'Time & Attendance'
  | 'Workforce & Productivity'
  | 'Engagement & System';

export interface ModuleDefinition {
  id: string;
  name: AppModule;
  category: ModuleCategory;
  description: string;
  iconName: string;
  supportedActions: PermissionAction[];
}

export type ModulePermissionMap = Record<PermissionAction, boolean>;

export type RolePermissionsMap = Record<AppModule, ModulePermissionMap>;

export interface RoleItem {
  id: string;
  name: RoleType;
  description: string;
  status: RoleStatus;
  assignedEmployeesCount: number;
  totalPermissions: number;
  maxPermissions: number;
  permissions: RolePermissionsMap;
  isEditable: boolean;
  isDeletable: boolean;
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: RoleType;
  module: AppModule | string;
  action: string;
  status: 'Success' | 'Applied' | 'Failed';
}

export interface AuditHistoryItem {
  id: string;
  timestamp: string;
  adminName: string;
  role: RoleType;
  module: AppModule;
  permissionChanged: PermissionAction;
  previousValue: boolean;
  newValue: boolean;
}

export interface RoleSummaryMetrics {
  totalRoles: number;
  activeRoles: number;
  totalConfiguredPermissions: number;
  assignedEmployees: number;
  adminEmployeesCount: number;
  regularEmployeesCount: number;
}

export interface RoleFilterOptions {
  searchQuery: string;
  status: RoleStatus | 'All';
  permissionType: 'All' | 'Full Access' | 'Custom Access' | 'Read Only';
}

export interface AuditFilterOptions {
  searchQuery: string;
  module: AppModule | 'All';
  adminName: string | 'All';
}

export interface PermissionDiff {
  module: AppModule;
  action: PermissionAction;
  previousValue: boolean;
  newValue: boolean;
}
