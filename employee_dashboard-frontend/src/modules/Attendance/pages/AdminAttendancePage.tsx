import React, { useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileClock,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import AttendanceMetricWidget from '../components/AttendanceMetricWidget';
import AttendanceStatsCard from '../components/AttendanceStatsCard';
import AttendanceTable from '../components/AttendanceTable';
import { OFFICE_POLICY } from '../constants/attendance.constants';
import { useAttendance } from '../hooks/useAttendance';
import { attendanceService } from '../services/attendance.service';
import {
  AttendanceCorrectionRequest,
  AttendanceRow,
  AttendanceStatus,
  AttendanceSummaryFilter,
  AttendanceSummaryMetric,
} from '../types/attendance.types';
import employeeService from '../../Employee/services/employee.service';

type DateScope = 'day' | 'week' | 'month' | 'year';
type DrawerMode = 'details' | 'history';

const todayString = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getMonthDates = (month: string): string[] => {
  const [year, monthNumber] = month.split('-').map(Number);
  const count = new Date(year, monthNumber, 0).getDate();
  return Array.from({ length: count }, (_, index) =>
    `${year}-${String(monthNumber).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
  );
};

const getDateRange = (date: string, scope: DateScope): string[] => {
  const anchor = new Date(`${date}T12:00:00`);
  let start = new Date(anchor);
  let end = new Date(anchor);

  if (scope === 'week') {
    const offset = (anchor.getDay() + 6) % 7;
    start.setDate(anchor.getDate() - offset);
    end.setDate(start.getDate() + 6);
  } else if (scope === 'month') {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
    end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12);
  } else if (scope === 'year') {
    start = new Date(anchor.getFullYear(), 0, 1, 12);
    end = new Date(anchor.getFullYear(), 11, 31, 12);
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (end > today) end = today;

  const result: string[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    result.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    );
  }
  return result;
};

const percentOf = (count: number, total: number): number =>
  total === 0 ? 0 : Math.round((count / total) * 100);

const summaryStatus: Partial<Record<AttendanceSummaryFilter, AttendanceStatus>> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  leave: 'On Leave',
  'half-day': 'Half Day',
  'not-logged-in': 'Not Logged In',
};

interface AttendanceDrawerProps {
  row: AttendanceRow;
  mode: DrawerMode;
  onClose: () => void;
  onCorrect: (row: AttendanceRow) => void;
}

const AttendanceDrawer: React.FC<AttendanceDrawerProps> = ({ row, mode, onClose, onCorrect }) => {
  const monthDates = useMemo(() => getMonthDates(row.date.slice(0, 7)), [row.date]);
  const monthRows = useMemo(
    () =>
      monthDates
        .map((date) =>
          attendanceService
            .getAttendanceForDate(date)
            .find((entry) => entry.employee.id === row.employee.id)
        )
        .filter((entry): entry is AttendanceRow => Boolean(entry)),
    [monthDates, row.employee.id]
  );
  const monthlyCount = (status: AttendanceStatus) =>
    monthRows.filter((entry) => entry.status === status).length;
  const events = [
    { label: 'Login', time: row.loginTime, color: 'bg-emerald-500' },
    { label: 'Break', time: null, color: 'bg-slate-300' },
    { label: 'Resume', time: null, color: 'bg-slate-300' },
    { label: 'Logout', time: row.logoutTime, color: 'bg-blue-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close attendance details" />
      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              {mode === 'history' ? 'Attendance history' : 'Employee attendance'}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {row.employee.firstName} {row.employee.lastName}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{row.employee.employeeId} · {row.employee.department}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close details" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <section className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            {row.employee.photoUrl ? (
              <img src={row.employee.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
                {row.employee.firstName[0]}{row.employee.lastName[0]}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900">{row.employee.designation}</p>
              <p className="truncate text-xs text-slate-500">{row.employee.companyEmail}</p>
              <p className="mt-1 text-[11px] text-slate-500">Date: {row.date}</p>
            </div>
          </section>

          {mode === 'details' ? (
            <>
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Attendance details</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Login Time', row.loginTime ?? '—'],
                    ['Logout Time', row.logoutTime ?? '—'],
                    ['Working Hours', attendanceService.formatWorkingHours(row.workingMinutes)],
                    ['Late Minutes', row.lateMinutes ? `${row.lateMinutes} minutes` : '—'],
                    ['Status', row.status],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-[10px] font-medium text-slate-500">{label}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Monthly summary</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {[
                    ['Present', monthlyCount('Present'), 'text-emerald-700'],
                    ['Late', monthlyCount('Late'), 'text-orange-700'],
                    ['Half Day', monthlyCount('Half Day'), 'text-amber-700'],
                    ['Leave', monthlyCount('On Leave'), 'text-purple-700'],
                    ['Absent', monthlyCount('Absent'), 'text-rose-700'],
                  ].map(([label, count, color]) => (
                    <div key={String(label)} className="rounded-xl bg-slate-50 p-2 text-center">
                      <p className={`text-lg font-bold ${color}`}>{count}</p>
                      <p className="text-[9px] text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Attendance timeline</h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.label} className="flex items-center gap-3 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${event.color}`} />
                      <span className="w-16 font-semibold text-slate-700">{event.label}</span>
                      <span className="text-slate-500">{event.time ?? (event.label === 'Break' || event.label === 'Resume' ? 'Future feature' : 'Not recorded')}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Monthly attendance history</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {monthRows.map((entry) => (
                  <div key={entry.date} className="grid grid-cols-4 gap-2 border-b border-slate-100 px-3 py-2 text-[11px] last:border-0">
                    <span className="font-medium text-slate-700">{entry.date}</span>
                    <span className="text-slate-500">{entry.loginTime ?? '—'} / {entry.logoutTime ?? '—'}</span>
                    <span className="text-slate-500">{attendanceService.formatWorkingHours(entry.workingMinutes)}</span>
                    <span className="font-semibold text-slate-700">{entry.status}</span>
                  </div>
                ))}
                {monthRows.length === 0 && <p className="p-5 text-center text-xs text-slate-500">No attendance history for this month.</p>}
              </div>
            </section>
          )}
        </div>
        <div className="flex justify-end border-t border-slate-200 p-4">
          <button type="button" onClick={() => onCorrect(row)} disabled={row.status === 'On Leave' || row.status === 'Weekend' || row.status === 'Holiday'} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            Correct Attendance
          </button>
        </div>
      </aside>
    </div>
  );
};

