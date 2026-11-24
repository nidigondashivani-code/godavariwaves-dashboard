/**
 * Admin Leave Management Dashboard Page
 * Enterprise HRMS - Accessible exclusively to Admin role users.
 * Features 6 interactive summary cards, team leave conflict checking,
 * approval/rejection workflows, reports, and attendance integration.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  LeaveRequest,
  LeaveFilterOptions,
  SummaryCardFilterType,
  TeamConflictCheckResult,
} from '../types/leave.types';
import leaveService from '../services/leave.service';
import LeaveSummaryCards from '../components/LeaveSummaryCards';
import LeaveFilterBar from '../components/LeaveFilterBar';
import LeaveRequestsTable from '../components/LeaveRequestsTable';
import LeaveDetailsDrawer from '../components/LeaveDetailsDrawer';
import ApproveLeaveModal from '../components/ApproveLeaveModal';
import RejectLeaveModal from '../components/RejectLeaveModal';
import LeaveReportsModal from '../components/LeaveReportsModal';
import { exportLeaveToExcel, exportLeaveToPDF } from '../utils/leaveExport.utils';

interface ToastAlert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

const INITIAL_FILTERS: LeaveFilterOptions = {
  searchQuery: '',
  department: 'All Departments',
  designation: 'All Designations',
  leaveType: 'All Leave Types',
  status: 'All Statuses',
  startDate: '',
  endDate: '',
  cardFilter: 'all',
};

export const AdminLeaveManagementPage: React.FC = () => {
  // State
  const [requests, setRequests] = useState<LeaveRequest[]>(() =>
    leaveService.getLeaveRequests()
  );
  const [metrics, setMetrics] = useState(() => leaveService.getMetrics());
  const [filters, setFilters] = useState<LeaveFilterOptions>(INITIAL_FILTERS);

  // Modals & Drawers
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Approval modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<LeaveRequest | null>(null);
  const [conflictResult, setConflictResult] = useState<TeamConflictCheckResult | null>(null);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<LeaveRequest | null>(null);

  // Reports modal state
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const addToast = (type: ToastAlert['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = leaveService.subscribe((updatedRequests) => {
      setRequests(updatedRequests);
      setMetrics(leaveService.getMetrics());
    });
    return () => unsubscribe();
  }, []);

  // Filter logic
  const filteredRequests = useMemo(() => {
    const today = '2026-11-24';

    return requests.filter((req) => {
      // 1. Search filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = req.employeeName.toLowerCase().includes(q);
        const matchesId = req.employeeId.toLowerCase().includes(q);
        const matchesDept = req.department.toLowerCase().includes(q);
        const matchesDesig = req.designation.toLowerCase().includes(q);
        const matchesReason = req.reason.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDept && !matchesDesig && !matchesReason) {
          return false;
        }
      }

      // 2. Department filter
      if (filters.department !== 'All Departments' && req.department !== filters.department) {
        return false;
      }

      // 3. Leave type filter
      if (filters.leaveType !== 'All Leave Types' && req.leaveType !== filters.leaveType) {
        return false;
      }

      // 4. Status filter
      if (filters.status !== 'All Statuses' && req.status !== filters.status) {
        return false;
      }

      // 5. Date range filter
      if (filters.startDate && req.startDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && req.startDate > filters.endDate) {
        return false;
      }

      // 6. Interactive Card filter
      switch (filters.cardFilter) {
        case 'pending':
          return req.status === 'Pending';
        case 'approved':
          return req.status === 'Approved';
        case 'rejected':
          return req.status === 'Rejected';
        case 'today':
          return req.status === 'Approved' && req.startDate <= today && today <= req.endDate;
        case 'upcoming':
          return req.status !== 'Rejected' && req.startDate > today;
        case 'all':
        default:
          return true;
      }
    });
  }, [requests, filters]);

  // Handle Card Filter click (toggle or filter)
  const handleSelectCardFilter = (filterType: SummaryCardFilterType) => {
    setFilters((prev) => ({
      ...prev,
      cardFilter: prev.cardFilter === filterType ? 'all' : filterType,
    }));
  };

  // View Details Drawer
  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDetailsDrawerOpen(true);
  };

  // Approve Flow Initiation
  const handleInitiateApprove = (request: LeaveRequest) => {
    setRequestToApprove(request);
    // Check team leave conflict
    const conflict = leaveService.checkTeamLeaveConflict(
      request.department,
      request.startDate,
      request.endDate,
      request.id,
      request.employeeId
    );
    setConflictResult(conflict);
    setApproveModalOpen(true);
  };

  // Approve Flow Confirmation
  const handleConfirmApprove = (overrideConflict: boolean, overrideReason?: string) => {
    if (!requestToApprove) return;

    const result = leaveService.approveLeaveRequest(
      requestToApprove.id,
      'Admin User',
      overrideConflict,
      overrideReason
    );

    if (result.success) {
      addToast(
        'success',
        overrideConflict
          ? `Leave for ${requestToApprove.employeeName} approved with Admin Override.`
          : `Leave for ${requestToApprove.employeeName} approved successfully.`
      );
      setApproveModalOpen(false);
      setRequestToApprove(null);
      // Close drawer if open on this request
      if (selectedRequest?.id === requestToApprove.id) {
        setDetailsDrawerOpen(false);
      }
    } else {
      addToast('error', result.message || 'Failed to approve leave request.');
    }
  };

  // Reject Flow Initiation
  const handleInitiateReject = (request: LeaveRequest) => {
    setRequestToReject(request);
    setRejectModalOpen(true);
  };

  // Reject Flow Confirmation
  const handleConfirmReject = (reason: string) => {
    if (!requestToReject) return;

    const result = leaveService.rejectLeaveRequest(
      requestToReject.id,
      'Admin User',
      reason
    );

    if (result.success) {
      addToast('info', `Leave request for ${requestToReject.employeeName} rejected.`);
      setRejectModalOpen(false);
      setRequestToReject(null);
      if (selectedRequest?.id === requestToReject.id) {
        setDetailsDrawerOpen(false);
      }
    } else {
      addToast('error', result.message || 'Failed to reject leave request.');
    }
  };

  // Excel / PDF Exports
  const handleExportExcel = () => {
    exportLeaveToExcel(filteredRequests, 'Leave_Requests');
    addToast('success', 'Excel leave report downloaded successfully.');
  };

  const handleExportPDF = () => {
    exportLeaveToPDF('Admin Leave Requests Audit Report', filteredRequests);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-center justify-between gap-2.5 transition-all animate-slideLeft ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : t.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {t.type === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span className="font-semibold">{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="hover:text-slate-800 transition">Enterprise HRMS</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-800 transition">Leave Operations</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
          Admin Leave Management
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Admin Leave Management Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/90 text-blue-800 border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-700" />
              <span>Admin Role Only</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Monitor, review, approve, reject, and audit all employee leave requests with automated team conflict prevention and real-time attendance integration.
          </p>
        </div>

        {/* Top Header Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setReportsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Leave Reports</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-xs transition"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* 1. Six Interactive Dashboard Summary Cards */}
      <LeaveSummaryCards
        metrics={metrics}
        activeFilter={filters.cardFilter}
        onSelectFilter={handleSelectCardFilter}
      />

      {/* 2. Filter & Search Bar */}
      <LeaveFilterBar
        filters={filters}
        onUpdateFilters={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        onResetFilters={() => setFilters(INITIAL_FILTERS)}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onOpenReports={() => setReportsModalOpen(true)}
        totalFilteredCount={filteredRequests.length}
      />

      {/* 3. Leave Requests Table */}
      <LeaveRequestsTable
        requests={filteredRequests}
        onViewDetails={handleViewDetails}
        onApprove={handleInitiateApprove}
        onReject={handleInitiateReject}
      />

      {/* 4. Leave Details Drawer */}
      <LeaveDetailsDrawer
        isOpen={detailsDrawerOpen}
        request={selectedRequest}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedRequest(null);
        }}
        onApprove={handleInitiateApprove}
        onReject={handleInitiateReject}
      />

      {/* 5. Approve Confirmation & Team Conflict Modal */}
      <ApproveLeaveModal
        isOpen={approveModalOpen}
        request={requestToApprove}
        conflictResult={conflictResult}
        onConfirmApprove={handleConfirmApprove}
        onClose={() => {
          setApproveModalOpen(false);
          setRequestToApprove(null);
          setConflictResult(null);
        }}
      />

      {/* 6. Reject Modal with Mandatory Reason */}
      <RejectLeaveModal
        isOpen={rejectModalOpen}
        request={requestToReject}
        onConfirmReject={handleConfirmReject}
        onClose={() => {
          setRejectModalOpen(false);
          setRequestToReject(null);
        }}
      />

      {/* 7. Leave Reports & Analytics Modal */}
      <LeaveReportsModal
        isOpen={reportsModalOpen}
        requests={requests}
        onClose={() => setReportsModalOpen(false)}
      />
    </div>
  );
};

export default AdminLeaveManagementPage;
