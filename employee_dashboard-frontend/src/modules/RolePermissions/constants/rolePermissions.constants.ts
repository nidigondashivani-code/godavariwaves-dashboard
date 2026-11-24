/**
 * Role & Permissions Module - Constants & Default Enterprise Configurations
 */

import {
  AppModule,
  ModuleDefinition,
  PermissionAction,
  RoleItem,
  RolePermissionsMap,
  ActivityLogItem,
  AuditHistoryItem,
} from '../types/rolePermissions.types';

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'View',
  'Create',
  'Edit',
  'Delete',
  'Export',
  'Approve',
  'Reject',
  'Assign',
];

export const APP_MODULES: ModuleDefinition[] = [
  {
    id: 'mod-employee',
    name: 'Employee Management',
    category: 'Core HR & Staffing',
    description: 'Workforce records, onboarding, profile updates, and credentials governance.',
    iconName: 'Users',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-attendance',
    name: 'Attendance',
    category: 'Time & Attendance',
    description: 'Clock-in/out, biometric sync, shift schedules, and daily presence tracking.',
    iconName: 'Clock',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-attendance-corr',
    name: 'Attendance Correction',
    category: 'Time & Attendance',
    description: 'Manual punch adjustments, missing swipe disputes, and regularization workflows.',
    iconName: 'CheckSquare',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-leave',
    name: 'Leave Management',
    category: 'Time & Attendance',
    description: 'Paid time-off, sick leaves, balance accruals, and team conflict rules.',
    iconName: 'CalendarCheck',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-holiday',
    name: 'Holiday Configuration',
    category: 'Time & Attendance',
    description: 'National, regional, optional holidays, and corporate annual calendars.',
    iconName: 'CalendarDays',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-task',
    name: 'Task Management',
    category: 'Workforce & Productivity',
    description: 'Sprint backlogs, delegated deliverables, deadlines, and milestone reviews.',
    iconName: 'ListTodo',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-work-updates',
    name: 'Work Updates',
    category: 'Workforce & Productivity',
    description: 'Daily standup reports, sprint progress, and deliverables logging.',
    iconName: 'TrendingUp',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-performance',
    name: 'Performance Review',
    category: 'Workforce & Productivity',
    description: 'Quarterly appraisals, KPI scorecards, 360-degree feedback, and ratings.',
    iconName: 'Award',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-announcements',
    name: 'Announcements',
    category: 'Engagement & System',
    description: 'Enterprise notices, leadership broadcasts, press releases, and alerts.',
    iconName: 'Megaphone',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-notifications',
    name: 'Notifications',
    category: 'Engagement & System',
    description: 'In-app notification triggers, email alerts, reminders, and broadcast delivery.',
    iconName: 'Bell',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-reports',
    name: 'Reports',
    category: 'Engagement & System',
    description: 'Analytics, headcount distributions, payroll exports, and compliance reports.',
    iconName: 'BarChart3',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
  {
    id: 'mod-settings',
    name: 'Settings',
    category: 'Engagement & System',
    description: 'Security policies, company credentials, system integrations, and global parameters.',
    iconName: 'Settings',
    supportedActions: ALL_PERMISSION_ACTIONS,
  },
];

/**
 * Build Full Admin Permissions (All 13 modules x 8 actions = 104 true)
 */
export const buildAdminPermissions = (): RolePermissionsMap => {
  const map: Partial<RolePermissionsMap> = {};
  APP_MODULES.forEach((mod) => {
    map[mod.name] = {
      View: true,
      Create: true,
      Edit: true,
      Delete: true,
      Export: true,
      Approve: true,
      Reject: true,
      Assign: true,
    };
  });
  return map as RolePermissionsMap;
};

/**
 * Build Standard Employee Default Permissions (Calibrated enterprise defaults)
 */
export const buildDefaultEmployeePermissions = (): RolePermissionsMap => {
  const map: Partial<RolePermissionsMap> = {};

  APP_MODULES.forEach((mod) => {
    // Default all to false
    map[mod.name] = {
      View: false,
      Create: false,
      Edit: false,
      Delete: false,
      Export: false,
      Approve: false,
      Reject: false,
      Assign: false,
    };
  });

  // Employee Management: View self/team, export basic
  map['Employee Management'] = {
    View: true,
    Create: false,
    Edit: false,
    Delete: false,
    Export: true,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Attendance: View own & punch
  map['Attendance'] = {
    View: true,
    Create: true,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Attendance Correction: View own & request
  map['Attendance Correction'] = {
    View: true,
    Create: true,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Leave Management: View own & apply
  map['Leave Management'] = {
    View: true,
    Create: true,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Holiday Configuration: View calendar
  map['Holiday Configuration'] = {
    View: true,
    Create: false,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Task Management: View & update status
  map['Task Management'] = {
    View: true,
    Create: false,
    Edit: true,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Work Updates: View & submit
  map['Work Updates'] = {
    View: true,
    Create: true,
    Edit: true,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Performance Review: View own appraisals
  map['Performance Review'] = {
    View: true,
    Create: false,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Announcements: View broadcast
  map['Announcements'] = {
    View: true,
    Create: false,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Notifications: View in-app alerts
  map['Notifications'] = {
    View: true,
    Create: false,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Reports: View own summary
  map['Reports'] = {
    View: true,
    Create: false,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  // Settings: View personal preferences
  map['Settings'] = {
    View: true,
    Create: false,
    Edit: false,
    Delete: false,
    Export: false,
    Approve: false,
    Reject: false,
    Assign: false,
  };

  return map as RolePermissionsMap;
};

export const INITIAL_ROLES: RoleItem[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    description:
      'Unrestricted administrative access with full authority across all system modules, configurations, and governance rules.',
    status: 'Active',
    assignedEmployeesCount: 0,
    totalPermissions: 104,
    maxPermissions: 104,
    permissions: buildAdminPermissions(),
    isEditable: false,
    isDeletable: false,
    createdBy: 'System Root',
    createdDate: '2026-01-01',
    lastUpdatedBy: 'System Root',
    lastUpdatedDate: '2026-01-01',
  },
  {
    id: 'role-employee',
    name: 'Employee',
    description:
      'Standard enterprise employee role. Permissions can be customized, granted, or revoked by System Administrators.',
    status: 'Active',
    assignedEmployeesCount: 0,
    totalPermissions: 16,
    maxPermissions: 104,
    permissions: buildDefaultEmployeePermissions(),
    isEditable: true,
    isDeletable: false,
    createdBy: 'System Root',
    createdDate: '2026-01-01',
    lastUpdatedBy: 'Admin User',
    lastUpdatedDate: '2026-11-23',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act-001',
    timestamp: '2026-11-24 10:15:20',
    user: 'Admin User',
    role: 'Employee',
    module: 'Employee Management',
    action: 'Employee permissions updated',
    status: 'Success',
  },
  {
    id: 'act-002',
    timestamp: '2026-11-24 09:42:11',
    user: 'Admin User',
    role: 'Employee',
    module: 'Reports',
    action: 'Reports export permission enabled',
    status: 'Success',
  },
  {
    id: 'act-003',
    timestamp: '2026-11-23 16:30:05',
    user: 'Admin User',
    role: 'Employee',
    module: 'Attendance',
    action: 'Attendance approval permission disabled',
    status: 'Applied',
  },
  {
    id: 'act-004',
    timestamp: '2026-11-23 14:18:49',
    user: 'Admin User',
    role: 'Employee',
    module: 'Leave Management',
    action: 'Leave approval permission granted',
    status: 'Success',
  },
  {
    id: 'act-005',
    timestamp: '2026-11-22 11:05:32',
    user: 'Admin User',
    role: 'Employee',
    module: 'Task Management',
    action: 'Task status edit permission authorized',
    status: 'Success',
  },
];

export const INITIAL_AUDIT_HISTORY: AuditHistoryItem[] = [
  {
    id: 'aud-001',
    timestamp: '2026-11-24 10:15:20',
    adminName: 'Admin User',
    role: 'Employee',
    module: 'Employee Management',
    permissionChanged: 'Export',
    previousValue: false,
    newValue: true,
  },
  {
    id: 'aud-002',
    timestamp: '2026-11-24 09:42:11',
    adminName: 'Admin User',
    role: 'Employee',
    module: 'Reports',
    permissionChanged: 'Export',
    previousValue: false,
    newValue: true,
  },
  {
    id: 'aud-003',
    timestamp: '2026-11-23 16:30:05',
    adminName: 'Admin User',
    role: 'Employee',
    module: 'Attendance',
    permissionChanged: 'Approve',
    previousValue: true,
    newValue: false,
  },
  {
    id: 'aud-004',
    timestamp: '2026-11-23 14:18:49',
    adminName: 'Admin User',
    role: 'Employee',
    module: 'Leave Management',
    permissionChanged: 'Approve',
    previousValue: false,
    newValue: true,
  },
  {
    id: 'aud-005',
    timestamp: '2026-11-22 11:05:32',
    adminName: 'Admin User',
    role: 'Employee',
    module: 'Task Management',
    permissionChanged: 'Edit',
    previousValue: false,
    newValue: true,
  },
];