interface CorrectionModalProps {
  row: AttendanceRow;
  onClose: () => void;
  onSave: (row: AttendanceRow, loginTime: string, logoutTime: string, reason: string) => void;
}

const CorrectionModal: React.FC<CorrectionModalProps> = ({ row, onClose, onSave }) => {
  const [loginTime, setLoginTime] = useState(row.loginTime ?? '');
  const [logoutTime, setLogoutTime] = useState(row.logoutTime ?? '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!loginTime || !reason.trim()) {
      setError('Enter the corrected login time and a reason.');
      return;
    }
    if (logoutTime && logoutTime < loginTime) {
      setError('Logout time cannot be earlier than login time.');
      return;
    }
    onSave(row, loginTime, logoutTime, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Correct Attendance</h2>
            <p className="mt-1 text-xs text-slate-500">{row.employee.firstName} {row.employee.lastName} · {row.date}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close correction form" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Login Time
            <input type="time" value={loginTime} onChange={(event) => setLoginTime(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Logout Time
            <input type="time" value={logoutTime} onChange={(event) => setLogoutTime(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          Correction Reason
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Explain why this attendance needs correction" />
        </label>
        {error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
            <Check className="h-4 w-4" /> Save Correction
          </button>
        </div>
      </form>
    </div>
  );
};

export const AdminAttendancePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [dateScope, setDateScope] = useState<DateScope>('day');
  const [activeSummary, setActiveSummary] = useState<AttendanceSummaryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('');
  const [selectedDrawer, setSelectedDrawer] = useState<{ row: AttendanceRow; mode: DrawerMode } | null>(null);
  const [correctionRow, setCorrectionRow] = useState<AttendanceRow | null>(null);
  const [notice, setNotice] = useState('');
  const [reportType, setReportType] = useState('daily');
  const { rows, correctionRequests } = useAttendance(selectedDate);

  const pendingCorrections = useMemo(
    () => correctionRequests.filter((request) => request.status === 'Pending'),
    [correctionRequests]
  );

  const metrics = useMemo<AttendanceSummaryMetric[]>(() => {
    const total = rows.length;
    const count = (status: AttendanceStatus) => rows.filter((row) => row.status === status).length;
    const definitions: Array<{
      key: AttendanceSummaryFilter;
      label: string;
      count: number;
      description: string;
    }> = [
      { key: 'all', label: 'Total Employees', count: total, description: 'Active employee roster' },
      { key: 'present', label: 'Present Today', count: count('Present'), description: 'Checked in on time' },
      { key: 'late', label: 'Late Employees', count: count('Late'), description: 'Checked in after 9:45 AM' },
      { key: 'absent', label: 'Absent Employees', count: count('Absent'), description: 'No login by 11:00 AM' },
      { key: 'leave', label: 'Employees On Leave', count: count('On Leave'), description: 'Approved leave today' },
      { key: 'half-day', label: 'Half Day Employees', count: count('Half Day'), description: 'Less than 4 working hours' },
      { key: 'not-logged-in', label: 'Not Logged In', count: count('Not Logged In'), description: 'No login recorded yet' },
      { key: 'corrections', label: 'Correction Requests', count: pendingCorrections.length, description: 'Awaiting admin review' },
    ];
    return definitions.map((item) => ({
      ...item,
      percentage: item.key === 'all' ? (total ? 100 : 0) : percentOf(item.count, total),
    }));
  }, [rows, pendingCorrections]);

  const dateRange = useMemo(() => getDateRange(selectedDate, dateScope), [selectedDate, dateScope]);
  const rangeRows = useMemo(
    () =>
      dateScope === 'day'
        ? rows
        : dateRange.flatMap((date) => attendanceService.getAttendanceForDate(date)),
    [dateRange, dateScope, rows]
  );

  const filteredRows = useMemo(() => {
    const pendingKeys = new Set(pendingCorrections.map((request) => `${request.employeeKey}:${request.date}`));
    const cardStatus = summaryStatus[activeSummary];
    const query = searchQuery.trim().toLowerCase();
    return rangeRows.filter((row) => {
      const employee = row.employee;
      const matchesSearch =
        !query ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(query) ||
        employee.employeeId.toLowerCase().includes(query) ||
        employee.companyEmail.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.designation.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (!departmentFilter || employee.department === departmentFilter) &&
        (!designationFilter || employee.designation === designationFilter) &&
        (!statusFilter || row.status === statusFilter) &&
        (!cardStatus || row.status === cardStatus) &&
        (activeSummary !== 'corrections' || pendingKeys.has(`${employee.id}:${row.date}`))
      );
    });
  }, [activeSummary, departmentFilter, designationFilter, pendingCorrections, rangeRows, searchQuery, statusFilter]);

  const reportRows = useMemo(() => {
    if (reportType === 'late') return filteredRows.filter((row) => row.status === 'Late');
    if (reportType === 'absent') return filteredRows.filter((row) => row.status === 'Absent');
    if (reportType === 'hours') return [...filteredRows].sort((a, b) => b.workingMinutes - a.workingMinutes);
    return filteredRows;
  }, [filteredRows, reportType]);

  const designations = useMemo(
    () => Array.from(new Set(rows.map((row) => row.employee.designation))).sort(),
    [rows]
  );

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setDateScope('day');
    setActiveSummary('all');
  };

  const handleQuickFilter = (filter: 'today' | 'yesterday' | 'week' | 'month') => {
    const today = new Date();
    const selected = new Date(today);
    if (filter === 'yesterday') selected.setDate(today.getDate() - 1);
    const date = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;
    setSelectedDate(date);
    setDateScope(filter === 'week' ? 'week' : filter === 'month' ? 'month' : 'day');
    setActiveSummary('all');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setDesignationFilter('');
    setStatusFilter('');
    setDateScope('day');
    setSelectedDate(todayString());
    setActiveSummary('all');
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const exportRows = (format: 'csv' | 'excel') => {
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Designation', 'Login Time', 'Logout Time', 'Working Hours', 'Late Minutes', 'Status'];
    const lines = reportRows.map((row) => [
      row.date,
      row.employee.employeeId,
      `${row.employee.firstName} ${row.employee.lastName}`,
      row.employee.department,
      row.employee.designation,
      row.loginTime ?? '',
      row.logoutTime ?? '',
      attendanceService.formatWorkingHours(row.workingMinutes),
      row.lateMinutes,
      row.status,
    ]);
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...lines].map((line) => line.map(escape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${reportType}-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showNotice(`${format === 'excel' ? 'Excel-compatible CSV' : 'CSV'} report exported.`);
  };

  const handleCorrectAttendance = (
    row: AttendanceRow,
    loginTime: string,
    logoutTime: string,
    reason: string
  ) => {
    const result = attendanceService.correctAttendance(row.employee.id, row.date, loginTime, logoutTime, reason);
    if (!result) {
      showNotice('Attendance could not be corrected. The employee may no longer be active.');
      return;
    }
    setCorrectionRow(null);
    setSelectedDrawer(null);
    showNotice('Attendance correction was applied and logged.');
  };

  const handleApproveCorrection = (request: AttendanceCorrectionRequest) => {
    if (attendanceService.approveCorrection(request.id)) showNotice('Correction approved and attendance updated.');
    else showNotice('This correction request could not be approved.');
  };

  const handleRejectCorrection = (request: AttendanceCorrectionRequest) => {
    if (attendanceService.rejectCorrection(request.id)) showNotice('Correction request rejected.');
    else showNotice('This correction request could not be rejected.');
  };

  return (
    <div className="space-y-6 pb-10">
      {notice && (
        <div role="status" className="fixed right-5 top-20 z-[70] flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />{notice}
        </div>
      )}

      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Workspace
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Attendance Management</h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            Monitor daily attendance, review exceptions, and manage employee time records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            <FileClock className="h-4 w-4 text-blue-600" />
            Report
            <select
              value={reportType}
              onChange={(event) => {
                const nextReportType = event.target.value;
                setReportType(nextReportType);
                if (nextReportType === 'daily') setDateScope('day');
                else if (nextReportType === 'weekly') setDateScope('week');
                else if (nextReportType === 'monthly') setDateScope('month');
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="department">Department</option>
              <option value="employee">Employee</option>
              <option value="late">Late Arrival</option>
              <option value="absent">Absent</option>
              <option value="hours">Working Hours</option>
            </select>
          </label>
          <button type="button" onClick={() => exportRows('excel')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Excel CSV
          </button>
          <button type="button" onClick={() => exportRows('csv')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <span className="inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> CSV</span>
          </button>
          <button type="button" onClick={() => window.print()} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
            PDF / Print
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {metrics.map((metric, index) => {
          const iconAndColor = [
            [Users, 'bg-blue-50 text-blue-700'],
            [UserCheck, 'bg-emerald-50 text-emerald-700'],
            [Clock3, 'bg-orange-50 text-orange-700'],
            [UserMinus, 'bg-rose-50 text-rose-700'],
            [CalendarDays, 'bg-purple-50 text-purple-700'],
            [Activity, 'bg-amber-50 text-amber-700'],
            [Clock3, 'bg-slate-100 text-slate-700'],
            [FileClock, 'bg-indigo-50 text-indigo-700'],
          ] as const;
          const [Icon, color] = iconAndColor[index];
          return (
            <AttendanceStatsCard
              key={metric.key}
              metric={metric}
              icon={Icon}
              color={color}
              active={activeSummary === metric.key}
              onClick={() => setActiveSummary(metric.key)}
            />
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, employee ID, email, department, designation..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
            <input type="date" value={selectedDate} onChange={(event) => event.target.value && handleSelectDate(event.target.value)} aria-label="Attendance date" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} aria-label="Department filter" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <option value="">All Departments</option>
              {['Software Development', 'Digital Marketing', 'Sales', 'Administration'].map((department) => <option key={department}>{department}</option>)}
            </select>
            <select value={designationFilter} onChange={(event) => setDesignationFilter(event.target.value)} aria-label="Designation filter" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <option value="">All Designations</option>
              {designations.map((designation) => <option key={designation}>{designation}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AttendanceStatus | '')} aria-label="Attendance status filter" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <option value="">All Statuses</option>
              {['Present', 'Late', 'Half Day', 'On Leave', 'Absent', 'Work From Home', 'Holiday', 'Weekend', 'Not Logged In'].map((status) => <option key={status}>{status}</option>)}
            </select>
            <select value={dateScope} onChange={(event) => setDateScope(event.target.value as DateScope)} aria-label="Date range" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              <option value="day">Day</option><option value="week">Week</option><option value="month">Month</option><option value="year">Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setActiveSummary('all')} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
              <Filter className="h-3.5 w-3.5" /> Apply Filters
            </button>
            <button type="button" onClick={resetFilters} aria-label="Reset filters" className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Quick filters</span>
          {[
            ['Today', 'today'],
            ['Yesterday', 'yesterday'],
            ['This Week', 'week'],
            ['This Month', 'month'],
          ].map(([label, key]) => (
            <button key={key} type="button" onClick={() => handleQuickFilter(key as 'today' | 'yesterday' | 'week' | 'month')} className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
              {label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-400">
            {dateScope === 'day' ? selectedDate : `${dateScope[0].toUpperCase()}${dateScope.slice(1)} view · ${dateRange[0]} – ${dateRange[dateRange.length - 1]}`}
          </span>
        </div>
      </section>

      <AttendanceMetricWidget
        rows={rows}
        activeDepartment={departmentFilter}
        onSelectDepartment={setDepartmentFilter}
      />

      {activeSummary === 'corrections' && (
        <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileClock className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Pending Correction Requests</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{pendingCorrections.length}</span>
          </div>
          {pendingCorrections.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">No attendance correction requests are awaiting review.</p>
          ) : (
            <div className="space-y-2">
              {pendingCorrections.map((request) => {
                const employee = employeeService.getEmployeeById(request.employeeKey);
                return (
                  <div key={request.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{employee ? `${employee.firstName} ${employee.lastName}` : request.employeeKey} · {request.date}</p>
                      <p className="mt-1 text-[11px] text-slate-500">Login: {request.loginTime ?? '—'} · Logout: {request.logoutTime ?? '—'}</p>
                      <p className="mt-1 text-[11px] text-slate-600">{request.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleApproveCorrection(request)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700">Approve</button>
                      <button type="button" onClick={() => handleRejectCorrection(request)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50">Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Attendance Register</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {filteredRows.length} records · refreshed every {OFFICE_POLICY.liveRefreshMilliseconds / 1000}s
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Online</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />Offline</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" />Late</span>
          </div>
        </div>
        <AttendanceTable
          rows={filteredRows}
          onViewDetails={(row) => setSelectedDrawer({ row, mode: 'details' })}
          onCorrect={(row) => setCorrectionRow(row)}
          onViewHistory={(row) => setSelectedDrawer({ row, mode: 'history' })}
        />
      </section>

      {selectedDrawer && (
        <AttendanceDrawer
          row={selectedDrawer.row}
          mode={selectedDrawer.mode}
          onClose={() => setSelectedDrawer(null)}
          onCorrect={(row) => {
            setSelectedDrawer(null);
            setCorrectionRow(row);
          }}
        />
      )}
      {correctionRow && (
        <CorrectionModal
          row={correctionRow}
          onClose={() => setCorrectionRow(null)}
          onSave={handleCorrectAttendance}
        />
      )}
    </div>
  );
};

export default AdminAttendancePage;