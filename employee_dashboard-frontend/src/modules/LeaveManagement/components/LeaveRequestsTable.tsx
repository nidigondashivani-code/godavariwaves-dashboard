import React, { useState, useMemo } from 'react';
import {
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Paperclip,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { LeaveRequest } from '../types/leave.types';
import LeaveStatusBadge from './LeaveStatusBadge';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  onViewDetails: (request: LeaveRequest) => void;
  onApprove: (request: LeaveRequest) => void;
  onReject: (request: LeaveRequest) => void;
}

type SortField = 'appliedDate' | 'startDate' | 'totalDays' | 'employeeName' | 'status';

export const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  requests,
  onViewDetails,
  onApprove,
  onReject,
}) => {
  const [sortField, setSortField] = useState<SortField>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'appliedDate':
          comparison = a.appliedDate.localeCompare(b.appliedDate);
          break;
        case 'startDate':
          comparison = a.startDate.localeCompare(b.startDate);
          break;
        case 'totalDays':
          comparison = a.totalDays - b.totalDays;
          break;
        case 'employeeName':
          comparison = a.employeeName.localeCompare(b.employeeName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [requests, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRequests.slice(start, start + pageSize);
  }, [sortedRequests, currentPage, pageSize]);

  const getLeaveTypePill = (type: string) => {
    switch (type) {
      case 'Casual Leave':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Sick Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Emergency Leave':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          No Leave Requests Found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No leave requests match the selected filters or search parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* 1. Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department & Designation</th>
              <th className="py-3 px-4">Leave Type</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('startDate')}
              >
                <div className="flex items-center gap-1">
                  <span>Leave Dates</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('totalDays')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Days</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('appliedDate')}
              >
                <div className="flex items-center gap-1">
                  <span>Applied</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Approved By</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedRequests.map((req) => {
              const isPending = req.status === 'Pending';

              return (
                <tr
                  key={req.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Employee Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-200 shrink-0">
                        {req.employeePhoto ? (
                          <img
                            src={req.employeePhoto}
                            alt={req.employeeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-xs">
                            {req.employeeName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {req.employeeName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {req.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department & Designation */}
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-700">{req.department}</p>
                    <p className="text-[11px] text-slate-400">{req.designation}</p>
                  </td>

                  {/* Leave Type */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] border ${getLeaveTypePill(
                          req.leaveType
                        )}`}
                      >
                        {req.leaveType}
                      </span>
                      {req.attachment && (
                        <span title="Attachment available" className="text-slate-400">
                          <Paperclip className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Leave Dates */}
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">
                      {req.startDate} to {req.endDate}
                    </p>
                  </td>

                  {/* Total Days */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-black text-slate-800 px-2 py-0.5 bg-slate-100 rounded-lg text-xs">
                      {req.totalDays}d
                    </span>
                  </td>

                  {/* Applied Date */}
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {req.appliedDate}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <LeaveStatusBadge status={req.status} size="sm" />
                    {req.isOverridden && (
                      <span
                        className="block mt-0.5 text-[9px] font-bold text-purple-600 flex items-center gap-0.5"
                        title="Approved with Administrator Override"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Override
                      </span>
                    )}
                  </td>

                  {/* Approved By */}
                  <td className="py-3 px-4">
                    {req.status === 'Approved' ? (
                      <span className="text-emerald-700 font-medium text-[11px]">
                        {req.approvedBy || 'Admin User'}
                      </span>
                    ) : req.status === 'Rejected' ? (
                      <span className="text-rose-700 font-medium text-[11px]">
                        {req.rejectedBy || 'Admin User'}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Drawer Button */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(req)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Full Leave Details & Balances"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Quick Approve Button */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onApprove(req)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Approve Leave Request"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {/* Quick Reject Button */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onReject(req)}
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Reject Leave Request"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Responsive Card List (Under 1024px) */}
      <div className="block lg:hidden divide-y divide-slate-100">
        {paginatedRequests.map((req) => (
          <div key={req.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-200 shrink-0">
                  {req.employeePhoto ? (
                    <img
                      src={req.employeePhoto}
                      alt={req.employeeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-xs">
                      {req.employeeName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {req.employeeName}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {req.employeeId} • {req.department}
                  </p>
                </div>
              </div>
              <LeaveStatusBadge status={req.status} size="sm" />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Type:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] border ${getLeaveTypePill(
                    req.leaveType
                  )}`}
                >
                  {req.leaveType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Duration:</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {req.startDate} to {req.endDate} ({req.totalDays}d)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Applied Date:</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  {req.appliedDate}
                </span>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => onViewDetails(req)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
              {req.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => onApprove(req)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition inline-flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(req)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition inline-flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Pagination Footer */}
      <div className="py-3 px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedRequests.length)} of{' '}
            {sortedRequests.length} requests
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-bold text-slate-800">
            {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestsTable;
