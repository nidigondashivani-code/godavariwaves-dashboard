import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ListTodo,
  Megaphone,
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
  { label: 'Attendance Corrections', icon: Clock3 },
  { label: 'Profile Requests', icon: UserRoundCog },
  { label: 'Task Updates', icon: ListTodo },
  { label: 'Announcements', icon: Megaphone },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Profile & Settings', icon: UserRoundCog },
];
