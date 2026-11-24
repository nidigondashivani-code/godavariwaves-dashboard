/**
 * Leave Management Types & Interfaces
 * Enterprise HRMS Admin Leave Management Dashboard
 */

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Emergency Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveAttachment {
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhoto?: string;
  department: string;
  designation: string;
  companyEmail: string;
  mobileNumber: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  appliedDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  attachment?: LeaveAttachment;
  teamId?: string;
  isOverridden?: boolean;
  overrideReason?: string;
}

export interface EmergencyLeaveRecord {
  id: string;
  date: string;
  totalDays: number;
  reason: string;
  approvedBy: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  month: number;
  year: number;
  // Casual Leave (Max 1 per month)
  casualLeaveUsedThisMonth: number;
  casualLeaveRemainingThisMonth: number;
  casualLeaveAnnualUsed: number;
  casualLeaveAnnualTotal: number; // 12
  // Sick Leave (Max 2 per month)
  sickLeaveUsedThisMonth: number;
  sickLeaveRemainingThisMonth: number;
  sickLeaveAnnualUsed: number;
  sickLeaveAnnualTotal: number; // 24
  // Emergency Leave (Mandatory Admin Approval)
  emergencyLeaveAnnualUsed: number;
  emergencyLeaveHistory: EmergencyLeaveRecord[];
}

export interface LeaveDashboardMetrics {
  totalRequests: number;
  pendingApproval: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  onLeaveToday: number;
  upcomingLeaves: number;
}

export type SummaryCardFilterType =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'today'
  | 'upcoming';

export interface LeaveFilterOptions {
  searchQuery: string;
  department: string;
  designation: string;
  leaveType: string;
  status: string;
  startDate: string;
  endDate: string;
  cardFilter: SummaryCardFilterType;
}

export interface ConflictingLeave {
  employeeId: string;
  employeeName: string;
  employeePhoto?: string;
  designation: string;
  department: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
}

export interface TeamConflictCheckResult {
  hasConflict: boolean;
  conflictingEmployees: ConflictingLeave[];
  warningMessage?: string;
}

export type LeaveReportType =
  | 'daily'
  | 'monthly'
  | 'employee'
  | 'pending';

export interface LeaveReportFilter {
  reportType: LeaveReportType;
  department: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
}
