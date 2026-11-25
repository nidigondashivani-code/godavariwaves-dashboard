import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { Attendance, AttendanceLog, Employee, Department, Setting, WorkUpdate } from '../models';
import { AppError } from '../utils/appError.util';
import { getTodayDateString } from '../utils/dateUtils.util';
import {
  calculateLateMinutes,
  calculateWorkingDuration,
  determineAttendanceStatus,
} from '../helpers/attendanceCalculator.helper';
import { OFFICE_POLICY } from '../constants/officePolicy.constants';
import auditLogService from './auditLog.service';

export class AttendanceService {
  private async getOfficePolicySettings() {
    const rows = await Setting.findAll({ where: { group: 'office_policy' } });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      startTime: map.get('office_start_time') || OFFICE_POLICY.START_TIME,
      gracePeriodMinutes: parseInt(map.get('grace_period_minutes') || String(OFFICE_POLICY.GRACE_PERIOD_MINUTES), 10),
      halfDayHours: parseFloat(map.get('half_day_hours') || String(OFFICE_POLICY.HALF_DAY_HOURS)),
    };
  }

  public async clockIn(employeeId: number, userId: number, ipAddress?: string, notes?: string) {
    const today = getTodayDateString();
    const existing = await Attendance.findOne({ where: { employee_id: employeeId, date: today } });
    if (existing && existing.clock_in) {
      throw new AppError('You have already clocked in today. Duplicate clock-in is not allowed.', 409);
    }

    const now = new Date(); // Strictly server-side timestamp
    const policy = await this.getOfficePolicySettings();
    const lateMinutes = calculateLateMinutes(now, policy.startTime, policy.gracePeriodMinutes);
    const status = lateMinutes > 0 ? 'Late' : 'Present';

    let attendance: Attendance;
    if (existing) {
      existing.clock_in = now;
      existing.late_minutes = lateMinutes;
      existing.status = status;
      if (notes) existing.notes = notes;
      await existing.save();
      attendance = existing;
    } else {
      attendance = await Attendance.create({
        employee_id: employeeId,
        date: today,
        clock_in: now,
        late_minutes: lateMinutes,
        working_minutes: 0,
        working_hours: 0,
        status,
        notes: notes || null,
        is_corrected: false,
        is_approved: false,
      });
    }

    await AttendanceLog.create({
      attendance_id: attendance.id,
      employee_id: employeeId,
      action: 'CLOCK_IN',
      timestamp: now,
      ip_address: ipAddress || null,
      metadata: JSON.stringify({ lateMinutes, status }),
    });

    await auditLogService.log({
      userId,
      action: 'CLOCK_IN',
      entityType: 'Attendance',
      entityId: attendance.id,
      newValues: { date: today, clock_in: now.toISOString(), status, lateMinutes },
      ipAddress,
    });

    return attendance;
  }

  public async clockOut(employeeId: number, userId: number, ipAddress?: string, notes?: string) {
    const today = getTodayDateString();
    const attendance = await Attendance.findOne({ where: { employee_id: employeeId, date: today } });
    if (!attendance || !attendance.clock_in) {
      throw new AppError('Cannot clock out without clocking in first.', 400);
    }
    if (attendance.clock_out) {
      throw new AppError('You have already clocked out for today.', 409);
    }
    if (attendance.is_approved) {
      throw new AppError('Approved attendance records cannot be modified directly.', 403);
    }

    // Rule 1: Mandatory Daily Work Update check before clocking out
    const workUpdate = await WorkUpdate.findOne({
      where: {
        employee_id: employeeId,
        work_date: today,
      },
    });
    if (!workUpdate || !workUpdate.work_description?.trim()) {
      throw new AppError(
        'Mandatory Logout Policy: You must submit your Daily Work Update (Work Completed Today and Progress Percentage) before clocking out.',
        422
      );
    }

    const now = new Date(); // Strictly server-side timestamp
    const policy = await this.getOfficePolicySettings();
    const { workingMinutes, workingHours } = calculateWorkingDuration(new Date(attendance.clock_in), now);
    const status = determineAttendanceStatus(attendance.late_minutes, workingHours, policy.halfDayHours);

    attendance.clock_out = now;
    attendance.working_minutes = workingMinutes;
    attendance.working_hours = workingHours;
    attendance.status = status;
    if (notes) attendance.notes = notes;
    await attendance.save();

    await AttendanceLog.create({
      attendance_id: attendance.id,
      employee_id: employeeId,
      action: 'CLOCK_OUT',
      timestamp: now,
      ip_address: ipAddress || null,
      metadata: JSON.stringify({ workingMinutes, workingHours, status }),
    });

    await auditLogService.log({
      userId,
      action: 'CLOCK_OUT',
      entityType: 'Attendance',
      entityId: attendance.id,
      newValues: { date: today, clock_out: now.toISOString(), workingHours, status },
      ipAddress,
    });

    return attendance;
  }

  public async getTodayAttendance(employeeId: number) {
    const today = getTodayDateString();
    return Attendance.findOne({ where: { employee_id: employeeId, date: today } });
  }

  public async getHistory(
    employeeId: number,
    filters: { startDate?: string; endDate?: string; status?: string; page?: number; limit?: number }
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const where: Record<string, unknown> = { employee_id: employeeId };

    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<symbol, string> = {};
      if (filters.startDate) dateFilter[Op.gte] = filters.startDate;
      if (filters.endDate) dateFilter[Op.lte] = filters.endDate;
      where.date = dateFilter;
    }

    const { rows, count } = await Attendance.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    return {
      records: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  public async getMonthlyAttendance(employeeId: number, year: number, month: number) {
    const m = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${year}-${m}-01`;
    const endDate = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;

    const records = await Attendance.findAll({
      where: {
        employee_id: employeeId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'ASC']],
    });

    const summary = {
      present: records.filter((r) => r.status === 'Present').length,
      late: records.filter((r) => r.status === 'Late').length,
      halfDay: records.filter((r) => r.status === 'Half Day').length,
      absent: records.filter((r) => r.status === 'Absent').length,
      onLeave: records.filter((r) => r.status === 'On Leave').length,
      totalWorkingHours: Number(
        records.reduce((acc, r) => acc + Number(r.working_hours || 0), 0).toFixed(2)
      ),
      totalLateMinutes: records.reduce((acc, r) => acc + Number(r.late_minutes || 0), 0),
    };

    return { year, month, startDate, endDate, records, summary };
  }

  public async getSummary(employeeId: number) {
    const now = new Date();
    const monthly = await this.getMonthlyAttendance(employeeId, now.getFullYear(), now.getMonth() + 1);
    const today = await this.getTodayAttendance(employeeId);
    return { today, monthlySummary: monthly.summary };
  }

  public async exportAttendanceExcel(employeeId: number, startDate?: string, endDate?: string): Promise<Buffer> {
    const where: Record<string, unknown> = { employee_id: employeeId };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    const [employee, records] = await Promise.all([
      Employee.findByPk(employeeId),
      Attendance.findAll({ where, order: [['date', 'DESC']] }),
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance History');

    sheet.columns = [
      { header: 'Employee Code', key: 'code', width: 18 },
      { header: 'Employee Name', key: 'name', width: 24 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Clock In', key: 'clockIn', width: 20 },
      { header: 'Clock Out', key: 'clockOut', width: 20 },
      { header: 'Working Hours', key: 'hours', width: 15 },
      { header: 'Late Minutes', key: 'late', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    for (const r of records) {
      sheet.addRow({
        code: employee?.employee_code || '',
        name: employee?.full_name || '',
        date: r.date,
        clockIn: r.clock_in ? new Date(r.clock_in).toLocaleTimeString() : '-',
        clockOut: r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : '-',
        hours: Number(r.working_hours || 0),
        late: r.late_minutes || 0,
        status: r.status,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  public async adminListAttendance(filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
    departmentId?: number;
    status?: string;
    employeeId?: number;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 30));
    const where: Record<string, unknown> = {};

    if (filters.date) where.date = filters.date;
    else if (filters.startDate && filters.endDate) {
      where.date = { [Op.between]: [filters.startDate, filters.endDate] };
    }
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.employeeId) where.employee_id = filters.employeeId;

    const empWhere: Record<string, unknown> = {};
    if (filters.departmentId) empWhere.department_id = filters.departmentId;

    const { rows, count } = await Attendance.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          where: Object.keys(empWhere).length ? empWhere : undefined,
          attributes: ['id', 'employee_code', 'full_name', 'department_id', 'profile_picture'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    return {
      records: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  public async adminDirectCorrect(
    adminUserId: number,
    data: {
      employeeId: number;
      date: string;
      loginTime?: string | null;
      logoutTime?: string | null;
      reason: string;
    }
  ) {
    const { employeeId, date, loginTime, logoutTime, reason } = data;
    if (!employeeId || !date) {
      throw new AppError('Employee ID and date are required.', 400);
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError('Employee not found.', 404);

    let clockIn: Date | null = null;
    let clockOut: Date | null = null;

    if (loginTime) {
      const cleanTime = loginTime.length === 5 ? `${loginTime}:00` : loginTime;
      clockIn = new Date(`${date}T${cleanTime}`);
      if (isNaN(clockIn.getTime())) throw new AppError('Invalid login time format (expected HH:mm).', 400);
    }

    if (logoutTime) {
      const cleanTime = logoutTime.length === 5 ? `${logoutTime}:00` : logoutTime;
      clockOut = new Date(`${date}T${cleanTime}`);
      if (isNaN(clockOut.getTime())) throw new AppError('Invalid logout time format (expected HH:mm).', 400);
    }

    if (clockIn && clockOut && clockOut <= clockIn) {
      throw new AppError('Logout time must be after login time.', 400);
    }

    const policy = await this.getOfficePolicySettings();
    let lateMinutes = 0;
    let workingMinutes = 0;
    let workingHours = 0;
    let status: 'Present' | 'Late' | 'Half Day' | 'Absent' = 'Absent';

    if (clockIn) {
      lateMinutes = calculateLateMinutes(clockIn, policy.startTime, policy.gracePeriodMinutes);
      if (clockOut) {
        const duration = calculateWorkingDuration(clockIn, clockOut);
        workingMinutes = duration.workingMinutes;
        workingHours = duration.workingHours;
        status = determineAttendanceStatus(lateMinutes, workingHours, policy.halfDayHours);
      } else {
        status = lateMinutes > 0 ? 'Late' : 'Present';
      }
    }

    let record = await Attendance.findOne({ where: { employee_id: employeeId, date } });
    const oldState = record ? record.toJSON() : null;

    if (record) {
      record.clock_in = clockIn;
      record.clock_out = clockOut;
      record.late_minutes = lateMinutes;
      record.working_minutes = workingMinutes;
      record.working_hours = workingHours;
      record.status = status;
      record.is_corrected = true;
      record.is_approved = true;
      record.notes = reason ? `Admin correction: ${reason}` : record.notes;
      await record.save();
    } else {
      record = await Attendance.create({
        employee_id: employeeId,
        date,
        clock_in: clockIn,
        clock_out: clockOut,
        late_minutes: lateMinutes,
        working_minutes: workingMinutes,
        working_hours: workingHours,
        status,
        is_corrected: true,
        is_approved: true,
        notes: reason ? `Admin correction: ${reason}` : null,
      });
    }

    await AttendanceLog.create({
      attendance_id: record.id,
      employee_id: employeeId,
      action: 'CORRECTION_APPLIED',
      timestamp: new Date(),
      metadata: JSON.stringify({ adminUserId, reason, oldState }),
    });

    await auditLogService.log({
      userId: adminUserId,
      action: 'ADMIN_ATTENDANCE_CORRECTION',
      entityType: 'Attendance',
      entityId: record.id,
      newValues: { date, clock_in: clockIn, clock_out: clockOut, status, lateMinutes, workingHours },
    });

    return record;
  }
}

export default new AttendanceService();
