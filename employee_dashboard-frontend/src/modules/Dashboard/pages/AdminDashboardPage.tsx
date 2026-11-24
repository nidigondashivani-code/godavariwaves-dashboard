import { useEffect, useState } from 'react';
import {
  UsersRound,
  UserCheck,
  UserX,
  Clock3,
  CalendarOff,
  ClipboardList,
  CalendarClock,
  ContactRound,
  ListTodo,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import AnnouncementsSection from '../components/AnnouncementsSection';
import StatCard, { type StatCardTone } from '../components/StatCard';
import UpcomingBirthdays from '../components/UpcomingBirthdays';
import UpcomingHolidaysList from '../components/UpcomingHolidaysList';
import { apiClient } from '../../../api/apiClient';
import type { Announcement, Birthday, DashboardMetrics, Holiday } from '../types/dashboard.types';

const EMPTY_METRICS: DashboardMetrics = {
  totalEmployees: 0,
  presentToday: 0,
  absentToday: 0,
  lateEmployees: 0,
  employeesOnLeave: 0,
  pendingLeaveRequests: 0,
  pendingAttendanceCorrections: 0,
  pendingProfileRequests: 0,
  pendingTaskUpdates: 0,
};

function computeDaysUntilBirthday(dob: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = dob.split('-');
  if (parts.length < 3) return 365;
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const next = new Date(today.getFullYear(), month, day);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
  const [todayHoliday, setTodayHoliday] = useState<Holiday | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let active = true;
    apiClient
      .get('/employees/dashboard/admin')
      .then((res) => {
        if (!active) return;
        const payload = res.data?.data;
        if (!payload) return;
        const s = payload.stats || {};
        setMetrics({
          totalEmployees: Number(s.totalEmployees || 0),
          presentToday: Number(s.presentToday || 0),
          absentToday: Number(s.absentToday || 0),
          lateEmployees: Number(s.lateToday || 0),
          employeesOnLeave: Number(s.employeesOnLeave || 0),
          pendingLeaveRequests: Number(s.pendingLeaves || 0),
          pendingAttendanceCorrections: Number(s.pendingCorrections || 0),
          pendingProfileRequests: Number(s.pendingProfileRequests || 0),
          pendingTaskUpdates: Number(s.pendingWorkUpdates || 0),
        });

        if (payload.todayHoliday) {
          setTodayHoliday({
            name: payload.todayHoliday.name,
            date: payload.todayHoliday.date,
            description: payload.todayHoliday.description || undefined,
          });
        } else {
          setTodayHoliday(null);
        }

        const rawBirthdays = Array.isArray(payload.upcomingBirthdays) ? payload.upcomingBirthdays : [];
        const mappedBirthdays: Birthday[] = rawBirthdays
          .filter((b: { date_of_birth?: string }) => Boolean(b.date_of_birth))
          .map((b: { id: number; full_name: string; date_of_birth: string }) => {
            const daysUntil = computeDaysUntilBirthday(b.date_of_birth);
            const dobDate = new Date(`${b.date_of_birth}T00:00:00`);
            const formatted = isNaN(dobDate.getTime())
              ? b.date_of_birth
              : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(dobDate);
            const initials = b.full_name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return {
              id: `birthday-${b.id}`,
              name: b.full_name,
              initials,
              date: formatted,
              daysUntil,
            };
          })
          .sort((a: Birthday, b: Birthday) => a.daysUntil - b.daysUntil)
          .slice(0, 5);
        setUpcomingBirthdays(mappedBirthdays);

        const rawAnns = Array.isArray(payload.recentAnnouncements) ? payload.recentAnnouncements : [];
        setAnnouncements(
          rawAnns.map((a: { id: number; title: string; content: string; published_at?: string; createdAt?: string; category?: string }) => ({
            id: `announcement-${a.id}`,
            title: a.title,
            description: a.content,
            date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
              new Date(a.published_at || a.createdAt || Date.now())
            ),
            priority: a.category === 'Urgent' ? 'high' : a.category === 'HR Policy' ? 'normal' : 'low',
          }))
        );
      })
      .catch(() => {
        // Keep clean empty/zero state when backend/database is not reachable
      });

    return () => {
      active = false;
    };
  }, []);

  const workforceCards: {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: StatCardTone;
    id: string;
  }[] = [
    {
      title: 'Total Employees',
      value: metrics.totalEmployees,
      description: 'Across all departments',
      icon: UsersRound,
      tone: 'blue',
      id: 'module-total-employees',
    },
    {
      title: 'Present Today',
      value: metrics.presentToday,
      description: 'Attendance overview',
      icon: UserCheck,
      tone: 'green',
      id: 'module-present-today',
    },
    {
      title: 'Absent Today',
      value: metrics.absentToday,
      description: 'Attendance overview',
      icon: UserX,
      tone: 'rose',
      id: 'module-absent-today',
    },
    {
      title: 'Late Employees',
      value: metrics.lateEmployees,
      description: 'Attendance overview',
      icon: Clock3,
      tone: 'amber',
      id: 'module-late-employees',
    },
    {
      title: 'Employees On Leave',
      value: metrics.employeesOnLeave,
      description: 'Currently on approved leave',
      icon: CalendarOff,
      tone: 'violet',
      id: 'module-employees-on-leave',
    },
  ];

  const pendingRequestCards: {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: StatCardTone;
    id: string;
  }[] = [
    {
      title: 'Pending Leave Requests',
      value: metrics.pendingLeaveRequests,
      description: 'Awaiting admin review',
      icon: ClipboardList,
      tone: 'amber',
      id: 'module-pending-leave-requests',
    },
    {
      title: 'Pending Attendance Corrections',
      value: metrics.pendingAttendanceCorrections,
      description: 'Awaiting admin review',
      icon: CalendarClock,
      tone: 'cyan',
      id: 'module-pending-attendance-corrections',
    },
    {
      title: 'Pending Profile Requests',
      value: metrics.pendingProfileRequests,
      description: 'Awaiting admin review',
      icon: ContactRound,
      tone: 'violet',
      id: 'module-pending-profile-requests',
    },
    {
      title: 'Pending Task Updates',
      value: metrics.pendingTaskUpdates,
      description: 'Awaiting admin review',
      icon: ListTodo,
      tone: 'blue',
      id: 'module-pending-task-updates',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-7">
        <div className="mb-1">
          <h2 className="scroll-mt-24 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl" id="dashboard-overview">
            Dashboard Overview
          </h2>
        </div>

        {/* Section 1: Workforce & Attendance Overview (Modules 1-5) */}
        <section aria-labelledby="workforce-overview-heading" className="scroll-mt-24" id="workforce-overview">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500" id="workforce-overview-heading">
                Workforce & Attendance Overview
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                5 metrics
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {workforceCards.map((card) => <StatCard {...card} key={card.title} />)}
          </div>
        </section>

        {/* Section 2: Pending Requests & Approvals (Modules 6-9) */}
        <section aria-labelledby="pending-requests-heading" className="scroll-mt-24" id="pending-requests">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500" id="pending-requests-heading">
                Pending Requests & Approvals
              </h3>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                4 action items
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {pendingRequestCards.map((card) => <StatCard {...card} key={card.title} />)}
          </div>
        </section>

        {/* Section 3: Schedules & Celebrations (Modules 10-11) */}
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <UpcomingHolidaysList holiday={todayHoliday} />
          </div>
          <div className="lg:col-span-8">
            <UpcomingBirthdays birthdays={upcomingBirthdays} />
          </div>
        </div>

        {/* Section 4: Announcements (Module 12) */}
        <AnnouncementsSection announcements={announcements} />
      </div>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
