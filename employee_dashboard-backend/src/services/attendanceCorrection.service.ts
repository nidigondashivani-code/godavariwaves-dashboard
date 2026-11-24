import sequelize from '../config/db.config';
import {
  Attendance,
  AttendanceCorrection,
  AttendanceLog,
  Employee,
  EmployeeHistory,
  Department,
} from '../models';
import { AppError } from '../utils/appError.util';
import { formatTimeHHMM } from '../utils/dateUtils.util';
import {
  calculateLateMinutes,
  calculateWorkingDuration,
  determineAttendanceStatus,
} from '../helpers/attendanceCalculator.helper';
import notificationService from './notification.service';
import auditLogService from './auditLog.service';

export class AttendanceCorrectionService {
  public async submitCorrection(
    employeeId: number,
    userId: number,
    dto: {
      attendance_date: string;
      requested_login_time: string;
      requested_logout_time: string;
      reason: string;
    }
  ) {
    if (!dto.attendance_date || !dto.requested_login_time || !dto.requested_logout_time || !dto.reason?.trim()) {
      throw new AppError('Attendance date, requested login/logout times, and reason are required.', 400);
    }

    const existingPending = await AttendanceCorrection.findOne({
      where: { employee_id: employeeId, attendance_date: dto.attendance_date, status: 'Pending' },
    });
    if (existingPending) {
      throw new AppError('You already have a pending correction request for this date.', 409);
    }

    const attendance = await Attendance.findOne({
      where: { employee_id: employeeId, date: dto.attendance_date },
    });

    const correction = await AttendanceCorrection.create({
      employee_id: employeeId,
      attendance_id: attendance?.id || null,
      attendance_date: dto.attendance_date,
      existing_login_time: formatTimeHHMM(attendance?.clock_in) || 'Not Recorded',
      requested_login_time: dto.requested_login_time,
      existing_logout_time: formatTimeHHMM(attendance?.clock_out) || 'Not Recorded',
      requested_logout_time: dto.requested_logout_time,
      reason: dto.reason.trim(),
      status: 'Pending',
    });

    const emp = await Employee.findByPk(employeeId);
    await notificationService.notifyAdmins(
      'AttendanceCorrection',
      'New Attendance Correction Request',
      `${emp?.full_name || 'An employee'} requested an attendance correction for ${dto.attendance_date}.`,
      '/admin/attendance-corrections'
    );

    await auditLogService.log({
      userId,
      action: 'SUBMIT_ATTENDANCE_CORRECTION',
      entityType: 'AttendanceCorrection',
      entityId: correction.id,
      newValues: dto,
    });

    return correction;
  }

  public async getMyCorrections(employeeId: number, status?: string) {
    const where: Record<string, unknown> = { employee_id: employeeId };
    if (status && status !== 'All') where.status = status;
    return AttendanceCorrection.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  public async adminListCorrections(status?: string) {
    const where: Record<string, unknown> = {};
    if (status && status !== 'All') where.status = status;
    return AttendanceCorrection.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'employee_code', 'full_name', 'department_id'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  public async reviewCorrection(
    correctionId: number,
    adminUserId: number,
    action: 'Approved' | 'Rejected',
    rejectionReason?: string
  ) {
    const correction = await AttendanceCorrection.findByPk(correctionId);
    if (!correction) throw new AppError('Attendance correction request not found.', 404);
    if (correction.status !== 'Pending') {
      throw new AppError(`This request has already been ${correction.status.toLowerCase()}.`, 400);
    }
    if (action === 'Rejected' && !rejectionReason?.trim()) {
      throw new AppError('Rejection reason is required when rejecting a correction request.', 400);
    }

    await sequelize.transaction(async (t) => {
      correction.status = action;
      correction.reviewed_by = adminUserId;
      correction.reviewed_at = new Date();
      correction.rejection_reason = action === 'Rejected' ? rejectionReason!.trim() : null;
      await correction.save({ transaction: t });

      if (action === 'Approved') {
        const loginDt = new Date(`${correction.attendance_date}T${correction.requested_login_time}:00`);
        const logoutDt = new Date(`${correction.attendance_date}T${correction.requested_logout_time}:00`);

        if (isNaN(loginDt.getTime()) || isNaN(logoutDt.getTime()) || logoutDt <= loginDt) {
          throw new AppError('Requested logout time must be after requested login time.', 400);
        }

        const lateMinutes = calculateLateMinutes(loginDt);
        const { workingMinutes, workingHours } = calculateWorkingDuration(loginDt, logoutDt);
        const status = determineAttendanceStatus(lateMinutes, workingHours);

        let attendance = await Attendance.findOne({
          where: { employee_id: correction.employee_id, date: correction.attendance_date },
          transaction: t,
        });

        const oldState = attendance ? attendance.toJSON() : null;

        if (attendance) {
          attendance.clock_in = loginDt;
          attendance.clock_out = logoutDt;
          attendance.working_minutes = workingMinutes;
          attendance.working_hours = workingHours;
          attendance.late_minutes = lateMinutes;
          attendance.status = status;
          attendance.is_corrected = true;
          attendance.is_approved = true;
          await attendance.save({ transaction: t });
        } else {
          attendance = await Attendance.create(
            {
              employee_id: correction.employee_id,
              date: correction.attendance_date,
              clock_in: loginDt,
              clock_out: logoutDt,
              working_minutes: workingMinutes,
              working_hours: workingHours,
              late_minutes: lateMinutes,
              status,
              is_corrected: true,
              is_approved: true,
            },
            { transaction: t }
          );
          correction.attendance_id = attendance.id;
          await correction.save({ transaction: t });
        }

        await AttendanceLog.create(
          {
            attendance_id: attendance.id,
            employee_id: correction.employee_id,
            action: 'CORRECTION_APPLIED',
            timestamp: new Date(),
            metadata: JSON.stringify({ correctionId: correction.id, oldState }),
          },
          { transaction: t }
        );

        await EmployeeHistory.create(
          {
            employee_id: correction.employee_id,
            event_type: 'AttendanceCorrection',
            title: `Attendance Corrected (${correction.attendance_date})`,
            description: `Approved correction to ${correction.requested_login_time} - ${correction.requested_logout_time}`,
            old_value: `${correction.existing_login_time} - ${correction.existing_logout_time}`,
            new_value: `${correction.requested_login_time} - ${correction.requested_logout_time}`,
            performed_by: adminUserId,
          },
          { transaction: t }
        );
      }
    });

    await notificationService.notifyEmployee(
      correction.employee_id,
      'AttendanceCorrection',
      `Attendance Correction ${action}`,
      action === 'Approved'
        ? `Your attendance correction for ${correction.attendance_date} has been approved and updated.`
        : `Your attendance correction for ${correction.attendance_date} was rejected. Reason: ${rejectionReason}`,
      '/employee/attendance-correction'
    );

    await auditLogService.log({
      userId: adminUserId,
      action: `ATTENDANCE_CORRECTION_${action.toUpperCase()}`,
      entityType: 'AttendanceCorrection',
      entityId: correction.id,
      newValues: { status: action, rejectionReason },
    });

    return correction;
  }
}

export default new AttendanceCorrectionService();
