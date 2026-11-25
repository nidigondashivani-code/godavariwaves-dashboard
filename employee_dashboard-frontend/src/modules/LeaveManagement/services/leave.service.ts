/**
 * Leave Management Service
 * Enterprise HRMS Admin Leave Management Dashboard
 * Handles persistence, team conflict validation, approval workflows, balance updates, and notifications.
 */

import {
  LeaveRequest,
  LeaveBalance,
  LeaveDashboardMetrics,
  TeamConflictCheckResult,
  ConflictingLeave,
} from '../types/leave.types';
import { getTodayString } from '../constants/leave.constants';
import notificationService from '../../Notifications/services/notification.service';
import { rolePermissionsService } from '../../RolePermissions/services/rolePermissions.service';
import { apiClient } from '../../../api/apiClient';
import { getAssetUrl } from '../../../config/env.config';

const LEAVE_STORAGE_KEY = 'ems_admin_leave_requests_v1';
const BALANCE_STORAGE_KEY = 'ems_admin_leave_balances_v1';
const LEGACY_SEEDED_REQUEST_IDS = new Set([
  'LR-2026-001',
  'LR-2026-002',
  'LR-2026-003',
  'LR-2026-004',
  'LR-2026-005',
  'LR-2026-006',
  'LR-2026-007',
]);
const LEGACY_SEEDED_EMPLOYEE_IDS = new Set([
  'EMP-101',
  'EMP-102',
  'EMP-103',
  'EMP-104',
  'EMP-105',
  'EMP-106',
  'EMP-107',
]);

type LeaveListener = (requests: LeaveRequest[]) => void;

