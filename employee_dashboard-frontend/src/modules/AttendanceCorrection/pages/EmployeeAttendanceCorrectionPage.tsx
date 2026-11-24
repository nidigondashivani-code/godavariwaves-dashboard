import React, { useEffect, useState, useCallback } from 'react';
import { FileEdit, Send, AlertCircle } from 'lucide-react';
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
import { AttendanceCorrectionRecord, AttendanceRecord } from '../../../types/user.types';

export const EmployeeAttendanceCorrectionPage: React.FC = () => {
  const { showToast } = useToast();
  const [corrections, setCorrections] = useState<AttendanceCorrectionRecord[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedLogin, setRequestedLogin] = useState('09:30');
  const [requestedLogout, setRequestedLogout] = useState('18:30');
  const [reason, setReason] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [corrRes, histRes] = await Promise.all([
        apiClient.get('/attendance-corrections/me'),
        apiClient.get('/attendance/history?limit=60'),
      ]);
      setCorrections(corrRes.data.data || []);
      setAttendanceHistory(histRes.data.data.records || []);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const existingRecord = attendanceHistory.find((r) => r.date === attendanceDate);
  const formatHHMM = (iso?: string | null) =>
    iso ? new Date(iso).toTimeString().slice(0, 5) : 'Not Recorded';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please enter a valid reason for the correction.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/attendance-corrections', {
        attendance_date: attendanceDate,
        requested_login_time: requestedLogin,
        requested_logout_time: requestedLogout,
        reason: reason.trim(),
      });
      showToast('Attendance correction request submitted for Admin review.', 'success');
      setReason('');
      await loadData();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading correction requests..." />;

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">
          Attendance Correction
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Request corrections for missed clock-ins, clock-outs, or timing discrepancies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request Form */}
        <Card className="p-6 lg:col-span-5">
          <h2 className="text-[18px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-[#2563EB]" /> New Correction Request
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Attendance Date
              </label>
              <input
                type="date"
                required
                value={attendanceDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="gw-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#F1F5F9]">
              <div>
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase">Existing Login</p>
                <p className="text-[14px] font-bold text-[#111827] mt-0.5">
                  {formatHHMM(existingRecord?.clock_in)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase">Existing Logout</p>
                <p className="text-[14px] font-bold text-[#111827] mt-0.5">
                  {formatHHMM(existingRecord?.clock_out)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Requested Login Time
                </label>
                <input
                  type="time"
                  required
                  value={requestedLogin}
                  onChange={(e) => setRequestedLogin(e.target.value)}
                  className="gw-input"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Requested Logout Time
                </label>
                <input
                  type="time"
                  required
                  value={requestedLogout}
                  onChange={(e) => setRequestedLogout(e.target.value)}
                  className="gw-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Reason for Correction
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the attendance timing needs correction..."
                className="gw-input"
              />
            </div>

            <Button type="submit" loading={submitting} className="w-full">
              <Send className="w-4 h-4" />
              Submit Correction Request
            </Button>
          </form>
        </Card>

        {/* Correction History */}
        <Card className="lg:col-span-7 overflow-hidden">
          <div className="p-6 border-b border-[#F1F5F9]">
            <h2 className="text-[18px] font-semibold text-[#111827]">Correction History</h2>
          </div>
          {corrections.length === 0 ? (
            <EmptyState
              icon={<FileEdit className="w-7 h-7" />}
              title="No Correction Requests"
              description="Submitted attendance correction requests and their approval statuses will appear here."
            />
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {corrections.map((c) => (
                <div key={c.id} className="p-5 hover:bg-[#F8FAFC] transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827]">
                        Date: {c.attendance_date}
                      </p>
                      <p className="text-[13px] text-[#6B7280] mt-0.5">
                        Existing: <span className="font-medium">{c.existing_login_time} - {c.existing_logout_time}</span>
                        {' → '}
                        Requested:{' '}
                        <span className="font-semibold text-[#2563EB]">
                          {c.requested_login_time} - {c.requested_logout_time}
                        </span>
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-[13px] text-[#374151] mt-2">{c.reason}</p>
                  {c.status === 'Rejected' && c.rejection_reason && (
                    <div className="mt-3 p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[12px] text-[#DC2626] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Rejection Reason:</strong> {c.rejection_reason}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
};

export default EmployeeAttendanceCorrectionPage;
