import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  CalendarDays,
  CheckSquare,
  CheckCircle2,
  FileText,
  LogIn,
  LogOut,
  Megaphone,
  Bell,
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Timer,
  Sparkles,
  Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import {
  StatusBadge,
  LoadingSpinner,
  Modal,
  Button,
} from '../../../components/common/UI';
import type {
  AttendanceRecord,
  LeaveBalanceItem,
  TaskItem,
  AnnouncementItem,
  NotificationItem,
} from '../../../types/user.types';

interface DashboardData {
  employee: {
    id: number;
    employee_code: string;
    full_name: string;
    profile_picture?: string | null;
    department?: { name: string } | null;
    designation?: { title: string } | null;
  };
  today: string;
  summary: {
    todayAttendanceStatus: string;
    workingHours: number;
    totalLeaveBalance: number;
    pendingTasksCount: number;
    completedTasksCount: number;
    pendingWorkUpdatesCount: number;
  };
  todayAttendance: AttendanceRecord | null;
  todayTasks: TaskItem[];
  leaveOverview: {
    balances: LeaveBalanceItem[];
    pendingRequestsCount: number;
  };
  announcements: AnnouncementItem[];
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    description: string;
  }>;
  notifications: {
    items: NotificationItem[];
    unreadCount: number;
  };
}

type CardTone = 'blue' | 'green' | 'rose' | 'amber' | 'violet' | 'cyan';

const TONE_STYLES: Record<CardTone, { icon: string; accent: string; label: string }> = {
  blue: { icon: 'bg-blue-50 text-blue-600', accent: 'bg-blue-500', label: 'text-blue-700' },
  green: { icon: 'bg-emerald-50 text-emerald-600', accent: 'bg-emerald-500', label: 'text-emerald-700' },
  rose: { icon: 'bg-rose-50 text-rose-600', accent: 'bg-rose-500', label: 'text-rose-700' },
  amber: { icon: 'bg-amber-50 text-amber-600', accent: 'bg-amber-500', label: 'text-amber-700' },
  violet: { icon: 'bg-violet-50 text-violet-600', accent: 'bg-violet-500', label: 'text-violet-700' },
  cyan: { icon: 'bg-cyan-50 text-cyan-700', accent: 'bg-cyan-500', label: 'text-cyan-700' },
};

const PRIORITY_BADGE_STYLES: Record<string, { label: string; classes: string }> = {
  Urgent: { label: 'Important', classes: 'bg-rose-50 text-rose-700 ring-rose-600/10' },
  'HR Policy': { label: 'General', classes: 'bg-blue-50 text-blue-700 ring-blue-600/10' },
  General: { label: 'General', classes: 'bg-blue-50 text-blue-700 ring-blue-600/10' },
  Event: { label: 'Event', classes: 'bg-indigo-50 text-indigo-700 ring-indigo-600/10' },
  IT: { label: 'Info', classes: 'bg-slate-100 text-slate-600 ring-slate-500/10' },
};

