import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Paperclip,
  Check,
  Download,
  AlertCircle,
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { LeaveRequest, LeaveBalance } from '../types/leave.types';
import leaveService from '../services/leave.service';
import LeaveStatusBadge from './LeaveStatusBadge';

interface LeaveDetailsDrawerProps {
  isOpen: boolean;
  request: LeaveRequest | null;
  onClose: () => void;
  onApprove: (request: LeaveRequest) => void;
  onReject: (request: LeaveRequest) => void;
}

export const LeaveDetailsDrawer: React.FC<LeaveDetailsDrawerProps> = ({
  isOpen,
  request,
  onClose,
  onApprove,
  onReject,
}) => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [history, setHistory] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    if (request) {
      const b = leaveService.getEmployeeLeaveBalance(request.employeeId);
      const h = leaveService.getEmployeeLeaveHistory(request.employeeId);
      setBalance(b);
      setHistory(h.filter((item) => item.id !== request.id));
    } else {
      setBalance(null);
      setHistory([]);
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const isPending = request.status === 'Pending';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slideLeft">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {request.id}
                </span>
                <LeaveStatusBadge status={request.status} size="sm" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                Leave Request Details
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            {/* 1. Employee Information */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 ring-2 ring-blue-500/20 shrink-0">
                  {request.employeePhoto ? (
                    <img
                      src={request.employeePhoto}
                      alt={request.employeeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                      {request.employeeName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {request.employeeName}
                  </h3>
                  <p className="text-[11px] text-blue-700 font-semibold font-mono">
                    {request.employeeId}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {request.designation} • {request.department}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{request.companyEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{request.mobileNumber}</span>
                </div>
              </div>
            </div>

            {/* 2. Leave Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Leave Application Details</span>
              </h4>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      Leave Type
                    </span>
                    <span className="font-bold text-slate-900 text-xs px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-200 inline-block">
                      {request.leaveType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      Duration
                    </span>
                    <span className="font-black text-slate-900 text-xs">
                      {request.totalDays} Day(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      From Date
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {request.startDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      To Date
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {request.endDate}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Applied On
                  </span>
                  <p className="font-mono text-slate-600 text-xs">
                    {request.appliedDate}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Reason for Leave
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 leading-relaxed">
                    {request.reason}
                  </div>
                </div>

                {/* Attachment Section */}
                {request.attachment && (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Uploaded Attachment
                    </span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {request.attachment.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({request.attachment.size})
                        </span>
                      </div>
                      <a
                        href={request.attachment.url}
                        download={request.attachment.name}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Simulating secure download of ${request.attachment?.name}`);
                        }}
                        className="p-1 text-slate-600 hover:text-blue-600 transition"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Audit & Decision Info */}
                {request.status === 'Approved' && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Approved by {request.approvedBy || 'Admin User'}</span>
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Approved at {request.approvedAt || 'Recorded'} • Attendance status synced to <strong>On Leave</strong>.
                    </p>
                    {request.isOverridden && (
                      <p className="text-[10px] text-purple-700 font-semibold pt-1">
                        * {request.overrideReason || 'Administrative team overlap override authorized.'}
                      </p>
                    )}
                  </div>
                )}

                {request.status === 'Rejected' && (
                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-xs">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Rejected by {request.rejectedBy || 'Admin User'}</span>
                    </p>
                    <p className="text-[11px] text-rose-800 font-medium">
                      <strong>Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Leave Balances */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Leave Balances & Limits</span>
              </h4>

              {balance ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Casual Leave Card */}
                  <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-900 text-xs">
                        Casual Leave
                      </span>
                      <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                        Max 1/month
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-slate-500 text-[11px]">This Month Used:</span>
                      <span className="font-bold text-slate-800">
                        {balance.casualLeaveUsedThisMonth} / 1
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500 text-[11px]">Remaining:</span>
                      <span className="font-black text-sky-800">
                        {balance.casualLeaveRemainingThisMonth} day
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-sky-200/60 text-[10px] text-slate-400">
                      Annual: {balance.casualLeaveAnnualUsed} / {balance.casualLeaveAnnualTotal} used
                    </div>
                  </div>

                  {/* Sick Leave Card */}
                  <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 text-xs">
                        Sick Leave
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Max 2/month
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-slate-500 text-[11px]">This Month Used:</span>
                      <span className="font-bold text-slate-800">
                        {balance.sickLeaveUsedThisMonth} / 2
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500 text-[11px]">Remaining:</span>
                      <span className="font-black text-amber-800">
                        {balance.sickLeaveRemainingThisMonth} days
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-amber-200/60 text-[10px] text-slate-400">
                      Annual: {balance.sickLeaveAnnualUsed} / {balance.sickLeaveAnnualTotal} used
                    </div>
                  </div>

                  {/* Emergency Leave History & Rules */}
                  <div className="sm:col-span-2 bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-xs">
                        Emergency Leave
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        Admin Approval Mandatory
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Annual emergency leaves taken:{' '}
                      <strong>{balance.emergencyLeaveAnnualUsed}</strong>
                    </p>
                    {balance.emergencyLeaveHistory.length > 0 && (
                      <div className="pt-1 text-[11px] text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-700">Past Emergency Records:</span>
                        {balance.emergencyLeaveHistory.map((emg) => (
                          <div
                            key={emg.id}
                            className="bg-white/80 p-2 rounded-lg border border-rose-100 flex items-center justify-between"
                          >
                            <span>
                              {emg.date} ({emg.totalDays}d) - {emg.reason}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              by {emg.approvedBy}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 4. Previous Leave History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                <span>Employee Leave History</span>
              </h4>

              {history.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                  No other leave history recorded for this employee.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">
                            {hist.leaveType}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({hist.totalDays}d)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {hist.startDate} to {hist.endDate}
                        </p>
                      </div>
                      <LeaveStatusBadge status={hist.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Direct Action Footer */}
          {isPending && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                Pending Administrator Action
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onReject(request)}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(request)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailsDrawer;
