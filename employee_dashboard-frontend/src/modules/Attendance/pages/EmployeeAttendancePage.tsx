import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import {
  PageTransition,
  Card,
  Button,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
} from '../../../components/common/UI';
import { AttendanceRecord } from '../../../types/user.types';

export const EmployeeAttendancePage: React.FC = () => {
  const { showToast } = useToast();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
  const [monthlySummary, setMonthlySummary] = useState({
    present: 0,
    late: 0,
    halfDay: 0,
    absent: 0,
    onLeave: 0,
    totalWorkingHours: 0,
    totalLateMinutes: 0,
  });

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [todayRes, monthlyRes, histRes] = await Promise.all([
        apiClient.get('/attendance/today'),
        apiClient.get(`/attendance/monthly?year=${year}&month=${month}`),
        apiClient.get(
          `/attendance/history?limit=31${statusFilter !== 'All' ? `&status=${encodeURIComponent(statusFilter)}` : ''}`
        ),
      ]);
      setTodayRecord(todayRes.data.data);
      setMonthlyRecords(monthlyRes.data.data.records || []);
      setMonthlySummary(monthlyRes.data.data.summary || {});
      setHistory(histRes.data.data.records || []);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [year, month, statusFilter, showToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await apiClient.post('/attendance/clock-in');
      showToast('Clocked in successfully.', 'success');
      await fetchAll();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await apiClient.post('/attendance/clock-out');
      showToast('Clocked out successfully.', 'success');
      await fetchAll();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiClient.get('/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${year}_${String(month).padStart(2, '0')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Attendance exported to Excel.', 'success');
    } catch (err) {
      showToast(extractApiError(err, 'Export failed.'), 'error');
    }
  };

  const changeMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const formatTime = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

  // Build calendar grid for current month
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const recordByDate = new Map(monthlyRecords.map((r) => [r.date, r]));
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <LoadingSpinner label="Loading attendance records..." />;

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">Attendance</h1>
          <p className="text-[14px] text-[#6B7280]">
            Track daily clock-in/out times, monthly attendance calendar, and working hours.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      {/* Today's Action Banner */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#F1F5F9]">
              <p className="text-[12px] text-[#6B7280] font-medium">Status</p>
              <div className="mt-1.5">
                <StatusBadge status={todayRecord?.status || 'Not Clocked In'} />
              </div>
            </div>
            <div className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#F1F5F9]">
              <p className="text-[12px] text-[#6B7280] font-medium">Clock In</p>
              <p className="text-[18px] font-bold text-[#111827] mt-1">
                {formatTime(todayRecord?.clock_in)}
              </p>
            </div>
            <div className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#F1F5F9]">
              <p className="text-[12px] text-[#6B7280] font-medium">Clock Out</p>
              <p className="text-[18px] font-bold text-[#111827] mt-1">
                {formatTime(todayRecord?.clock_out)}
              </p>
            </div>
            <div className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#F1F5F9]">
              <p className="text-[12px] text-[#6B7280] font-medium">Working Hours / Late</p>
              <p className="text-[18px] font-bold text-[#2563EB] mt-1">
                {Number(todayRecord?.working_hours || 0).toFixed(2)}h
                <span className="text-[12px] font-medium text-[#6B7280] ml-2">
                  ({todayRecord?.late_minutes || 0}m late)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleClockIn}
              disabled={Boolean(todayRecord?.clock_in)}
              loading={actionLoading}
            >
              <LogIn className="w-4 h-4" />
              Clock In
            </Button>
            <Button
              variant="danger"
              onClick={handleClockOut}
              disabled={!todayRecord?.clock_in || Boolean(todayRecord?.clock_out)}
              loading={actionLoading}
            >
              <LogOut className="w-4 h-4" />
              Clock Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Monthly Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Present', val: monthlySummary.present, cls: 'text-[#10B981]' },
          { label: 'Late', val: monthlySummary.late, cls: 'text-[#F59E0B]' },
          { label: 'Half Day', val: monthlySummary.halfDay, cls: 'text-[#0EA5E9]' },
          { label: 'Absent', val: monthlySummary.absent, cls: 'text-[#EF4444]' },
          { label: 'On Leave', val: monthlySummary.onLeave, cls: 'text-[#2563EB]' },
          { label: 'Total Hours', val: `${monthlySummary.totalWorkingHours}h`, cls: 'text-[#111827]' },
        ].map((item) => (
          <Card key={item.label} className="p-4 text-center">
            <p className="text-[12px] font-semibold text-[#6B7280] uppercase">{item.label}</p>
            <p className={`text-[24px] font-bold mt-1 ${item.cls}`}>{item.val}</p>
          </Card>
        ))}
      </div>

      {/* Monthly Attendance Calendar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold text-[#111827] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#2563EB]" /> Monthly Attendance Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-[10px] border border-[#E5E7EB] hover:bg-[#F8FAFC]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[14px] font-semibold text-[#111827] min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-[10px] border border-[#E5E7EB] hover:bg-[#F8FAFC]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-[12px] font-semibold text-[#6B7280] py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-[12px] bg-[#F8FAFC]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const rec = recordByDate.get(dateStr);
            const cellStyle = rec
              ? rec.status === 'Present'
                ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                : rec.status === 'Late'
                ? 'bg-[#FFF7ED] border-[#FDE68A]'
                : rec.status === 'On Leave'
                ? 'bg-[#E0F2FE] border-[#BAE6FD]'
                : rec.status === 'Absent'
                ? 'bg-[#FEF2F2] border-[#FECACA]'
                : 'bg-[#F8FAFC] border-[#E5E7EB]'
              : 'bg-white border-[#F1F5F9]';

            return (
              <div
                key={dateStr}
                className={`h-20 p-2 rounded-[12px] border flex flex-col justify-between text-left ${cellStyle}`}
              >
                <span className="text-[13px] font-bold text-[#111827]">{day}</span>
                {rec && (
                  <div>
                    <p className="text-[11px] font-semibold truncate text-[#374151]">{rec.status}</p>
                    <p className="text-[10px] text-[#6B7280]">
                      {Number(rec.working_hours || 0).toFixed(1)}h
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Attendance History Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-[#111827]">Attendance History</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="gw-input w-auto min-w-[160px]"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-7 h-7" />}
            title="No Attendance Records Found"
            description="Clock in to start tracking your daily attendance history."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="gw-table-th px-6 py-3.5">Date</th>
                  <th className="gw-table-th px-6 py-3.5">Login Time</th>
                  <th className="gw-table-th px-6 py-3.5">Logout Time</th>
                  <th className="gw-table-th px-6 py-3.5">Working Hours</th>
                  <th className="gw-table-th px-6 py-3.5">Late (Min)</th>
                  <th className="gw-table-th px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {history.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="px-6 py-4 font-semibold text-[#111827]">{r.date}</td>
                    <td className="px-6 py-4 text-[#374151]">{formatTime(r.clock_in)}</td>
                    <td className="px-6 py-4 text-[#374151]">{formatTime(r.clock_out)}</td>
                    <td className="px-6 py-4 font-medium text-[#2563EB]">
                      {Number(r.working_hours || 0).toFixed(2)} hrs
                    </td>
                    <td className="px-6 py-4 text-[#6B7280]">{r.late_minutes || 0} min</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.status} />
                        {r.is_corrected && (
                          <span className="text-[11px] font-semibold text-[#0EA5E9]">Corrected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageTransition>
  );
};

export default EmployeeAttendancePage;