export const EmployeeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<AnnouncementItem | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await apiClient.get('/employees/dashboard/me');
      setData(res.data.data);
      setApiNotice(null);
    } catch (err) {
      setApiNotice(
        extractApiError(err, 'Unable to load live employee dashboard data from the backend.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      await apiClient.post('/attendance/clock-in');
      showToast('Clocked in successfully!', 'success');
      await loadDashboard();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      await apiClient.post('/attendance/clock-out');
      showToast('Clocked out successfully!', 'success');
      await loadDashboard();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your dashboard..." />;
  }

  const emptyData: DashboardData = {
    employee: {
      id: 0,
      employee_code: '--',
      full_name: 'Employee',
      profile_picture: null,
      department: null,
      designation: null,
    },
    today: new Date().toISOString().split('T')[0],
    summary: {
      todayAttendanceStatus: 'Not Clocked In',
      workingHours: 0,
      totalLeaveBalance: 0,
      pendingTasksCount: 0,
      completedTasksCount: 0,
      pendingWorkUpdatesCount: 0,
    },
    todayAttendance: null,
    todayTasks: [],
    leaveOverview: {
      balances: [],
      pendingRequestsCount: 0,
    },
    announcements: [],
    upcomingEvents: [],
    notifications: {
      items: [],
      unreadCount: 0,
    },
  };

  const {
    employee,
    summary,
    todayAttendance,
    todayTasks,
    leaveOverview,
    announcements,
    upcomingEvents,
    notifications,
  } = data || emptyData;

  const formatTime = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

  const workspaceCards: Array<{
    title: string;
    valueDisplay: string;
    description: string;
    icon: LucideIcon;
    tone: CardTone;
    to: string;
  }> = [
    {
      title: 'Working Hours Today',
      valueDisplay: `${Number(summary.workingHours || 0).toFixed(1)}h`,
      description: 'Logged today',
      icon: Timer,
      tone: 'blue',
      to: '/employee/attendance',
    },
    {
      title: 'Leave Balance',
      valueDisplay: `${Number(summary.totalLeaveBalance || 0)}`,
      description: 'Available days across types',
      icon: CalendarDays,
      tone: 'green',
      to: '/employee/leaves',
    },
    {
      title: 'Pending Tasks',
      valueDisplay: `${summary.pendingTasksCount}`,
      description: 'Assigned & active',
      icon: CheckSquare,
      tone: 'amber',
      to: '/employee/tasks',
    },
    {
      title: 'Completed Tasks',
      valueDisplay: `${summary.completedTasksCount}`,
      description: 'Delivered milestones',
      icon: CheckCircle2,
      tone: 'cyan',
      to: '/employee/tasks',
    },
    {
      title: 'Pending Updates',
      valueDisplay: `${summary.pendingWorkUpdatesCount}`,
      description: 'Awaiting review',
      icon: FileText,
      tone: 'violet',
      to: '/employee/work-updates',
    },
  ];

  const actionCards: Array<{
    title: string;
    valueDisplay: string;
    description: string;
    icon: LucideIcon;
    tone: CardTone;
    to: string;
  }> = [
    {
      title: 'Pending Leave Requests',
      valueDisplay: `${leaveOverview.pendingRequestsCount}`,
      description: 'Awaiting manager approval',
      icon: ClipboardList,
      tone: 'amber',
      to: '/employee/leaves',
    },
    {
      title: 'Late Minutes Today',
      valueDisplay: `${todayAttendance?.late_minutes || 0}m`,
      description: 'Shift punctuality',
      icon: Clock3,
      tone: 'rose',
      to: '/employee/attendance',
    },
    {
      title: 'Upcoming Events',
      valueDisplay: `${upcomingEvents.length}`,
      description: 'Scheduled on calendar',
      icon: Calendar,
      tone: 'violet',
      to: '/employee/calendar',
    },
    {
      title: 'Unread Notifications',
      valueDisplay: `${notifications.unreadCount}`,
      description: 'Recent portal alerts',
      icon: Bell,
      tone: 'blue',
      to: '/employee/notifications',
    },
  ];

  const renderStatCard = (card: {
    title: string;
    valueDisplay: string;
    description: string;
    icon: LucideIcon;
    tone: CardTone;
    to: string;
  }) => {
    const styles = TONE_STYLES[card.tone];
    const Icon = card.icon;
    return (
      <article
        key={card.title}
        onClick={() => navigate(card.to)}
        className="group relative cursor-pointer scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
      >
        <div
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-[3px] ${styles.accent} opacity-0 transition-opacity group-hover:opacity-100`}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium leading-5 text-slate-500">{card.title}</p>
            <p className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-slate-900">
              {card.valueDisplay}
            </p>
          </div>
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${styles.icon}`}
          >
            <Icon aria-hidden="true" className="h-[21px] w-[21px]" strokeWidth={1.9} />
          </span>
        </div>
        <p className={`mt-4 text-[11px] font-medium ${styles.label}`}>{card.description}</p>
      </article>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {apiNotice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          {apiNotice}
        </div>
      )}

      {/* Top Page Title & Quick Actions — exact AdminDashboardPage heading typography */}
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="scroll-mt-24 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            id="dashboard-overview"
          >
            Dashboard Overview
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {employee.employee_code} · {employee.department?.name || 'General'} ·{' '}
            {employee.designation?.title || 'Employee'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!todayAttendance?.clock_in ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              disabled={clockLoading}
              onClick={handleClockIn}
              type="button"
            >
              <LogIn aria-hidden="true" className="h-4 w-4" />
              Clock In Now
            </button>
          ) : !todayAttendance?.clock_out ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
              disabled={clockLoading}
              onClick={handleClockOut}
              type="button"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Clock Out
            </button>
          ) : (
            <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              Shift Completed ({todayAttendance.working_hours}h)
            </span>
          )}
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-slate-50 hover:text-blue-700"
            onClick={() => navigate('/employee/work-updates')}
            type="button"
          >
            Submit Daily Update
          </button>
        </div>
      </div>

      {/* Section 1: Attendance & Workspace Overview (5 metrics — exact Admin 5-col grid) */}
      <section aria-labelledby="workspace-overview-heading" className="scroll-mt-24" id="workspace-overview">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500"
              id="workspace-overview-heading"
            >
              Attendance &amp; Workspace Overview
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              5 metrics
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {workspaceCards.map(renderStatCard)}
        </div>
      </section>

      {/* Section 2: Personal Requests & Activity (4 items — exact Admin 4-col grid) */}
      <section aria-labelledby="personal-activity-heading" className="scroll-mt-24" id="personal-activity">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500"
              id="personal-activity-heading"
            >
              Pending Requests &amp; Activity
            </h3>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              4 action items
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actionCards.map(renderStatCard)}
        </div>
      </section>

      {/* Section 3: Today's Attendance & Leave (col-span-4) + Assigned Tasks (col-span-8) — exact Admin lg:grid-cols-12 gap-4 */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <section className="scroll-mt-24 h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Today&apos;s Attendance</p>
                <p className="mt-1 text-xs text-slate-500">Live shift &amp; leave balances</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock3 aria-hidden="true" className="h-[19px] w-[19px]" />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-medium text-slate-500">Clock In</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatTime(todayAttendance?.clock_in)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-medium text-slate-500">Clock Out</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatTime(todayAttendance?.clock_out)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-medium text-slate-500">Status</p>
                <p className="mt-1 truncate text-sm font-semibold text-blue-600">
                  {todayAttendance?.status || summary.todayAttendanceStatus}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Leave Balances
                </p>
                <button
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  onClick={() => navigate('/employee/leaves')}
                  type="button"
                >
                  Apply leave
                </button>
              </div>
              {leaveOverview.balances.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {leaveOverview.balances.map((b) => (
                    <li className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0" key={b.id}>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {b.leaveType?.name || 'Leave'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Used {b.used_days} · Allocated {b.allocated_days}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {b.remaining_days}d left
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex min-h-[90px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
                  <Sparkles aria-hidden="true" className="h-5 w-5 text-slate-400" />
                  <p className="mt-2 text-xs font-medium text-slate-600">No leave balances available</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8">
          <section className="scroll-mt-24 h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Assigned Tasks</p>
                <p className="mt-1 text-xs text-slate-500">Active deliverables &amp; due dates</p>
              </div>
              <button
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-slate-50 hover:text-blue-700"
                onClick={() => navigate('/employee/tasks')}
                type="button"
              >
                View all
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>

            {todayTasks.length > 0 ? (
              <ul className="mt-5 divide-y divide-slate-100">
                {todayTasks.map((task) => (
                  <li
                    className="group flex cursor-pointer flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                    key={task.id}
                    onClick={() => navigate('/employee/tasks')}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                          {task.title}
                        </p>
                        <StatusBadge status={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-[11px] font-semibold text-slate-600">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                      Due {task.due_date}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="hidden h-4 w-4 text-slate-300 transition group-hover:text-blue-500 sm:block"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 flex min-h-[155px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
                <CheckSquare aria-hidden="true" className="h-6 w-6 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-600">No pending tasks assigned</p>
                <p className="mt-1 text-xs text-slate-400">Assigned tasks will appear here.</p>
              </div>
            )}

            {upcomingEvents.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Upcoming Schedule
                  </p>
                  <button
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={() => navigate('/employee/calendar')}
                    type="button"
                  >
                    Open calendar
                  </button>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {upcomingEvents.slice(0, 3).map((ev) => (
                    <div
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                      key={ev.id}
                    >
                      <p className="truncate text-xs font-semibold text-slate-800">{ev.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {ev.type} · {ev.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Section 4: Announcements — exact 1:1 replica of Admin AnnouncementsSection */}
      <section
        className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        id="announcements"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Megaphone aria-hidden="true" className="h-[19px] w-[19px]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Announcements</p>
              <p className="mt-1 text-xs text-slate-500">Latest company updates</p>
            </div>
          </div>
          <button
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            onClick={() => navigate('/employee/announcements')}
            type="button"
          >
            View all
          </button>
        </div>

        {announcements.length > 0 ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {announcements.slice(0, 3).map((announcement) => {
              const priority =
                PRIORITY_BADGE_STYLES[announcement.category] || PRIORITY_BADGE_STYLES.General;
              const formattedPubDate = announcement.published_at
                ? new Intl.DateTimeFormat('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }).format(new Date(announcement.published_at))
                : '';

              return (
                <article
                  className="group rounded-xl border border-slate-100 bg-[#fbfcfe] p-4 transition hover:border-blue-100 hover:bg-blue-50/30"
                  key={announcement.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${priority.classes}`}
                    >
                      {priority.label}
                    </span>
                    <time className="text-[10px] text-slate-400">{formattedPubDate}</time>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-800">{announcement.title}</h3>
                  <p className="mt-1.5 min-h-10 line-clamp-2 text-xs leading-5 text-slate-500">
                    {announcement.content}
                  </p>
                  <button
                    aria-label={`Read ${announcement.title} announcement`}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-500/30"
                    onClick={() => setSelectedAnn(announcement)}
                    type="button"
                  >
                    Read announcement
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Megaphone aria-hidden="true" className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-600">No announcements yet</p>
            <p className="mt-1 text-xs text-slate-400">Company updates will appear here.</p>
          </div>
        )}
      </section>

      {/* Announcement Details Modal */}
      <Modal
        open={Boolean(selectedAnn)}
        onClose={() => setSelectedAnn(null)}
        title={selectedAnn?.title || ''}
        subtitle={
          selectedAnn?.published_at
            ? `Published on ${new Date(selectedAnn.published_at).toLocaleDateString()}`
            : undefined
        }
      >
        {selectedAnn && (
          <div className="space-y-4">
            <StatusBadge status={selectedAnn.category} />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {selectedAnn.content}
            </p>
            <div className="flex justify-end pt-3">
              <Button variant="secondary" onClick={() => setSelectedAnn(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeDashboardPage;
