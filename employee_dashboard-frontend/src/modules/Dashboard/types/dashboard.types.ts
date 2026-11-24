export interface DashboardMetrics {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateEmployees: number;
  employeesOnLeave: number;
  pendingLeaveRequests: number;
  pendingAttendanceCorrections: number;
  pendingProfileRequests: number;
  pendingTaskUpdates: number;
}

export interface Holiday {
  name: string;
  date: string;
  description?: string;
}

export interface Birthday {
  id: string;
  name: string;
  initials: string;
  date: string;
  daysUntil: number;
}

export type AnnouncementPriority = 'high' | 'normal' | 'low';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: AnnouncementPriority;
}