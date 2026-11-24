import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  ShieldCheck,
  UserRoundCog,
  Users,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AdminSubNavigationItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface AdminNavigationItem {
  label: string;
  icon: LucideIcon;
  path?: string;
  subItems?: AdminSubNavigationItem[];
}

export const adminNavigationItems: AdminNavigationItem[] = [
  { label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin' },
  {
    label: 'Employee Management',
    icon: UsersRound,
    path: '/employees',
    subItems: [
      { label: 'Employee Directory', icon: Users, path: '/employees' },
      { label: 'Role & Permissions', icon: ShieldCheck, path: '/roles' },
    ],
  },
  { label: 'Attendance', icon: CalendarCheck2, path: '/attendance' },
  { label: 'Leave Requests', icon: ClipboardList, path: '/leaves' },
  { label: 'Task Updates', icon: ListTodo, path: '/admin/work-updates' },
  { label: 'Calendar', icon: CalendarDays, path: '/admin/calendar' },
  { label: 'Profile & Settings', icon: UserRoundCog, path: '/admin/profile' },
];
