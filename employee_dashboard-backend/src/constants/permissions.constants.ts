export const PERMISSIONS = {
  // Admin permissions
  MANAGE_EMPLOYEES: 'manage_employees',
  MANAGE_ATTENDANCE: 'manage_attendance',
  APPROVE_ATTENDANCE_CORRECTIONS: 'approve_attendance_corrections',
  APPROVE_LEAVES: 'approve_leaves',
  MANAGE_LEAVE_POLICIES: 'manage_leave_policies',
  MANAGE_TASKS: 'manage_tasks',
  REVIEW_WORK_UPDATES: 'review_work_updates',
  MANAGE_ANNOUNCEMENTS: 'manage_announcements',
  MANAGE_HOLIDAYS: 'manage_holidays',
  MANAGE_CALENDAR: 'manage_calendar',
  APPROVE_PROFILE_UPDATES: 'approve_profile_updates',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports',
  // Employee permissions
  VIEW_EMPLOYEE_DASHBOARD: 'view_employee_dashboard',
  CLOCK_ATTENDANCE: 'clock_attendance',
  REQUEST_ATTENDANCE_CORRECTION: 'request_attendance_correction',
  APPLY_LEAVE: 'apply_leave',
  SUBMIT_WORK_UPDATE: 'submit_work_update',
  UPDATE_OWN_TASKS: 'update_own_tasks',
  REQUEST_PROFILE_UPDATE: 'request_profile_update',
  VIEW_OWN_HISTORY: 'view_own_history',
} as const;

export default PERMISSIONS;
