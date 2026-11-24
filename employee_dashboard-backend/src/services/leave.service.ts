import { Op } from 'sequelize';
import sequelize from '../config/db.config';
import {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday,
  Setting,
  Employee,
  Department,
  TeamMember,
  TeamLeaveRule,
  LeaveConflict,
  Attendance,
  EmployeeHistory,
} from '../models';
import { AppError } from '../utils/appError.util';
import { getDateRange, isWeekend } from '../utils/dateUtils.util';
import { calculateTeamAvailability } from '../utils/teamAvailabilityCalculator';
import notificationService from './notification.service';
import auditLogService from './auditLog.service';

export class LeaveService {
  private async getWeekendDays(): Promise<number[]> {
    const setting = await Setting.findOne({ where: { key: 'weekend_days' } });
    if (setting) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback to default Sat/Sun
      }
    }
    return [0, 6];
  }

  public async calculateLeaveDays(startDate: string, endDate: string) {
    const allDates = getDateRange(startDate, endDate);
    if (allDates.length === 0) {
      throw new AppError('Invalid leave date range. End date must be on or after start date.', 400);
    }

    const [weekendDays, holidays] = await Promise.all([
      this.getWeekendDays(),
      Holiday.findAll({
        where: {
          date: { [Op.between]: [startDate, endDate] },
          is_optional: false,
        },
      }),
    ]);

    const holidaySet = new Set(holidays.map((h) => h.date));
    const workingDates = allDates.filter((d) => !isWeekend(d, weekendDays) && !holidaySet.has(d));

    return {
      totalCalendarDays: allDates.length,
      workingDates,
      totalDays: workingDates.length,
      excludedHolidays: holidays.map((h) => ({ date: h.date, name: h.name })),
      excludedWeekends: allDates.filter((d) => isWeekend(d, weekendDays)),
    };
  }

  public async evaluateTeamLeaveRules(employeeId: number, workingDates: string[]) {
    const memberships = await TeamMember.findAll({
      where: { employee_id: employeeId, status: 'Active' },
    });
    if (memberships.length === 0 || workingDates.length === 0) {
      return { hasConflict: false, conflicts: [] as Array<{ teamId: number; ruleId: number; date: string; reason: string; conflictingEmployeeId: number; existingLeaveRequestId: number }> };
    }

    const conflicts: Array<{
      teamId: number;
      ruleId: number;
      date: string;
      reason: string;
      conflictingEmployeeId: number;
      existingLeaveRequestId: number;
    }> = [];

    const startDate = workingDates[0];
    const endDate = workingDates[workingDates.length - 1];

    for (const membership of memberships) {
      const rule = await TeamLeaveRule.findOne({
        where: { team_id: membership.team_id, status: 'Active' },
      });
      if (!rule) continue;

      const teamMembers = await TeamMember.findAll({
        where: { team_id: membership.team_id, status: 'Active' },
      });
      const colleagueIds = teamMembers.map((m) => m.employee_id).filter((id) => id !== employeeId);
      if (colleagueIds.length === 0) continue;

      const overlappingLeaves = await LeaveRequest.findAll({
        where: {
          employee_id: { [Op.in]: colleagueIds },
          status: { [Op.in]: ['Approved', 'Pending'] },
          start_date: { [Op.lte]: endDate },
          end_date: { [Op.gte]: startDate },
        },
      });

      for (const date of workingDates) {
        const onLeaveThatDay = overlappingLeaves.filter(
          (lr) => lr.start_date <= date && lr.end_date >= date
        );
        const projectedOnLeave = onLeaveThatDay.length + 1;
        const avail = calculateTeamAvailability(
          { totalTeamMembers: teamMembers.length, approvedLeavesCount: projectedOnLeave },
          Number(rule.min_workforce_percentage)
        );

        if (projectedOnLeave > rule.max_concurrent_leaves || !avail.isMinimumMet) {
          const firstConflict = onLeaveThatDay[0];
          if (firstConflict) {
            const reason =
              projectedOnLeave > rule.max_concurrent_leaves
                ? `Team concurrent leave limit (${rule.max_concurrent_leaves}) exceeded on ${date}.`
                : `Team workforce coverage would drop to ${avail.availabilityPercentage}% (minimum ${rule.min_workforce_percentage}%) on ${date}.`;
            conflicts.push({
              teamId: membership.team_id,
              ruleId: rule.id,
              date,
              reason,
              conflictingEmployeeId: firstConflict.employee_id,
              existingLeaveRequestId: firstConflict.id,
            });
          }
        }
      }
    }

    return { hasConflict: conflicts.length > 0, conflicts };
  }

  public async getLeaveTypes() {
    return LeaveType.findAll({ where: { is_active: true }, order: [['id', 'ASC']] });
  }

  public async upsertLeaveType(dto: {
    id?: number;
    name: string;
    code: string;
    default_days_per_year: number;
    carry_forward_allowed?: boolean;
    requires_attachment?: boolean;
    description?: string;
  }) {
    if (dto.id) {
      const lt = await LeaveType.findByPk(dto.id);
      if (!lt) throw new AppError('Leave type not found.', 404);
      await lt.update(dto);
      return lt;
    }
    return LeaveType.create(dto);
  }

  public async getEmployeeBalances(employeeId: number, year = new Date().getFullYear()) {
    const leaveTypes = await LeaveType.findAll({ where: { is_active: true } });
    for (const lt of leaveTypes) {
      await LeaveBalance.findOrCreate({
        where: { employee_id: employeeId, leave_type_id: lt.id, year },
        defaults: {
          employee_id: employeeId,
          leave_type_id: lt.id,
          year,
          allocated_days: Number(lt.default_days_per_year),
          used_days: 0,
          pending_days: 0,
          remaining_days: Number(lt.default_days_per_year),
        },
      });
    }

    return LeaveBalance.findAll({
      where: { employee_id: employeeId, year },
      include: [{ model: LeaveType, as: 'leaveType' }],
      order: [['leave_type_id', 'ASC']],
    });
  }

  public async updateEmployeeBalance(
    employeeId: number,
    leaveTypeId: number,
    allocatedDays: number,
    year = new Date().getFullYear()
  ) {
    const [balance] = await LeaveBalance.findOrCreate({
      where: { employee_id: employeeId, leave_type_id: leaveTypeId, year },
      defaults: {
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year,
        allocated_days: allocatedDays,
        used_days: 0,
        pending_days: 0,
        remaining_days: allocatedDays,
      },
    });
    const used = Number(balance.used_days || 0);
    balance.allocated_days = allocatedDays;
    balance.remaining_days = Math.max(0, Number((allocatedDays - used).toFixed(1)));
    await balance.save();
    return balance;
  }

  public async applyLeave(
    employeeId: number,
    userId: number,
    dto: {
      leave_type_id: number;
      start_date: string;
      end_date: string;
      reason: string;
      attachment_url?: string | null;
    }
  ) {
    if (!dto.leave_type_id || !dto.start_date || !dto.end_date || !dto.reason?.trim()) {
      throw new AppError('Leave type, start date, end date, and reason are required.', 400);
    }

    const leaveType = await LeaveType.findByPk(dto.leave_type_id);
    if (!leaveType || !leaveType.is_active) {
      throw new AppError('Selected leave type is invalid or inactive.', 400);
    }

    if (leaveType.requires_attachment && !dto.attachment_url) {
      throw new AppError(`${leaveType.name} requires a supporting attachment.`, 400);
    }

    // 1. Calculate valid working days (excluding weekends & company holidays)
    const calc = await this.calculateLeaveDays(dto.start_date, dto.end_date);
    if (calc.totalDays <= 0) {
      throw new AppError(
        'The selected date range falls entirely on weekends or company holidays. No leave days required.',
        400
      );
    }

    // 2. Prevent overlapping or duplicate leave submissions
    const overlapping = await LeaveRequest.findOne({
      where: {
        employee_id: employeeId,
        status: { [Op.in]: ['Pending', 'Approved'] },
        start_date: { [Op.lte]: dto.end_date },
        end_date: { [Op.gte]: dto.start_date },
      },
    });
    if (overlapping) {
      throw new AppError(
        `You already have a ${overlapping.status.toLowerCase()} leave request overlapping ${overlapping.start_date} to ${overlapping.end_date}.`,
        409
      );
    }

    // 3. Validate leave balance (ensure balance record exists)
    const year = parseInt(dto.start_date.slice(0, 4), 10) || new Date().getFullYear();
    await this.getEmployeeBalances(employeeId, year);
    const balance = await LeaveBalance.findOne({
      where: { employee_id: employeeId, leave_type_id: dto.leave_type_id, year },
    });
    const availableForRequest = Number(balance?.remaining_days || 0) - Number(balance?.pending_days || 0);
    if (!balance || availableForRequest < calc.totalDays) {
      throw new AppError(
        `Insufficient ${leaveType.name} balance. Available: ${Math.max(0, availableForRequest)} day(s), Requested: ${calc.totalDays} day(s).`,
        400
      );
    }

    // 4. Evaluate Team Leave Rules
    const teamCheck = await this.evaluateTeamLeaveRules(employeeId, calc.workingDates);
    if (teamCheck.hasConflict) {
      // Check if any violated rule forbids admin override
      const ruleIds = [...new Set(teamCheck.conflicts.map((c) => c.ruleId))];
      const blockingRule = await TeamLeaveRule.findOne({
        where: { id: { [Op.in]: ruleIds }, allow_admin_override: false },
      });
      if (blockingRule) {
        throw new AppError(teamCheck.conflicts[0].reason, 409);
      }
    }

    // 5. Create Pending Leave Request & reserve pending_days (deduct used/remaining ONLY on approval!)
    const leaveRequest = await sequelize.transaction(async (t) => {
      const created = await LeaveRequest.create(
        {
          employee_id: employeeId,
          leave_type_id: dto.leave_type_id,
          start_date: dto.start_date,
          end_date: dto.end_date,
          total_days: calc.totalDays,
          reason: dto.reason.trim(),
          attachment_url: dto.attachment_url || null,
          status: 'Pending',
          has_team_conflict: teamCheck.hasConflict,
          conflict_summary: teamCheck.hasConflict ? teamCheck.conflicts.map((c) => c.reason).join(' | ') : null,
        },
        { transaction: t }
      );

      balance.pending_days = Number((Number(balance.pending_days) + calc.totalDays).toFixed(1));
      await balance.save({ transaction: t });

      if (teamCheck.hasConflict) {
        for (const c of teamCheck.conflicts) {
          await LeaveConflict.create(
            {
              team_id: c.teamId,
              rule_id: c.ruleId,
              leave_request_id: created.id,
              conflicting_employee_id: c.conflictingEmployeeId,
              existing_leave_request_id: c.existingLeaveRequestId,
              conflict_date: c.date,
              reason: c.reason,
              status: 'Detected',
            },
            { transaction: t }
          );
        }
      }

      return created;
    });

    const emp = await Employee.findByPk(employeeId);
    await notificationService.notifyAdmins(
      'Leave',
      'New Leave Application',
      `${emp?.full_name || 'An employee'} applied for ${calc.totalDays} day(s) of ${leaveType.name} (${dto.start_date} to ${dto.end_date}).`,
      '/admin/leaves'
    );

    await auditLogService.log({
      userId,
      action: 'APPLY_LEAVE',
      entityType: 'LeaveRequest',
      entityId: leaveRequest.id,
      newValues: { leaveType: leaveType.name, startDate: dto.start_date, endDate: dto.end_date, totalDays: calc.totalDays },
    });

    return LeaveRequest.findByPk(leaveRequest.id, {
      include: [{ model: LeaveType, as: 'leaveType' }],
    });
  }

  public async getMyLeaveRequests(employeeId: number, status?: string) {
    const where: Record<string, unknown> = { employee_id: employeeId };
    if (status && status !== 'All') where.status = status;

    return LeaveRequest.findAll({
      where,
      include: [{ model: LeaveType, as: 'leaveType' }],
      order: [['createdAt', 'DESC']],
    });
  }

  public async cancelMyLeaveRequest(leaveRequestId: number, employeeId: number, userId: number) {
    const request = await LeaveRequest.findOne({
      where: { id: leaveRequestId, employee_id: employeeId },
    });
    if (!request) throw new AppError('Leave request not found.', 404);
    if (request.status !== 'Pending') {
      throw new AppError('Only pending leave requests can be cancelled.', 400);
    }

    const year = parseInt(request.start_date.slice(0, 4), 10) || new Date().getFullYear();
    await sequelize.transaction(async (t) => {
      request.status = 'Cancelled';
      await request.save({ transaction: t });

      const balance = await LeaveBalance.findOne({
        where: { employee_id: employeeId, leave_type_id: request.leave_type_id, year },
        transaction: t,
      });
      if (balance) {
        balance.pending_days = Math.max(0, Number((Number(balance.pending_days) - Number(request.total_days)).toFixed(1)));
        await balance.save({ transaction: t });
      }
    });

    await auditLogService.log({
      userId,
      action: 'CANCEL_LEAVE',
      entityType: 'LeaveRequest',
      entityId: request.id,
    });

    return request;
  }

  public async adminListLeaveRequests(filters: { status?: string; departmentId?: number; employeeId?: number }) {
    const where: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.employeeId) where.employee_id = filters.employeeId;

    const empWhere: Record<string, unknown> = {};
    if (filters.departmentId) empWhere.department_id = filters.departmentId;

    return LeaveRequest.findAll({
      where,
      include: [
        { model: LeaveType, as: 'leaveType' },
        {
          model: Employee,
          as: 'employee',
          where: Object.keys(empWhere).length ? empWhere : undefined,
          attributes: ['id', 'employee_code', 'full_name', 'department_id'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  public async reviewLeaveRequest(
    leaveRequestId: number,
    adminUserId: number,
    action: 'Approved' | 'Rejected',
    rejectionReason?: string
  ) {
    const request = await LeaveRequest.findByPk(leaveRequestId, {
      include: [{ model: LeaveType, as: 'leaveType' }],
    });
    if (!request) throw new AppError('Leave request not found.', 404);
    if (request.status !== 'Pending') {
      throw new AppError(`This leave request is already ${request.status.toLowerCase()}.`, 400);
    }

    // Prevent self-approval: an employee cannot approve or reject their own leave request
    const reviewerEmp = await Employee.findOne({ where: { user_id: adminUserId } });
    if (reviewerEmp && Number(reviewerEmp.id) === Number(request.employee_id)) {
      throw new AppError('Forbidden: you cannot approve or reject your own leave request.', 403);
    }
    if (action === 'Rejected' && !rejectionReason?.trim()) {
      throw new AppError('Please provide a rejection reason.', 400);
    }

    const year = parseInt(request.start_date.slice(0, 4), 10) || new Date().getFullYear();
    const leaveTypeObj = request.get('leaveType') as LeaveType | undefined;

    await sequelize.transaction(async (t) => {
      const balance = await LeaveBalance.findOne({
        where: { employee_id: request.employee_id, leave_type_id: request.leave_type_id, year },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const days = Number(request.total_days);

      if (action === 'Approved') {
        if (!balance || Number(balance.remaining_days) < days) {
          throw new AppError('Employee no longer has sufficient leave balance to approve this request.', 400);
        }
        balance.used_days = Number((Number(balance.used_days) + days).toFixed(1));
        balance.pending_days = Math.max(0, Number((Number(balance.pending_days) - days).toFixed(1)));
        balance.remaining_days = Math.max(0, Number((Number(balance.allocated_days) - Number(balance.used_days)).toFixed(1)));
        await balance.save({ transaction: t });

        // Mark approved leave dates in Attendance
        const calc = await this.calculateLeaveDays(request.start_date, request.end_date);
        for (const d of calc.workingDates) {
          const [att] = await Attendance.findOrCreate({
            where: { employee_id: request.employee_id, date: d },
            defaults: {
              employee_id: request.employee_id,
              date: d,
              status: 'On Leave',
              working_hours: 0,
              working_minutes: 0,
              late_minutes: 0,
              notes: `Approved ${leaveTypeObj?.name || 'Leave'}`,
              is_approved: true,
            },
            transaction: t,
          });
          if (!att.clock_in) {
            att.status = 'On Leave';
            att.is_approved = true;
            await att.save({ transaction: t });
          }
        }

        if (request.has_team_conflict) {
          await LeaveConflict.update(
            { status: 'Overridden', resolved_by: adminUserId, resolution_notes: 'Approved by Admin override' },
            { where: { leave_request_id: request.id }, transaction: t }
          );
        }

        await EmployeeHistory.create(
          {
            employee_id: request.employee_id,
            event_type: 'LeaveApproved',
            title: `${leaveTypeObj?.name || 'Leave'} Approved`,
            description: `${days} day(s) from ${request.start_date} to ${request.end_date}`,
            performed_by: adminUserId,
          },
          { transaction: t }
        );
      } else {
        if (balance) {
          balance.pending_days = Math.max(0, Number((Number(balance.pending_days) - days).toFixed(1)));
          await balance.save({ transaction: t });
        }
        if (request.has_team_conflict) {
          await LeaveConflict.update(
            { status: 'Rejected', resolved_by: adminUserId, resolution_notes: rejectionReason || 'Rejected' },
            { where: { leave_request_id: request.id }, transaction: t }
          );
        }
      }

      request.status = action;
      request.reviewed_by = adminUserId;
      request.reviewed_at = new Date();
      request.rejection_reason = action === 'Rejected' ? rejectionReason!.trim() : null;
      await request.save({ transaction: t });
    });

    await notificationService.notifyEmployee(
      request.employee_id,
      'Leave',
      `Leave Request ${action}`,
      action === 'Approved'
        ? `Your ${leaveTypeObj?.name || 'leave'} request (${request.start_date} to ${request.end_date}) has been approved.`
        : `Your ${leaveTypeObj?.name || 'leave'} request (${request.start_date} to ${request.end_date}) was rejected. Reason: ${rejectionReason}`,
      '/employee/leaves'
    );

    await auditLogService.log({
      userId: adminUserId,
      action: `LEAVE_${action.toUpperCase()}`,
      entityType: 'LeaveRequest',
      entityId: request.id,
      newValues: { status: action, rejectionReason },
    });

    return request;
  }
}

export default new LeaveService();
