/**
 * Notification Center - Type Definitions
 * Enterprise HRMS Real-time Activity Feed & Alert System
 */

export type NotificationCategory =
  | 'employee'
  | 'attendance'
  | 'leave'
  | 'task'
  | 'department'
  | 'role'
  | 'announcement';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationTab = 'all' | 'unread' | 'read';

export type NotificationTimeFilter = 'all' | 'today' | 'yesterday' | 'week';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string; // ISO date string or formatted
  isRead: boolean;
  employeeName?: string;
  employeeId?: string;
  department?: string;
  actionUrl?: string; // e.g. '#employees', '#departments', '#roles'
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilterOptions {
  searchQuery: string;
  tab: NotificationTab;
  timeRange: NotificationTimeFilter;
  category: 'all' | NotificationCategory;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  categories: Record<NotificationCategory, boolean>;
}
