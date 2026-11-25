import {
  CalendarCheck2,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  ShieldCheck,
  UserCheck,
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
      { label: 'Profile Requests', icon: UserCheck, path: '/admin/profile-requests' },
    ],
  },
  { label: 'Attendance', icon: CalendarCheck2, path: '/attendance' },
  { label: 'Leave Requests', icon: ClipboardList, path: '/leaves' },
  { label: 'Task Updates', icon: ListTodo, path: '/admin/work-updates' },
  { label: 'Profile & Settings', icon: UserRoundCog, path: '/admin/profile' },
];