class LeaveService {
  private requests: LeaveRequest[] = [];
  private balances: Record<string, LeaveBalance> = {};
  private listeners: Set<LeaveListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const storedRequests = localStorage.getItem(LEAVE_STORAGE_KEY);
      const parsedRequests = storedRequests ? JSON.parse(storedRequests) : [];
      const requests = Array.isArray(parsedRequests) ? parsedRequests : [];
      this.requests = requests.filter(
        (request: LeaveRequest) => request && !LEGACY_SEEDED_REQUEST_IDS.has(request.id)
      );
      if (!storedRequests || this.requests.length !== requests.length) {
        localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(this.requests));
      }

      const storedBalances = localStorage.getItem(BALANCE_STORAGE_KEY);
      const parsedBalances = storedBalances ? JSON.parse(storedBalances) : {};
      const balances =
        parsedBalances && typeof parsedBalances === 'object' && !Array.isArray(parsedBalances)
          ? (parsedBalances as Record<string, LeaveBalance>)
          : {};
      this.balances = Object.keys(balances).reduce<Record<string, LeaveBalance>>(
        (cleanBalances, employeeId) => {
          if (!LEGACY_SEEDED_EMPLOYEE_IDS.has(employeeId)) {
            cleanBalances[employeeId] = balances[employeeId];
          }
          return cleanBalances;
        },
        {}
      );
      if (!storedBalances || Object.keys(this.balances).length !== Object.keys(balances).length) {
        localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(this.balances));
      }
    } catch (error) {
      this.requests = [];
      this.balances = {};
      console.error('Failed to load leave data', error);
    }
  }

  private saveRequests(): void {
    try {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(this.requests));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save leave requests', e);
    }
  }

  private saveBalances(): void {
    try {
      localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(this.balances));
    } catch (e) {
      console.error('Failed to save leave balances', e);
    }
  }

  public subscribe(listener: LeaveListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.requests]);
      } catch (err) {
        console.error('Error notifying leave listener', err);
      }
    });
  }

  /**
   * Sync leave requests from live backend API (MySQL 8 via Express /api/v1/leaves/admin/all)
   */
  public async syncFromBackend(): Promise<LeaveRequest[]> {
    try {
      const res = await apiClient.get('/leaves/admin/all');
      const rows = res.data?.data;
      if (Array.isArray(rows)) {
        const backendRequests: LeaveRequest[] = rows.map((item: any) => ({
          id: String(item.id),
          employeeId: item.employee?.employee_code || `EMP-${item.employee_id}`,
          employeeName: item.employee?.full_name || 'Employee',
          department: item.employee?.department?.name || 'Software Development',
          designation: 'Software Engineer',
          companyEmail: item.employee?.company_email || 'employee@godavariwave.com',
          mobileNumber: item.employee?.phone || '--',
          leaveType: (item.leaveType?.name === 'Sick Leave' || item.leaveType?.name === 'Emergency Leave' ? item.leaveType.name : 'Casual Leave') as any,
          startDate: item.start_date,
          endDate: item.end_date,
          totalDays: Number(item.total_days || 1),
          reason: item.reason || '',
          appliedDate: item.createdAt ? item.createdAt.substring(0, 10) : getTodayString(),
          status: item.status,
          rejectionReason: item.rejection_reason || undefined,
          employeePhoto: item.employee?.profile_picture ? (getAssetUrl(item.employee.profile_picture) || undefined) : undefined,
        }));

        // Keep local requests that aren't on backend
        const localOnly = this.requests.filter(
          (r) => !backendRequests.some((b) => b.id === r.id) && !LEGACY_SEEDED_REQUEST_IDS.has(r.id)
        );
        this.requests = [...backendRequests, ...localOnly];
        this.saveRequests();
        return this.getLeaveRequests();
      }
    } catch (err) {
      console.warn('Failed to sync leaves from backend:', err);
    }
    return this.getLeaveRequests();
  }

  /**
   * Get all leave requests sorted by applied date descending
   */
  public getLeaveRequests(): LeaveRequest[] {
    return [...this.requests].sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
  }

  /**
   * Get single leave request by ID
   */
  public getLeaveRequestById(id: string): LeaveRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  /**
   * Compute the 6 interactive dashboard summary metrics
   */
  public getMetrics(): LeaveDashboardMetrics {
    const today = getTodayString();
    const totalRequests = this.requests.length;
    const pendingApproval = this.requests.filter((r) => r.status === 'Pending').length;
    const approvedLeaves = this.requests.filter((r) => r.status === 'Approved').length;
    const rejectedLeaves = this.requests.filter((r) => r.status === 'Rejected').length;

    // Employees on leave today (Approved and today falls within start and end date inclusive)
    const onLeaveToday = this.requests.filter(
      (r) => r.status === 'Approved' && r.startDate <= today && today <= r.endDate
    ).length;

    // Upcoming leaves (Approved or Pending where start date is strictly after today)
    const upcomingLeaves = this.requests.filter(
      (r) => r.status !== 'Rejected' && r.startDate > today
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
   * Team Leave Validation:
   * Checks if another employee in the same team/department is already approved
   * for overlapping dates (start1 <= end2 && start2 <= end1).
   */
  public checkTeamLeaveConflict(
    department: string,
    startDate: string,
    endDate: string,
    excludeRequestId?: string,
    excludeEmployeeId?: string
  ): TeamConflictCheckResult {
    const conflictingLeaves: ConflictingLeave[] = [];

    this.requests.forEach((req) => {
      // Must be in same department
      if (req.department !== department) return;
      // Must be already Approved
      if (req.status !== 'Approved') return;
      // Exclude current request or same employee
      if (excludeRequestId && req.id === excludeRequestId) return;
      if (excludeEmployeeId && req.employeeId === excludeEmployeeId) return;

      // Check overlap: startDate <= req.endDate && req.startDate <= endDate
      if (startDate <= req.endDate && req.startDate <= endDate) {
        conflictingLeaves.push({
          employeeId: req.employeeId,
          employeeName: req.employeeName,
          employeePhoto: req.employeePhoto,
          designation: req.designation,
          department: req.department,
          startDate: req.startDate,
          endDate: req.endDate,
          leaveType: req.leaveType,
        });
      }
    });

    if (conflictingLeaves.length > 0) {
      return {
        hasConflict: true,
        conflictingEmployees: conflictingLeaves,
        warningMessage:
          'Another team member is already on leave during these dates. Approving this request may affect team operations.',
      };
    }

    return {
      hasConflict: false,
      conflictingEmployees: [],
    };
  }

  /**
   * Approve a leave request (with optional admin override privilege)
   */
  public approveLeaveRequest(
    id: string,
    adminName: string = 'Admin User',
    overrideConflict: boolean = false,
    overrideReason?: string
  ): { success: boolean; message: string; requiresOverride?: boolean; conflict?: TeamConflictCheckResult } {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, message: 'Leave request not found.' };
    }

    const req = this.requests[index];

    // Check conflict if not explicitly overridden
    if (!overrideConflict) {
      const conflict = this.checkTeamLeaveConflict(
        req.department,
        req.startDate,
        req.endDate,
        req.id,
        req.employeeId
      );
      if (conflict.hasConflict) {
        return {
          success: false,
          message: conflict.warningMessage || 'Team conflict detected',
          requiresOverride: true,
          conflict,
        };
      }
    }

    // Update status to Approved
    const now = new Date().toISOString();
    const formattedDate = now.replace('T', ' ').substring(0, 19);

    const updatedRequest: LeaveRequest = {
      ...req,
      status: 'Approved',
      approvedBy: adminName,
      approvedAt: formattedDate,
      rejectedBy: undefined,
      rejectedAt: undefined,
      rejectionReason: undefined,
      isOverridden: overrideConflict ? true : undefined,
      overrideReason: overrideConflict
        ? overrideReason || 'Approved with Administrative Override privilege (Team Capacity Check overridden)'
        : undefined,
    };

    this.requests[index] = updatedRequest;
    this.saveRequests();

    // Call backend API if request originates from MySQL
    const numericId = Number(id);
    if (!Number.isNaN(numericId) && numericId > 0) {
      void apiClient.patch(`/leaves/${numericId}/approve`).catch((err) => {
        console.warn('Backend approve sync failed:', err);
      });
    }

    // Automatically update leave balance
    this.deductLeaveBalance(req.employeeId, req.leaveType, req.totalDays, req.startDate, adminName, req.reason);

    // Business Rule: Automatically update Attendance module as "On Leave"
    // Exempting employee from 11:00 AM absent mark
    this.syncAttendanceOnLeave(req);

    // Record in Audit Log
    try {
      rolePermissionsService.logActivity({
        user: adminName,
        role: 'Admin',
        module: 'Leave Management',
        action: `Approved ${req.leaveType} for ${req.employeeName} (${req.startDate} to ${req.endDate})${
          overrideConflict ? ' [Override Applied]' : ''
        }`,
        status: 'Success',
      });
    } catch {
      // Ignore if audit log service is quiet
    }

    // Send real-time notification to employee
    notificationService.addNotification({
      title: `Leave Approved: ${req.leaveType}`,
      description: `Your leave request for ${req.totalDays} day(s) from ${req.startDate} to ${req.endDate} has been approved by ${adminName}.`,
      category: 'leave',
      priority: 'medium',
      employeeName: req.employeeName,
      employeeId: req.employeeId,
      department: req.department,
      actionUrl: '#leaves',
      actionLabel: 'View Status',
    });

    return { success: true, message: 'Leave request approved successfully.' };
  }

  /**
   * Reject a leave request (Reason is mandatory)
   */
  public rejectLeaveRequest(
    id: string,
    adminName: string = 'Admin User',
    reason: string
  ): { success: boolean; message: string } {
    if (!reason || reason.trim().length === 0) {
      return { success: false, message: 'Reason for rejection is required.' };
    }

    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, message: 'Leave request not found.' };
    }

    const req = this.requests[index];
    const now = new Date().toISOString();
    const formattedDate = now.replace('T', ' ').substring(0, 19);

    const updatedRequest: LeaveRequest = {
      ...req,
      status: 'Rejected',
      rejectedBy: adminName,
      rejectedAt: formattedDate,
      rejectionReason: reason.trim(),
    };

    this.requests[index] = updatedRequest;
    this.saveRequests();

    // Call backend API if request originates from MySQL
    const numericId = Number(id);
    if (!Number.isNaN(numericId) && numericId > 0) {
      void apiClient.patch(`/leaves/${numericId}/reject`, { rejection_reason: reason.trim() }).catch((err) => {
        console.warn('Backend reject sync failed:', err);
      });
    }

    // Record in Audit Log
    try {
      rolePermissionsService.logActivity({
        user: adminName,
        role: 'Admin',
        module: 'Leave Management',
        action: `Rejected ${req.leaveType} for ${req.employeeName}. Reason: ${reason.trim()}`,
        status: 'Success',
      });
    } catch {
      // quiet
    }

    // Send real-time notification to employee
    notificationService.addNotification({
      title: `Leave Rejected: ${req.leaveType}`,
      description: `Your leave request from ${req.startDate} to ${req.endDate} was rejected by ${adminName}. Reason: ${reason.trim()}`,
      category: 'leave',
      priority: 'high',
      employeeName: req.employeeName,
      employeeId: req.employeeId,
      department: req.department,
      actionUrl: '#leaves',
      actionLabel: 'Review Request',
    });

    return { success: true, message: 'Leave request rejected.' };
  }

  /**
   * Deduct balance on approval
   */
  private deductLeaveBalance(
    employeeId: string,
    type: string,
    days: number,
    date: string,
    approvedBy: string,
    reason: string
  ): void {
    let balance = this.balances[employeeId];
    if (!balance) {
      balance = this.getEmployeeLeaveBalance(employeeId);
    }

    if (type === 'Casual Leave') {
      const used = balance.casualLeaveUsedThisMonth + days;
      balance = {
        ...balance,
        casualLeaveUsedThisMonth: used,
        casualLeaveRemainingThisMonth: Math.max(0, 1 - used),
        casualLeaveAnnualUsed: balance.casualLeaveAnnualUsed + days,
      };
    } else if (type === 'Sick Leave') {
      const used = balance.sickLeaveUsedThisMonth + days;
      balance = {
        ...balance,
        sickLeaveUsedThisMonth: used,
        sickLeaveRemainingThisMonth: Math.max(0, 2 - used),
        sickLeaveAnnualUsed: balance.sickLeaveAnnualUsed + days,
      };
    } else if (type === 'Emergency Leave') {
      balance = {
        ...balance,
        emergencyLeaveAnnualUsed: balance.emergencyLeaveAnnualUsed + 1,
        emergencyLeaveHistory: [
          {
            id: `emg-${Date.now()}`,
            date,
            totalDays: days,
            reason,
            approvedBy,
          },
          ...balance.emergencyLeaveHistory,
        ],
      };
    }

    this.balances[employeeId] = balance;
    this.saveBalances();
  }

  /**
   * Sync with Attendance module:
   * Marks employee as "On Leave", exempting them from absent status at 11:00 AM.
   */
  private syncAttendanceOnLeave(req: LeaveRequest): void {
    try {
      const attendanceKey = 'ems_attendance_records_v1';
      const raw = localStorage.getItem(attendanceKey);
      const records = raw ? JSON.parse(raw) : [];

      const newRecord = {
        id: `att-leave-${Date.now()}`,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        department: req.department,
        date: req.startDate,
        status: 'On Leave',
        exemptFromLateAbsent: true,
        leaveType: req.leaveType,
        approvedBy: req.approvedBy,
      };

      records.unshift(newRecord);
      localStorage.setItem(attendanceKey, JSON.stringify(records));
    } catch {
      // quiet
    }
  }

  /**
   * Retrieve employee leave balance
   */
  public getEmployeeLeaveBalance(employeeId: string): LeaveBalance {
    if (this.balances[employeeId]) {
      return this.balances[employeeId];
    }

    // Default balance template for an employee
    const req = this.requests.find((r) => r.employeeId === employeeId);
    const newBalance: LeaveBalance = {
      employeeId,
      employeeName: req ? req.employeeName : 'Employee',
      department: req ? req.department : 'General',
      designation: req ? req.designation : 'Staff',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      casualLeaveUsedThisMonth: 0,
      casualLeaveRemainingThisMonth: 1, // Max 1 per month
      casualLeaveAnnualUsed: 0,
      casualLeaveAnnualTotal: 12,
      sickLeaveUsedThisMonth: 0,
      sickLeaveRemainingThisMonth: 2, // Max 2 per month
      sickLeaveAnnualUsed: 0,
      sickLeaveAnnualTotal: 24,
      emergencyLeaveAnnualUsed: 0,
      emergencyLeaveHistory: [],
    };

    this.balances[employeeId] = newBalance;
    this.saveBalances();
    return newBalance;
  }

  /**
   * Retrieve employee leave history
   */
  public getEmployeeLeaveHistory(employeeId: string): LeaveRequest[] {
    return this.requests
      .filter((r) => r.employeeId === employeeId)
      .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
  }

  /**
   * Create a new leave request (Simulating incoming request to test live Admin notifications)
   */
  public createLeaveRequest(
    data: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>
  ): LeaveRequest {
    const today = getTodayString();
    const id = `LR-${today.slice(0, 4)}-${String(this.requests.length + 1).padStart(3, '0')}`;
    const newReq: LeaveRequest = {
      ...data,
      id,
      appliedDate: today,
      status: 'Pending',
    };

    this.requests = [newReq, ...this.requests];
    this.saveRequests();

    // Notify Admin of new leave request
    notificationService.addNotification({
      title: data.leaveType === 'Emergency Leave' ? 'EMERGENCY Leave Request Submitted' : 'New Leave Request Submitted',
      description: `${data.employeeName} (${data.department}) applied for ${data.leaveType} (${data.totalDays} day(s)) starting ${data.startDate}.`,
      category: 'leave',
      priority: data.leaveType === 'Emergency Leave' ? 'critical' : 'medium',
      employeeName: data.employeeName,
      employeeId: data.employeeId,
      department: data.department,
      actionUrl: '#leaves',
      actionLabel: 'Review Request',
    });

    return newReq;
  }
}

export const leaveService = new LeaveService();
export default leaveService;
