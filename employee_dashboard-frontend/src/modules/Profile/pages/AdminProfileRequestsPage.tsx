import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  RotateCw,
  Search,
  User,
  UserCheck,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import profileService, { getFieldDisplayName } from '../services/profile.service';
import type { ProfileRequestStatus, ProfileUpdateRequest } from '../types/profile.types';
import { getAssetUrl } from '../../../config/env.config';

const statusBadgeStyles: Record<ProfileRequestStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

function AdminProfileRequestsPage() {
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProfileRequestStatus | 'All'>('All');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<ProfileUpdateRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Approval confirmation modal state
  const [approvingItem, setApprovingItem] = useState<ProfileUpdateRequest | null>(null);

  const fetchRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await profileService.getAdminProfileRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load profile requests', err);
      setFeedback({
        message: 'Unable to load profile update requests. Please check backend connection.',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const handleApprove = async () => {
    if (!approvingItem) return;
    setSubmittingAction(true);
    try {
      await profileService.approveRequest(approvingItem.id);
      showToast(
        `Approved profile update for ${approvingItem.employee?.full_name || 'Employee'}. The employee profile has been updated.`,
        'success'
      );
      setApprovingItem(null);
      await fetchRequests(true);
    } catch (err: any) {
      console.error('Approval failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to approve request';
      showToast(msg, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingItem) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection.', 'error');
      return;
    }
    setSubmittingAction(true);
    try {
      await profileService.rejectRequest(rejectingItem.id, rejectionReason.trim());
      showToast(
        `Rejected profile update request for ${rejectingItem.employee?.full_name || 'Employee'}.`,
        'success'
      );
      setRejectingItem(null);
      setRejectionReason('');
      await fetchRequests(true);
    } catch (err: any) {
      console.error('Rejection failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to reject request';
      showToast(msg, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const counts = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;
      const empName = r.employee?.full_name?.toLowerCase() || '';
      const empCode = r.employee?.employee_code?.toLowerCase() || '';
      const dept = r.employee?.department?.name?.toLowerCase() || '';
      const field = getFieldDisplayName(r.field_name).toLowerCase();
      const reason = r.reason?.toLowerCase() || '';
      const requestedVal = r.requested_value?.toLowerCase() || '';

      return (
        empName.includes(query) ||
        empCode.includes(query) ||
        dept.includes(query) ||
        field.includes(query) ||
        reason.includes(query) ||
        requestedVal.includes(query)
      );
    });
  }, [requests, searchQuery, statusFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast / Notification Banner */}
        {feedback && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                : 'bg-rose-600 text-white shadow-rose-900/20'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
            <button
              className="ml-2 rounded p-0.5 hover:bg-white/20"
              onClick={() => setFeedback(null)}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-700">
              Employee Management · Approvals
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Profile Update Requests
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Review and approve or reject profile change requests submitted by employees.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={refreshing || loading}
              onClick={() => fetchRequests(true)}
              type="button"
            >
              <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            className={`flex items-start justify-between rounded-2xl border p-4 text-left transition ${
              statusFilter === 'All'
                ? 'border-blue-300 bg-blue-50/50 shadow-sm ring-1 ring-blue-300'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
            }`}
            onClick={() => setStatusFilter('All')}
            type="button"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500">Total Requests</p>
              <p className="mt-1.5 text-2xl font-bold text-slate-900">{counts.total}</p>
              <p className="mt-1 text-[11px] text-blue-700 font-medium">All submissions</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </span>
          </button>

          <button
            className={`flex items-start justify-between rounded-2xl border p-4 text-left transition ${
              statusFilter === 'Pending'
                ? 'border-amber-300 bg-amber-50/50 shadow-sm ring-1 ring-amber-300'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
            }`}
            onClick={() => setStatusFilter('Pending')}
            type="button"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500">Pending Review</p>
              <p className="mt-1.5 text-2xl font-bold text-amber-700">{counts.pending}</p>
              <p className="mt-1 text-[11px] text-amber-600 font-medium">Needs Admin action</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
          </button>

          <button
            className={`flex items-start justify-between rounded-2xl border p-4 text-left transition ${
              statusFilter === 'Approved'
                ? 'border-emerald-300 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-300'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
            }`}
            onClick={() => setStatusFilter('Approved')}
            type="button"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500">Approved</p>
              <p className="mt-1.5 text-2xl font-bold text-emerald-700">{counts.approved}</p>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">Profile updated</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </button>

          <button
            className={`flex items-start justify-between rounded-2xl border p-4 text-left transition ${
              statusFilter === 'Rejected'
                ? 'border-rose-300 bg-rose-50/50 shadow-sm ring-1 ring-rose-300'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
            }`}
            onClick={() => setStatusFilter('Rejected')}
            type="button"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500">Rejected</p>
              <p className="mt-1.5 text-2xl font-bold text-rose-700">{counts.rejected}</p>
              <p className="mt-1 text-[11px] text-rose-600 font-medium">Declined changes</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </span>
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee name, ID, field, or reason..."
              type="text"
              value={searchQuery}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mr-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
              <button
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                key={status}
                onClick={() => setStatusFilter(status)}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                key={idx}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/4 rounded bg-slate-200" />
                    <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UserCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              {statusFilter !== 'All'
                ? `No ${statusFilter.toLowerCase()} profile requests found`
                : 'No profile update requests submitted yet'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'When employees request profile modifications, they will appear here for your review.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Field</th>
                    <th className="px-5 py-3.5">Change Requested</th>
                    <th className="px-5 py-3.5">Reason</th>
                    <th className="px-5 py-3.5">Submitted</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredRequests.map((req) => (
                    <tr className="hover:bg-slate-50/70 transition" key={req.id}>
                      {/* Employee Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {req.employee?.profile_picture ? (
                            <img
                              alt={req.employee.full_name}
                              className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
                              src={getAssetUrl(req.employee.profile_picture) || ''}
                            />
                          ) : (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {req.employee?.full_name
                                ? req.employee.full_name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()
                                : 'EM'}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900">
                              {req.employee?.full_name || `Employee #${req.employee_id}`}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {req.employee?.employee_code || `EMP-${req.employee_id}`} ·{' '}
                              {req.employee?.department?.name || 'General'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Field */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                          {getFieldDisplayName(req.field_name)}
                        </span>
                      </td>

                      {/* Change Comparison */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block max-w-[140px] truncate rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 line-through"
                            title={req.current_value || 'Not set'}
                          >
                            {req.current_value || 'Not set'}
                          </span>
                          <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                          <span
                            className="inline-block max-w-[160px] truncate rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200"
                            title={req.requested_value}
                          >
                            {req.requested_value}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="max-w-[220px] px-5 py-4">
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600" title={req.reason}>
                          &ldquo;{req.reason}&rdquo;
                        </p>
                        {req.rejection_reason && (
                          <p className="mt-1 text-[11px] text-rose-600 font-medium">
                            Rejection note: {req.rejection_reason}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDateTime(req.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                            statusBadgeStyles[req.status]
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                              onClick={() => setApprovingItem(req)}
                              title="Approve profile change"
                              type="button"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-95"
                              onClick={() => {
                                setRejectingItem(req);
                                setRejectionReason('');
                              }}
                              title="Reject profile change"
                              type="button"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : req.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
                            <XCircle className="h-3.5 w-3.5" /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approval Confirmation Modal */}
        {approvingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Approve Profile Update?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                You are approving the profile change for{' '}
                <strong className="text-slate-800">
                  {approvingItem.employee?.full_name || 'the employee'}
                </strong>
                .
              </p>
              <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <p className="text-[11px] font-semibold text-slate-500">
                  Field: {getFieldDisplayName(approvingItem.field_name)}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="line-through text-slate-500">
                    {approvingItem.current_value || 'Not set'}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="font-bold text-emerald-700">
                    {approvingItem.requested_value}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={submittingAction}
                  onClick={() => setApprovingItem(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  disabled={submittingAction}
                  onClick={handleApprove}
                  type="button"
                >
                  {submittingAction ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <span>Confirm Approval</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Reject Profile Update
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Please provide a reason for rejecting{' '}
                <strong className="text-slate-800">
                  {rejectingItem.employee?.full_name || 'the employee'}
                </strong>
                &apos;s request to update{' '}
                <strong className="text-slate-800">
                  {getFieldDisplayName(rejectingItem.field_name)}
                </strong>
                .
              </p>

              <div className="mt-4">
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="rejection-reason"
                >
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  id="rejection-reason"
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please provide official ID proof or contact HR directly."
                  rows={3}
                  value={rejectionReason}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={submittingAction}
                  onClick={() => {
                    setRejectingItem(null);
                    setRejectionReason('');
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                  disabled={submittingAction}
                  onClick={handleReject}
                  type="button"
                >
                  {submittingAction ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <span>Confirm Rejection</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminProfileRequestsPage;
