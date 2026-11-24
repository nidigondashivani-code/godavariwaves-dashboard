import React, { useEffect, useState, useCallback } from 'react';
import { History, Search, Eye } from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import {
  PageTransition,
  Card,
  StatusBadge,
  Modal,
  Button,
  LoadingSpinner,
  EmptyState,
} from '../../../components/common/UI';

type SectionKey =
  | 'attendance'
  | 'leaves'
  | 'tasks'
  | 'workUpdates'
  | 'performanceReviews'
  | 'profileUpdates'
  | 'attendanceCorrections';

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'leaves', label: 'Leaves' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'workUpdates', label: 'Work Updates' },
  { key: 'performanceReviews', label: 'Performance' },
  { key: 'profileUpdates', label: 'Profile Updates' },
  { key: 'attendanceCorrections', label: 'Corrections' },
];

export const EmployeeHistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionKey>('attendance');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Record<string, { items: Record<string, unknown>[]; total: number; totalPages: number }>>({});
  const [loading, setLoading] = useState(true);
  const [detailRecord, setDetailRecord] = useState<Record<string, unknown> | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search.trim()) params.set('search', search.trim());
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await apiClient.get(`/history/me?${params.toString()}`);
      setData(res.data.data || {});
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, startDate, endDate, showToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const currentBucket = data[activeSection] || { items: [], total: 0, totalPages: 1 };

  const renderSummaryLine = (row: Record<string, unknown>) => {
    if (activeSection === 'attendance') {
      return {
        primary: `Date: ${row.date}`,
        secondary: `Working Hours: ${row.working_hours || 0}h · Late: ${row.late_minutes || 0}m`,
        status: String(row.status || ''),
      };
    }
    if (activeSection === 'leaves') {
      const lt = row.leaveType as { name?: string } | undefined;
      return {
        primary: `${lt?.name || 'Leave'} (${row.start_date} → ${row.end_date})`,
        secondary: `${row.total_days} day(s) · ${row.reason}`,
        status: String(row.status || ''),
      };
    }
    if (activeSection === 'tasks') {
      return {
        primary: String(row.title || ''),
        secondary: `Due: ${row.due_date} · Priority: ${row.priority} · Progress: ${row.progress}%`,
        status: String(row.status || ''),
      };
    }
    if (activeSection === 'workUpdates') {
      return {
        primary: `Work Report — ${row.work_date}`,
        secondary: `${String(row.work_description || '').slice(0, 90)}`,
        status: String(row.status || ''),
      };
    }
    if (activeSection === 'performanceReviews') {
      return {
        primary: `Review Period: ${row.review_period}`,
        secondary: `Rating: ${row.rating}/5 · Date: ${row.review_date}`,
        status: String(row.status || ''),
      };
    }
    if (activeSection === 'profileUpdates') {
      return {
        primary: `Field: ${row.field_name}`,
        secondary: `${row.current_value} → ${row.requested_value}`,
        status: String(row.status || ''),
      };
    }
    return {
      primary: `Correction for ${row.attendance_date}`,
      secondary: `Requested: ${row.requested_login_time} - ${row.requested_logout_time}`,
      status: String(row.status || ''),
    };
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">Employee History</h1>
        <p className="text-[14px] text-[#6B7280]">
          Consolidated record archive across attendance, leaves, tasks, work updates, performance, and profile changes.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setActiveSection(s.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-[12px] text-[13px] font-semibold border transition ${
              activeSection === s.key
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#BFDBFE]'
            }`}
          >
            {s.label} ({data[s.key]?.total ?? 0})
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search records..."
            className="gw-input pl-9 rounded-[14px]"
          />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          className="gw-input w-auto"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="gw-input w-auto"
        />
        {(search || startDate || endDate) && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSearch('');
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </Card>

      {/* Records List */}
      <Card className="overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading historical records..." />
        ) : currentBucket.items.length === 0 ? (
          <EmptyState
            icon={<History className="w-7 h-7" />}
            title="No Historical Records Found"
            description="No records matched your current section and filter criteria."
          />
        ) : (
          <>
            <div className="divide-y divide-[#F1F5F9]">
              {currentBucket.items.map((row, i) => {
                const info = renderSummaryLine(row);
                return (
                  <div
                    key={String(row.id || i)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition"
                  >
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827]">{info.primary}</p>
                      <p className="text-[13px] text-[#6B7280] mt-0.5">{info.secondary}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {info.status && <StatusBadge status={info.status} />}
                      <Button size="sm" variant="secondary" onClick={() => setDetailRecord(row)}>
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentBucket.totalPages > 1 && (
              <div className="p-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <p className="text-[13px] text-[#6B7280]">
                  Page {page} of {currentBucket.totalPages} ({currentBucket.total} records)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page >= currentBucket.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={Boolean(detailRecord)}
        onClose={() => setDetailRecord(null)}
        title="Record Details"
      >
        {detailRecord && (
          <div className="space-y-2.5 text-[13px]">
            {Object.entries(detailRecord)
              .filter(([k]) => !['employee_id', 'user_id'].includes(k))
              .map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 py-2 border-b border-[#F1F5F9]"
                >
                  <span className="font-semibold text-[#6B7280] capitalize">
                    {k.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[#111827] text-right break-all">
                    {typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '-')}
                  </span>
                </div>
              ))}
          </div>
        )}
      </Modal>
    </PageTransition>
  );
};

export default EmployeeHistoryPage;
