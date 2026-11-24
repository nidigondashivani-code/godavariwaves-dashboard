import React, { useState } from 'react';
import { X, XCircle, AlertCircle } from 'lucide-react';
import { LeaveRequest } from '../types/leave.types';

interface RejectLeaveModalProps {
  isOpen: boolean;
  request: LeaveRequest | null;
  onConfirmReject: (reason: string) => void;
  onClose: () => void;
}

export const RejectLeaveModal: React.FC<RejectLeaveModalProps> = ({
  isOpen,
  request,
  onConfirmReject,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Reason for rejection is required.');
      return;
    }
    setError('');
    onConfirmReject(reason.trim());
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-rose-100 bg-rose-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Reject Leave Request
              </h3>
              <p className="text-[11px] text-slate-500">
                {request.leaveType} • {request.employeeName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>
                <strong>Employee:</strong> {request.employeeName} ({request.employeeId})
              </p>
              <p>
                <strong>Requested Period:</strong> {request.startDate} to {request.endDate} ({request.totalDays} days)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="State the formal operational or administrative reason for rejecting this leave..."
                className={`w-full p-3 text-xs border rounded-xl focus:ring-2 focus:outline-none transition text-slate-800 ${
                  error
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              {error ? (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">
                  * This reason will be communicated directly to the employee via real-time notification.
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
            >
              Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectLeaveModal;
