import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileClock,
  Filter,
  ListChecks,
  Search,
  UsersRound,
  UserCheck,
  UserRoundCheck,
  X,
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import WorkUpdateDetailsDrawer from '../components/WorkUpdateDetailsDrawer';
import WorkUpdateSummaryCard from '../components/WorkUpdateSummaryCard';
import WorkUpdateTable from '../components/WorkUpdateTable';
import { workUpdateService } from '../services/workUpdate.service';
import employeeService from '../../Employee/services/employee.service';
import type {
  WorkUpdateFilter,
  WorkUpdateReportType,
  WorkUpdateRow,
  WorkUpdateStatus,
} from '../types/workUpdate.types';

type DateRangeMode = 'day' | 'week' | 'month';
type ProgressFilter = 'all' | '0-24' | '25-49' | '50-74' | '75-99' | '100';
type SortKey = 'employee' | 'department' | 'designation' | 'progress' | 'submitted' | 'logout' | 'status';

interface WorkFilters {
  department: string;
  designation: string;
  progress: ProgressFilter;
  status: WorkUpdateStatus | 'all';
}

const localDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getRangeDates = (anchorDate: string, mode: DateRangeMode): string[] => {
  const anchor = new Date(`${anchorDate}T12:00:00`);
  let start = new Date(anchor);
  let end = new Date(anchor);

  if (mode === 'week') {
    const mondayOffset = (anchor.getDay() + 6) % 7;
    start.setDate(anchor.getDate() - mondayOffset);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else if (mode === 'month') {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
    end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12);
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (end > today) end = today;

  const dates: string[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    dates.push(localDateString(cursor));
  }
  return dates;
};

const defaultFilters: WorkFilters = {
  department: 'all',
  designation: 'all',
  progress: 'all',
  status: 'all',
};

const progressMatches = (progress: number | null, filter: ProgressFilter): boolean => {
  if (filter === 'all') return true;
  if (progress === null) return false;
  if (filter === '100') return progress === 100;
  const [minimum, maximum] = filter.split('-').map(Number);
  return progress >= minimum && progress <= maximum;
};

const compareText = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { sensitivity: 'base' });

