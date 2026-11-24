import React from 'react';
import { Activity, Building2, Clock3, LogOut, Users } from 'lucide-react';
import { ATTENDANCE_DEPARTMENTS } from '../constants/attendance.constants';
import { AttendanceRow } from '../types/attendance.types';

interface AttendanceMetricWidgetProps {
  rows: AttendanceRow[];
  weeklyTrend: Array<{ date: string; present: number; late: number }>;
  activeDepartment: string;
  onSelectDepartment: (department: string) => void;
}

const formatDay = (date: string): string =>
  new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' });

export const AttendanceMetricWidget: React.FC<AttendanceMetricWidgetProps> = ({
  rows,
  weeklyTrend,
  activeDepartment,
  onSelectDepartment,
}) => {
  const online = rows.filter((row) => row.isOnline).length;
  const working = rows.filter((row) => row.isOnline && row.status !== 'On Leave').length;
  const loggedOut = rows.filter((row) => Boolean(row.loginTime && row.logoutTime)).length;
  const yetToLogin = rows.filter((row) => row.status === 'Not Logged In').length;

  const monitors = [
    { label: 'Currently Online', count: online, icon: Activity, dot: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: 'Currently Working', count: working, icon: Users, dot: 'bg-blue-500', text: 'text-blue-700' },
    { label: 'Logged Out', count: loggedOut, icon: LogOut, dot: 'bg-slate-400', text: 'text-slate-700' },
    { label: 'Yet to Login', count: yetToLogin, icon: Clock3, dot: 'bg-orange-500', text: 'text-orange-700' },
  ];

  const departments = ATTENDANCE_DEPARTMENTS.map((department) => {
    const departmentRows = rows.filter((row) => row.employee.department === department);
    return {
      department,
      total: departmentRows.length,
      present: departmentRows.filter((row) => row.status === 'Present').length,
      late: departmentRows.filter((row) => row.status === 'Late').length,
      absent: departmentRows.filter((row) => row.status === 'Absent').length,
      leave: departmentRows.filter((row) => row.status === 'On Leave').length,
      halfDay: departmentRows.filter((row) => row.status === 'Half Day').length,
    };
  });

  const maxTrend = Math.max(1, ...weeklyTrend.map((item) => item.present + item.late));

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Activity className="h-4 w-4 text-blue-600" /> Live Attendance Monitor
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">Refreshes automatically every 5 seconds.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {monitors.map(({ label, count, icon: Icon, dot, text }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                <Icon className={`h-4 w-4 ${text}`} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-slate-500">{label}</p>
                <p className="flex items-center gap-1.5 text-lg font-bold text-slate-900">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{count}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-slate-400">
          <span className="text-emerald-600">● Online</span> · <span className="text-slate-500">● Offline</span> · <span className="text-orange-600">● Late login</span>
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Building2 className="h-4 w-4 text-blue-600" /> Department Attendance
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">Select a department to filter the employee list.</p>
          </div>
          {activeDepartment && (
            <button type="button" onClick={() => onSelectDepartment('')} className="text-[11px] font-semibold text-blue-700 hover:underline">
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {departments.map((item) => (
            <button
              key={item.department}
              type="button"
              onClick={() => onSelectDepartment(activeDepartment === item.department ? '' : item.department)}
              className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                activeDepartment === item.department ? 'border-blue-500 bg-blue-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              aria-pressed={activeDepartment === item.department}
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-bold text-slate-800">{item.department}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{item.total}</span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                {[
                  ['Present', item.present, 'text-emerald-700'],
                  ['Late', item.late, 'text-orange-700'],
                  ['Absent', item.absent, 'text-rose-700'],
                  ['Leave', item.leave, 'text-purple-700'],
                  ['Half', item.halfDay, 'text-amber-700'],
                ].map(([label, count, color]) => (
                  <span key={String(label)} className="min-w-0">
                    <span className={`block text-xs font-bold ${color}`}>{count}</span>
                    <span className="block truncate text-[9px] text-slate-400">{label}</span>
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Clock3 className="h-4 w-4 text-blue-600" /> Weekly Attendance Trend
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">Present and late check-ins for the current week.</p>
        </div>
        <div className="flex h-28 items-end justify-between gap-2">
          {weeklyTrend.map((day) => {
            const total = day.present + day.late;
            const height = total ? Math.max(8, (total / maxTrend) * 90) : 4;
            return (
              <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[9px] font-semibold text-slate-500">{total || ''}</span>
                <div className="flex w-full max-w-8 flex-col justify-end overflow-hidden rounded-t-md bg-slate-100" style={{ height: `${height}px` }}>
                  {day.late > 0 && <span className="bg-orange-400" style={{ height: `${(day.late / total) * 100}%` }} />}
                  {day.present > 0 && <span className="flex-1 bg-emerald-500" />}
                </div>
                <span className="text-[9px] text-slate-400">{formatDay(day.date)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-500" />Present</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-orange-400" />Late</span>
        </div>
      </section>
    </div>
  );
};

export default AttendanceMetricWidget;