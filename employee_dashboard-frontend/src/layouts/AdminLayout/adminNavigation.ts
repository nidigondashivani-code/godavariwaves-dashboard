import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  UserRoundCog,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AdminNavigationItem {
  label: string;
  icon: LucideIcon;
}

export const adminNavigationItems: AdminNavigationItem[] = [
  { label: 'Dashboard Overview', icon: LayoutDashboard },
  { label: 'Employee Management', icon: UsersRound },
  { label: 'Attendance', icon: CalendarCheck2 },
  { label: 'Leave Requests', icon: ClipboardList },
  { label: 'Task Updates', icon: ListTodo },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Profile & Settings', icon: UserRoundCog },
];
