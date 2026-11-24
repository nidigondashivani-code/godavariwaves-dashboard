import type { DashboardMetrics } from '../types/dashboard.types';

export const dashboardMetrics: DashboardMetrics = {
  totalEmployees: 248,
  presentToday: 216,
  absentToday: 11,
  lateEmployees: 8,
  employeesOnLeave: 13,
  pendingLeaveRequests: 6,
  pendingTaskUpdates: 9,
};

export const todayHoliday = null;

const dateInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
};

export const upcomingBirthdays = [
  { id: 'birthday-1', name: 'Maya Chen', initials: 'MC', daysUntil: 2, date: dateInDays(2) },
  { id: 'birthday-2', name: 'Jordan Lee', initials: 'JL', daysUntil: 5, date: dateInDays(5) },
  { id: 'birthday-3', name: 'Samira Patel', initials: 'SP', daysUntil: 9, date: dateInDays(9) },
];