function WorkUpdateSkeleton() {
  return (
    <div aria-label="Loading daily work updates" className="space-y-3" role="status">
      {Array.from({ length: 5 }, (_, index) => (
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4" key={index}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-slate-100" />
              <div className="h-2.5 w-1/2 rounded bg-slate-100" />
            </div>
            <div className="h-7 w-20 rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 h-3 w-full rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function AdminWorkUpdatesPage() {
  const today = localDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateRangeMode, setDateRangeMode] = useState<DateRangeMode>('day');
  const [rows, setRows] = useState<WorkUpdateRow[]>([]);
  const [todayRows, setTodayRows] = useState<WorkUpdateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<WorkFilters>(defaultFilters);
  const [filters, setFilters] = useState<WorkFilters>(defaultFilters);
  const [activeCardFilter, setActiveCardFilter] = useState<WorkUpdateFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('submitted');
  const [sortDescending, setSortDescending] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reportType, setReportType] = useState<WorkUpdateReportType>('daily');
  const [selectedRow, setSelectedRow] = useState<WorkUpdateRow | null>(null);
  const [focusRemark, setFocusRemark] = useState(false);

  const refreshData = useCallback(() => {
    try {
      const selectedDates = getRangeDates(selectedDate, dateRangeMode);
      const rangeRows = selectedDates.flatMap((date) => workUpdateService.getRowsForDate(date));
      setRows(rangeRows.filter((row) => row.update || row.date === selectedDate));
      setTodayRows(workUpdateService.getRowsForDate(localDateString(new Date())));
      setLoadError('');
    } catch (error) {
      console.error('Unable to load daily work updates', error);
      setLoadError('Work updates could not be loaded. Please try refreshing this page.');
      setRows([]);
      setTodayRows([]);
    } finally {
      setLoading(false);
    }
  }, [dateRangeMode, selectedDate]);

  useEffect(() => {
    setLoading(true);
    void employeeService.syncFromBackend().catch(() => {});
    void workUpdateService.syncFromBackend().catch(() => {});
    refreshData();
    const unsubscribe = workUpdateService.subscribe(refreshData);
    const refreshTimer = window.setInterval(() => {
      void workUpdateService.syncFromBackend().catch(() => {});
      refreshData();
    }, 15000);
    window.addEventListener('storage', refreshData);
    return () => {
      unsubscribe();
      window.clearInterval(refreshTimer);
      window.removeEventListener('storage', refreshData);
    };
  }, [refreshData, selectedDate]);

  useEffect(() => setPage(1), [activeCardFilter, filters, searchQuery, selectedDate, dateRangeMode]);

  const departments = useMemo(
    () => Array.from(new Set(rows.map((row) => row.employee.department))).sort(compareText),
    [rows]
  );
  const designations = useMemo(
    () => Array.from(
      new Set(rows
        .filter((row) => filters.department === 'all' || row.employee.department === filters.department)
        .map((row) => row.employee.designation))
    ).sort(compareText),
    [filters.department, rows]
  );

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matched = rows.filter((row) => {
      const employeeName = `${row.employee.firstName} ${row.employee.lastName}`;
      const update = row.update;
      const matchesSearch = !query || [
        employeeName,
        row.employee.employeeId,
        row.employee.companyEmail,
        row.employee.department,
        row.employee.designation,
        update?.workSummary ?? '',
      ].some((value) => value.toLowerCase().includes(query));
      const matchesDepartment = filters.department === 'all' || row.employee.department === filters.department;
      const matchesDesignation = filters.designation === 'all' || row.employee.designation === filters.designation;
      const matchesProgress = progressMatches(update?.progressPercentage ?? null, filters.progress);
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesCard = activeCardFilter === 'all'
        || activeCardFilter === 'employees'
        || (activeCardFilter === 'updates' && Boolean(update))
        || (activeCardFilter === 'pending' && row.status === 'Pending')
        || (activeCardFilter === 'logged-out' && Boolean(row.logoutTime))
        || (activeCardFilter === 'working' && row.isWorking)
        || (activeCardFilter === 'completed' && row.status === 'Completed');
      return matchesSearch && matchesDepartment && matchesDesignation && matchesProgress && matchesStatus && matchesCard;
    });

    return matched.sort((left, right) => {
      let comparison = 0;
      if (sortKey === 'employee') {
        comparison = compareText(
          `${left.employee.firstName} ${left.employee.lastName}`,
          `${right.employee.firstName} ${right.employee.lastName}`
        );
      } else if (sortKey === 'department') {
        comparison = compareText(left.employee.department, right.employee.department);
      } else if (sortKey === 'designation') {
        comparison = compareText(left.employee.designation, right.employee.designation);
      } else if (sortKey === 'progress') {
        comparison = (left.update?.progressPercentage ?? -1) - (right.update?.progressPercentage ?? -1);
      } else if (sortKey === 'submitted') {
        comparison = (left.update?.submittedAt ?? '').localeCompare(right.update?.submittedAt ?? '');
      } else if (sortKey === 'logout') {
        comparison = (left.logoutTime ?? '').localeCompare(right.logoutTime ?? '');
      } else {
        comparison = compareText(left.status, right.status);
      }
      return sortDescending ? -comparison : comparison;
    });
  }, [activeCardFilter, filters, rows, searchQuery, sortDescending, sortKey]);

  const summaryMetrics = [
    { label: 'Total Employees', count: todayRows.length, description: 'Active employee roster', icon: UsersRound, tone: 'blue' as const, filter: 'employees' as const },
    { label: "Today's Work Updates", count: todayRows.filter((row) => row.update).length, description: 'Reports submitted today', icon: ListChecks, tone: 'green' as const, filter: 'updates' as const },
    { label: 'Pending Work Updates', count: todayRows.filter((row) => row.status === 'Pending').length, description: 'Employees yet to submit', icon: FileClock, tone: 'amber' as const, filter: 'pending' as const },
    { label: 'Employees Logged Out', count: todayRows.filter((row) => row.logoutTime).length, description: 'Logout time recorded today', icon: UserCheck, tone: 'violet' as const, filter: 'logged-out' as const },
    { label: 'Employees Still Working', count: todayRows.filter((row) => row.isWorking).length, description: 'Currently clocked in', icon: Clock3, tone: 'cyan' as const, filter: 'working' as const },
    { label: 'Completed Work Reports Today', count: todayRows.filter((row) => row.status === 'Completed').length, description: 'Progress reported at 100%', icon: UserRoundCheck, tone: 'rose' as const, filter: 'completed' as const },
  ];

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
    setActiveCardFilter('all');
    setSelectedDate(today);
    setDateRangeMode('day');
    setReportType('daily');
    setSortKey('submitted');
    setSortDescending(true);
  };

  const selectQuickDate = (mode: DateRangeMode) => {
    setSelectedDate(today);
    setDateRangeMode(mode);
  };

  const selectSummary = (filter: WorkUpdateFilter) => {
    setSelectedDate(today);
    setDateRangeMode('day');
    setActiveCardFilter((current) => current === filter ? 'all' : filter);
  };

  const handleSaveRemark = (updateId: string, remark: string): boolean => {
    try {
      const saved = workUpdateService.addAdminRemark(updateId, remark);
      if (!saved) {
        showNotice('This work update is no longer available.');
        return false;
      }
      const refreshedRow = workUpdateService
        .getRowsForDate(selectedRow?.date ?? selectedDate)
        .find((row) => row.update?.id === updateId);
      if (refreshedRow) setSelectedRow(refreshedRow);
      refreshData();
      showNotice('Admin remark saved.');
      return true;
    } catch (error) {
      console.error('Unable to save admin remark', error);
      showNotice(error instanceof Error ? error.message : 'Unable to save the admin remark.');
      return false;
    }
  };

  const exportCsv = () => {
    const headers = [
      'Date',
      'Employee ID',
      'Employee Name',
      'Department',
      'Designation',
      'Work Summary',
      'Attached Document',
      'Progress Percentage',
      'Submitted Time',
      'Logout Time',
      'Status',
      'Admin Remarks',
    ];
    const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const lines = filteredRows.map((row) => [
      row.date,
      row.employee.employeeId,
      `${row.employee.firstName} ${row.employee.lastName}`,
      row.employee.department,
      row.employee.designation,
      row.update?.workSummary ?? '',
      row.update?.attachment?.name ?? '',
      row.update?.progressPercentage ?? '',
      row.update?.submittedAt ?? '',
      row.logoutTime ?? '',
      row.status,
      row.update?.adminRemarks?.map((remark) => remark.text).join(' | ') ?? '',
    ].map(escapeCell).join(','));
    const content = `\uFEFF${[headers.map(escapeCell).join(','), ...lines].join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-work-${reportType}-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleReportTypeChange = (nextType: WorkUpdateReportType) => {
    setReportType(nextType);
    if (nextType === 'daily') setDateRangeMode('day');
    if (nextType === 'monthly') setDateRangeMode('month');
    if (nextType === 'department') {
      setSortKey('department');
      setSortDescending(false);
    }
    if (nextType === 'productivity') {
      setSortKey('progress');
      setSortDescending(true);
    }
  };

  const pageStart = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredRows.length);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        {notice && (
          <div className="fixed right-5 top-20 z-[80] flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-lg" role="status">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />{notice}
          </div>
        )}

        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              <ListChecks className="h-3.5 w-3.5" /> Admin Workspace
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Daily Work Updates</h1>
            <p className="mt-1 max-w-2xl text-xs text-slate-500">
              Review employee end-of-day reports and add admin feedback. Employee submissions are read-only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <FileClock className="h-4 w-4 text-blue-600" />
              Report
              <select
                aria-label="Work update report type"
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none"
                onChange={(event) => handleReportTypeChange(event.target.value as WorkUpdateReportType)}
                value={reportType}
              >
                <option value="daily">Daily Work Report</option>
                <option value="department">Department-wise</option>
                <option value="productivity">Employee Productivity</option>
                <option value="monthly">Monthly Summary</option>
              </select>
            </label>
            <button
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={exportCsv}
              type="button"
            >
              <Download className="h-3.5 w-3.5" /> Excel CSV
            </button>
            <button
              className="rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
              onClick={() => window.print()}
              type="button"
            >
              Export PDF / Print
            </button>
          </div>
        </header>

        <section aria-label="Work update summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {summaryMetrics.map((metric) => (
            <WorkUpdateSummaryCard
              active={activeCardFilter === metric.filter}
              count={metric.count}
              description={metric.description}
              filter={metric.filter}
              icon={metric.icon}
              key={metric.label}
              label={metric.label}
              onSelect={selectSummary}
              tone={metric.tone}
            />
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3">
            <label className="relative block">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search daily work updates"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search employee, ID, department, designation, or work summary..."
                value={searchQuery}
              />
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <label className="text-[10px] font-semibold text-slate-500">
                Date
                <input
                  aria-label="Work update date"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700"
                  max={today}
                  onChange={(event) => {
                    if (event.target.value) {
                      setSelectedDate(event.target.value);
                      setDateRangeMode('day');
                    }
                  }}
                  type="date"
                  value={selectedDate}
                />
              </label>
              <label className="text-[10px] font-semibold text-slate-500">
                Department
                <select
                  aria-label="Department filter"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700"
                  onChange={(event) => setDraftFilters({ ...draftFilters, department: event.target.value })}
                  value={draftFilters.department}
                >
                  <option value="all">All departments</option>
                  {departments.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-semibold text-slate-500">
                Designation
                <select
                  aria-label="Designation filter"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700"
                  onChange={(event) => setDraftFilters({ ...draftFilters, designation: event.target.value })}
                  value={draftFilters.designation}
                >
                  <option value="all">All designations</option>
                  {designations.map((designation) => <option key={designation} value={designation}>{designation}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-semibold text-slate-500">
                Progress
                <select
                  aria-label="Progress filter"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700"
                  onChange={(event) => setDraftFilters({ ...draftFilters, progress: event.target.value as ProgressFilter })}
                  value={draftFilters.progress}
                >
                  <option value="all">Any progress</option>
                  <option value="0-24">0–24%</option>
                  <option value="25-49">25–49%</option>
                  <option value="50-74">50–74%</option>
                  <option value="75-99">75–99%</option>
                  <option value="100">100%</option>
                </select>
              </label>
              <label className="text-[10px] font-semibold text-slate-500">
                Submission Status
                <select
                  aria-label="Submission status filter"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700"
                  onChange={(event) => setDraftFilters({ ...draftFilters, status: event.target.value as WorkUpdateStatus | 'all' })}
                  value={draftFilters.status}
                >
                  <option value="all">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Completed">Completed</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick filters</span>
                {([
                  ['Today', 'day'],
                  ['This Week', 'week'],
                  ['This Month', 'month'],
                ] as const).map(([label, mode]) => (
                  <button
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold transition ${
                      dateRangeMode === mode ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    key={label}
                    onClick={() => selectQuickDate(mode)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setFilters(draftFilters);
                    setActiveCardFilter('all');
                  }}
                  type="button"
                >
                  <Filter className="h-3.5 w-3.5" /> Apply Filters
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-500 hover:bg-slate-50"
                  onClick={resetFilters}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily Work Updates</h2>
              <p className="mt-1 text-[11px] text-slate-500">
                {filteredRows.length.toLocaleString()} matching records · {selectedDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                Sort by
                <select
                  aria-label="Sort work updates"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  value={sortKey}
                >
                  <option value="submitted">Submitted time</option>
                  <option value="employee">Employee name</option>
                  <option value="department">Department</option>
                  <option value="designation">Designation</option>
                  <option value="progress">Progress</option>
                  <option value="logout">Logout time</option>
                  <option value="status">Status</option>
                </select>
              </label>
              <button
                aria-label={sortDescending ? 'Sort ascending' : 'Sort descending'}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                onClick={() => setSortDescending((descending) => !descending)}
                type="button"
              >
                {sortDescending ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-xs font-medium text-rose-800" role="alert">
              {loadError}
            </div>
          ) : loading ? (
            <WorkUpdateSkeleton />
          ) : (
            <WorkUpdateTable
              onAddRemark={(row) => {
                setSelectedRow(row);
                setFocusRemark(true);
              }}
              onView={(row) => {
                setSelectedRow(row);
                setFocusRemark(false);
              }}
              rows={currentPageRows}
            />
          )}

          {!loading && !loadError && filteredRows.length > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-slate-500">
                Showing {pageStart}–{pageEnd} of {filteredRows.length}
              </p>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <label className="flex items-center gap-2 text-[10px] text-slate-500">
                  Rows
                  <select
                    aria-label="Rows per page"
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    value={pageSize}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>
                <span aria-live="polite" className="text-[10px] text-slate-500">Page {page} of {pageCount}</span>
                <div className="flex gap-1">
                  <button
                    aria-label="Previous page"
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    type="button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Next page"
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
                    disabled={page >= pageCount}
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    type="button"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {selectedRow && (
          <WorkUpdateDetailsDrawer
            focusRemark={focusRemark}
            onClose={() => setSelectedRow(null)}
            onSaveRemark={handleSaveRemark}
            row={selectedRow}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminWorkUpdatesPage;