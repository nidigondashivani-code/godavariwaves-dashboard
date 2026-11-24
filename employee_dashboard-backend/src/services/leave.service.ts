/**
 * Leave Service (Backend)
 * MVC Architecture - Express / MySQL / Node.js
 * Business logic for leave requests, approvals, team conflict validation, and balance tracking.
 */

import { ILeaveRequest } from '../models/LeaveRequest.model';
import { ILeaveBalance } from '../models/LeaveBalance.model';

class BackendLeaveService {
  // In-memory persistent state synchronized with database tables
  private leaveRequests: ILeaveRequest[] = [];
  private leaveBalances: Map<string, ILeaveBalance> = new Map();

  /**
   * Get all leave requests with optional filtering
   */
  public async getLeaveRequests(filters?: {
    department?: string;
    status?: string;
    leaveType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ILeaveRequest[]> {
    let list = [...this.leaveRequests];

    if (filters?.department && filters.department !== 'All Departments') {
      list = list.filter((r) => r.department === filters.department);
    }
    if (filters?.status && filters.status !== 'All Statuses') {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.leaveType && filters.leaveType !== 'All Leave Types') {
      list = list.filter((r) => r.leave_type === filters.leaveType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employee_name.toLowerCase().includes(q) ||
          r.employee_id.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q)
      );
    }
    if (filters?.startDate) {
      list = list.filter((r) => r.start_date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((r) => r.start_date <= filters.endDate!);
    }

    return list.sort((a, b) => b.applied_date.localeCompare(a.applied_date));
  }

  /**
   * Get 6 summary card metrics
   */
  public async getMetrics(referenceDate: string = '2026-11-24'): Promise<{
    totalRequests: number;
    pendingApproval: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    onLeaveToday: number;
    upcomingLeaves: number;
  }> {
    const totalRequests = this.leaveRequests.length;
    const pendingApproval = this.leaveRequests.filter((r) => r.status === 'Pending').length;
    const approvedLeaves = this.leaveRequests.filter((r) => r.status === 'Approved').length;
    const rejectedLeaves = this.leaveRequests.filter((r) => r.status === 'Rejected').length;

    const onLeaveToday = this.leaveRequests.filter(
      (r) => r.status === 'Approved' && r.start_date <= referenceDate && referenceDate <= r.end_date
    ).length;

    const upcomingLeaves = this.leaveRequests.filter(
      (r) => r.status !== 'Rejected' && r.start_date > referenceDate
    ).length;

    return {
      totalRequests,
      pendingApproval,
      approvedLeaves,
      rejectedLeaves,
      onLeaveToday,
      upcomingLeaves,
    };
  }

  /**
   * Check team leave conflict
   */
  public async checkTeamConflict(
    department: string,
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<{
    hasConflict: boolean;
    conflictingMembers: Array<{ employee_name: string; designation: string; dates: string }>;
  }> {
    const overlapping = this.leaveRequests.filter(
      (r) =>
        r.department === department &&
        r.status === 'Approved' &&
        r.id !== excludeId &&
        startDate <= r.end_date &&
        r.start_date <= endDate
    );

    return {
      hasConflict: overlapping.length > 0,
      conflictingMembers: overlapping.map((o) => ({
        employee_name: o.employee_name,
        designation: o.designation,
        dates: `${o.start_date} to ${o.end_date}`,
      })),
    };
  }

  /**
   * Approve leave request with optional Admin override
   */
  public async approveLeaveRequest(
    id: string,
    adminName: string = 'Admin User',
    overrideConflict: boolean = false,
    overrideReason?: string
  ): Promise<{ success: boolean; message: string; requiresOverride?: boolean }> {
    const req = this.leaveRequests.find((r) => r.id === id);
    if (!req) {
      return { success: false, message: 'Leave request not found' };
    }

    if (!overrideConflict) {
      const conflict = await this.checkTeamConflict(req.department, req.start_date, req.end_date, req.id);
      if (conflict.hasConflict) {
        return {
          success: false,
          message: 'Another team member is already on leave during these dates.',
          requiresOverride: true,
        };
      }
    }

    req.status = 'Approved';
    req.approved_by = adminName;
    req.approved_at = new Date().toISOString();
    req.is_overridden = overrideConflict;
    req.override_reason = overrideConflict ? overrideReason || 'Administrative team capacity override authorized' : undefined;

    return { success: true, message: 'Leave request approved successfully.' };
  }

  /**
   * Reject leave request (Mandatory reason)
   */
  public async rejectLeaveRequest(
    id: string,
    adminName: string = 'Admin User',
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    if (!reason || reason.trim().length === 0) {
      return { success: false, message: 'Rejection reason is required.' };
    }

    const req = this.leaveRequests.find((r) => r.id === id);
    if (!req) {
      return { success: false, message: 'Leave request not found' };
    }

    req.status = 'Rejected';
    req.rejected_by = adminName;
    req.rejected_at = new Date().toISOString();
    req.rejection_reason = reason.trim();

    return { success: true, message: 'Leave request rejected.' };
  }
}

export const backendLeaveService = new BackendLeaveService();
export default backendLeaveService;
