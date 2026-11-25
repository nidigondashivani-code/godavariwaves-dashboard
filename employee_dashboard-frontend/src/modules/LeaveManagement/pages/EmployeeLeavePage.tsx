import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  AlertTriangle,
  Paperclip,
  XCircle,
  Info,
} from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import { getAssetUrl } from '../../../config/env.config';
import {
  PageTransition,
  Card,
  Button,
  StatusBadge,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '../../../components/common/UI';
import { LeaveBalanceItem, LeaveRequestItem, LeaveTypeItem } from '../../../types/user.types';

export const EmployeeLeavePage: React.FC = () => {
  const { showToast } = useToast();
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeItem[]>([]);
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [loading, setLoading] = useState(true);

  const [applyOpen, setApplyOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<{
    totalDays: number;
    excludedHolidays: Array<{ date: string; name: string }>;
    excludedWeekends: string[];
    teamCheck: { hasConflict: boolean; conflicts: Array<{ reason: string }> };
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [balRes, typeRes, reqRes] = await Promise.all([
        apiClient.get('/leaves/balances/me'),
        apiClient.get('/leaves/types'),
        apiClient.get('/leaves/me'),
      ]);
      setBalances(balRes.data.data || []);
      const types = typeRes.data.data || [];
      setLeaveTypes(types);
      if (types.length > 0 && !leaveTypeId) setLeaveTypeId(types[0].id);
      setRequests(reqRes.data.data || []);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [leaveTypeId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live preview of working days, holidays, weekends, and team leave conflicts
  useEffect(() => {
    if (!startDate || !endDate || endDate < startDate) {
      setPreview(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get(
          `/leaves/preview-duration?start_date=${startDate}&end_date=${endDate}`
        );
        setPreview(res.data.data);
      } catch {
        setPreview(null);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate || !reason.trim()) {
      showToast('Please fill all required leave fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('leave_type_id', String(leaveTypeId));
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('reason', reason.trim());
      if (attachment) formData.append('attachment', attachment);

      await apiClient.post('/leaves/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Leave application submitted successfully!', 'success');
      setApplyOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setAttachment(null);
      setPreview(null);
      await loadData();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = useCallback(
    async (id: number) => {
      try {
        await apiClient.patch(`/leaves/${id}/cancel`);
        showToast('Pending leave request cancelled.', 'info');
        await loadData();
      } catch (err) {
        showToast(extractApiError(err), 'error');
      }
    },
    [loadData, showToast]
  );

  const filteredRequests = useMemo(
    () => (activeTab === 'All' ? requests : requests.filter((r) => r.status === activeTab)),
    [activeTab, requests]
  );

  if (loading) return <LoadingSpinner label="Loading leave balances & history..." />;

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">Leave Management</h1>
          <p className="text-[14px] text-[#6B7280]">
            View your leave balances, apply for leave with holiday & team conflict checks, and track approvals.
          </p>
        </div>
        <Button onClick={() => setApplyOpen(true)}>
          <Plus className="w-4 h-4" />
          Apply Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {balances.map((b) => {
          const pct = b.allocated_days > 0 ? Math.min(100, (Number(b.remaining_days) / Number(b.allocated_days)) * 100) : 0;
          return (
            <Card key={b.id} hoverable className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E3A8A]">
                    {b.leaveType?.code}
                  </span>
                  <h3 className="text-[18px] font-semibold text-[#111827] mt-2">
                    {b.leaveType?.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[28px] font-bold text-[#2563EB] leading-none">
                    {b.remaining_days}
                  </p>
                  <p className="text-[12px] text-[#6B7280] mt-1">Days Left</p>
                </div>
              </div>
              <div className="mt-4 bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>Allocated: {b.allocated_days}</span>
                <span>Used: {b.used_days}</span>
                <span>Pending: {b.pending_days}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Leave History with Tabs */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-[#111827]">Leave Applications</h2>
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-[12px] border border-[#E5E7EB]">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold transition ${
                  activeTab === tab
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="w-7 h-7" />}
            title="No Leave Requests"
            description="Click 'Apply Leave' to submit a new leave request."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="gw-table-th px-6 py-3.5">Leave Type</th>
                  <th className="gw-table-th px-6 py-3.5">Date Range</th>
                  <th className="gw-table-th px-6 py-3.5">Duration</th>
                  <th className="gw-table-th px-6 py-3.5">Reason & Notes</th>
                  <th className="gw-table-th px-6 py-3.5">Status</th>
                  <th className="gw-table-th px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="px-6 py-4 font-semibold text-[#111827]">
                      {req.leaveType?.name || 'Leave'}
                    </td>
                    <td className="px-6 py-4 text-[#374151] whitespace-nowrap">
                      {req.start_date} → {req.end_date}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#2563EB]">
                      {req.total_days} day(s)
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-[13px] text-[#374151]">{req.reason}</p>
                      {req.attachment_url && (
                        <a
                          href={getAssetUrl(req.attachment_url) || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-[#2563EB] hover:underline mt-1"
                        >
                          <Paperclip className="w-3.5 h-3.5" /> Attachment
                        </a>
                      )}
                      {req.rejection_reason && (
                        <p className="text-[12px] text-[#DC2626] mt-1">
                          <strong>Rejected:</strong> {req.rejection_reason}
                        </p>
                      )}
                      {req.has_team_conflict && (
                        <p className="text-[12px] text-[#D97706] mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Team overlap flagged for review
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#EF4444] hover:underline"
                        >
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply for Leave"
        subtitle="Leave balance is deducted only after Admin approval."
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
              Leave Type
            </label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(Number(e.target.value))}
              className="gw-input"
              required
            >
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="gw-input"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="gw-input"
              />
            </div>
          </div>

          {preview && (
            <div className="space-y-2">
              <div className="p-3.5 rounded-[12px] bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-[13px] flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Calculated Working Days: {preview.totalDays} day(s)
                  </p>
                  {preview.excludedWeekends.length > 0 && (
                    <p className="text-[12px] mt-0.5">
                      Weekends excluded: {preview.excludedWeekends.length} day(s)
                    </p>
                  )}
                  {preview.excludedHolidays.length > 0 && (
                    <p className="text-[12px] mt-0.5">
                      Company holidays excluded:{' '}
                      {preview.excludedHolidays.map((h) => `${h.name} (${h.date})`).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              {preview.teamCheck?.hasConflict && (
                <div className="p-3.5 rounded-[12px] bg-[#FFF7ED] border border-[#FDE68A] text-[#B45309] text-[13px] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Team Availability Notice</p>
                    <p className="text-[12px] mt-0.5">
                      {preview.teamCheck.conflicts[0]?.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Reason</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a brief reason for your leave..."
              className="gw-input"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
              Supporting Attachment (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="gw-input text-[13px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="secondary" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit Leave Application
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
};

export default EmployeeLeavePage;
