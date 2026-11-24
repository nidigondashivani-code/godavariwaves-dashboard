import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  Users,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { LeaveRequest, TeamConflictCheckResult } from '../types/leave.types';

interface ApproveLeaveModalProps {
  isOpen: boolean;
  request: LeaveRequest | null;
  conflictResult: TeamConflictCheckResult | null;
  onConfirmApprove: (overrideConflict: boolean, overrideReason?: string) => void;
  onClose: () => void;
}

export const ApproveLeaveModal: React.FC<ApproveLeaveModalProps> = ({
  isOpen,
  request,
  conflictResult,
  onConfirmApprove,
  onClose,
}) => {
  const [overrideReason, setOverrideReason] = useState('');

  if (!isOpen || !request) return null;

  const hasConflict = conflictResult?.hasConflict;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            hasConflict
              ? 'bg-amber-50/80 border-amber-200'
              : 'bg-emerald-50/80 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                hasConflict
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {hasConflict ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {hasConflict ? 'Team Leave Conflict Detected' : 'Approve Leave Request'}
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

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Leave Request Brief */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Employee:</span>
              <span className="font-bold text-slate-800">
                {request.employeeName} ({request.employeeId})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-700">
                {request.department}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Requested Dates:</span>
              <span className="font-semibold text-slate-800">
                {request.startDate} to {request.endDate} ({request.totalDays} days)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Reason:</span>
              <span className="text-slate-700 truncate max-w-[260px]">
                {request.reason}
              </span>
            </div>
          </div>

          {/* Team Conflict Warning Box (If Conflict Detected) */}
          {hasConflict ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">
                      Another team member is already on leave during these dates. Approving this request may affect team operations.
                    </p>
                  </div>
                </div>

                {/* Conflicting Member(s) List */}
                <div className="mt-2 pt-2 border-t border-amber-200/60 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Approved Overlapping Team Member(s):
                  </p>
                  {conflictResult?.conflictingEmployees.map((conf) => (
                    <div
                      key={conf.employeeId}
                      className="flex items-center justify-between bg-white/80 p-2 rounded-lg border border-amber-200/60"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-amber-700" />
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">
                            {conf.employeeName} ({conf.designation})
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {conf.startDate} to {conf.endDate} • {conf.leaveType}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Approved
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Administrative Override Reason */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Administrative Override Justification (Optional)
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Critical project deadline shifted / Backup assigned"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  * Only users with the <strong>Admin</strong> role can override this operational restriction.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Are you sure you want to approve this leave request? The employee will be notified immediately and marked as <strong>On Leave</strong> in Attendance records.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>

          {hasConflict ? (
            <button
              type="button"
              onClick={() => onConfirmApprove(true, overrideReason)}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Override & Approve</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirmApprove(false)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproveLeaveModal;
