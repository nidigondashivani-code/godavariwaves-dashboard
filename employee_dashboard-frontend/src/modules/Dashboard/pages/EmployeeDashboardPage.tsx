import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  CalendarDays,
  CheckSquare,
  CheckCircle2,
  FileText,
  LogIn,
  LogOut,
  Bell,
  ClipboardList,
  Timer,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import {
  LoadingSpinner,
  Button,
} from '../../../components/common/UI';
import type {
  AttendanceRecord,
  LeaveBalanceItem,
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
  leaveOverview: {
    balances: LeaveBalanceItem[];
    pendingRequestsCount: number;
  };
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

const formatTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

const EMPTY_DASHBOARD_DATA: DashboardData = {
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
  leaveOverview: {
    balances: [],
    pendingRequestsCount: 0,
  },
  notifications: {
    items: [],
    unreadCount: 0,
  },
};

export const EmployeeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [clockLoading, setClockLoading] = useState(false);

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

  const handleClockIn = useCallback(async () => {
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
  }, [loadDashboard, showToast]);

  const handleClockOut = useCallback(async () => {
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
  }, [loadDashboard, showToast]);

  const {
    employee,
    summary,
    todayAttendance,
    leaveOverview,
    notifications,
  } = data || EMPTY_DASHBOARD_DATA;

  const workspaceCards = useMemo<Array<{
    title: string;
    valueDisplay: string;
    description: string;
    icon: LucideIcon;
    tone: CardTone;
    to: string;
  }>>(() => [
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
  ], [summary.workingHours, summary.totalLeaveBalance, summary.pendingTasksCount, summary.completedTasksCount, summary.pendingWorkUpdatesCount]);

  const actionCards = useMemo<Array<{
    title: string;
    valueDisplay: string;
    description: string;
    icon: LucideIcon;
    tone: CardTone;
    to: string;
  }>>(() => [
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
      title: 'Unread Notifications',
      valueDisplay: `${notifications.unreadCount}`,
      description: 'Leave decisions & alerts',
      icon: Bell,
      tone: 'blue',
      to: '/employee/notifications',
    },
  ], [leaveOverview.pendingRequestsCount, todayAttendance?.late_minutes, notifications.unreadCount]);

  const renderStatCard = useCallback((card: {
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
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner label="Loading your dashboard..." />;
  }

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
              3 action items
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {actionCards.map(renderStatCard)}
        </div>
      </section>

      {/* Section 3: Today's Attendance & Leave Balances (Balanced 2-Column Grid) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="scroll-mt-24 h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Today&apos;s Attendance</p>
              <p className="mt-1 text-xs text-slate-500">Live shift &amp; attendance status</p>
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

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span>Working Hours: <strong className="text-slate-800">{Number(todayAttendance?.working_hours || summary.workingHours || 0).toFixed(1)}h</strong></span>
            <span>Late Minutes: <strong className="text-slate-800">{todayAttendance?.late_minutes || 0}m</strong></span>
          </div>
        </section>

        <section className="scroll-mt-24 h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Leave Balances</p>
              <p className="mt-1 text-xs text-slate-500">Available allowance across leave types</p>
            </div>
            <button
              className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              onClick={() => navigate('/employee/leaves')}
              type="button"
            >
              Apply leave
            </button>
          </div>

          <div className="mt-5">
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
    </div>
  );
};

export default EmployeeDashboardPage;
