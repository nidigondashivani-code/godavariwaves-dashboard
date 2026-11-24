import { Op } from 'sequelize';
import { WorkUpdate, Employee, Department } from '../models';
import { AppError } from '../utils/appError.util';
import { getTodayDateString } from '../utils/dateUtils.util';
import notificationService from './notification.service';
import auditLogService from './auditLog.service';

export class WorkUpdateService {
  public async submitWorkUpdate(
    employeeId: number,
    userId: number,
    dto: {
      work_date?: string;
      work_description: string;
      tasks_completed?: string;
      progress?: number;
      hours_spent?: number;
      attachment_url?: string | null;
    }
  ) {
    if (!dto.work_description?.trim()) {
      throw new AppError('Work description is required.', 400);
    }

    const workDate = dto.work_date || getTodayDateString();
    const progress = Math.min(100, Math.max(0, Number(dto.progress ?? 0)));
    const hoursSpent = Math.min(24, Math.max(0, Number(dto.hours_spent ?? 0)));

    const update = await WorkUpdate.create({
      employee_id: employeeId,
      work_date: workDate,
      work_description: dto.work_description.trim(),
      tasks_completed: dto.tasks_completed?.trim() || null,
      progress,
      hours_spent: hoursSpent,
      attachment_url: dto.attachment_url || null,
      status: 'Pending Review',
    });

    const emp = await Employee.findByPk(employeeId);
    await notificationService.notifyAdmins(
      'WorkUpdate',
      'New Daily Work Update',
      `${emp?.full_name || 'An employee'} submitted a daily work update for ${workDate}.`,
      '/admin/work-updates'
    );

    await auditLogService.log({
      userId,
      action: 'SUBMIT_WORK_UPDATE',
      entityType: 'WorkUpdate',
      entityId: update.id,
      newValues: { workDate, progress, hoursSpent },
    });

    return update;
  }

  public async editMyWorkUpdate(
    id: number,
    employeeId: number,
    userId: number,
    dto: {
      work_description?: string;
      tasks_completed?: string;
      progress?: number;
      hours_spent?: number;
      attachment_url?: string | null;
    }
  ) {
    const record = await WorkUpdate.findOne({ where: { id, employee_id: employeeId } });
    if (!record) throw new AppError('Work update not found.', 404);
    if (record.status === 'Approved') {
      throw new AppError('Approved work updates cannot be edited.', 403);
    }

    if (dto.work_description !== undefined) record.work_description = dto.work_description.trim();
    if (dto.tasks_completed !== undefined) record.tasks_completed = dto.tasks_completed.trim();
    if (dto.progress !== undefined) record.progress = Math.min(100, Math.max(0, Number(dto.progress)));
    if (dto.hours_spent !== undefined) record.hours_spent = Math.min(24, Math.max(0, Number(dto.hours_spent)));
    if (dto.attachment_url !== undefined) record.attachment_url = dto.attachment_url;

    // Resubmitting resets status to Pending Review
    record.status = 'Pending Review';
    await record.save();

    await auditLogService.log({
      userId,
      action: 'RESUBMIT_WORK_UPDATE',
      entityType: 'WorkUpdate',
      entityId: record.id,
    });

    return record;
  }

  public async getMyWorkUpdates(
    employeeId: number,
    filters: { status?: string; startDate?: string; endDate?: string }
  ) {
    const where: Record<string, unknown> = { employee_id: employeeId };
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.startDate && filters.endDate) {
      where.work_date = { [Op.between]: [filters.startDate, filters.endDate] };
    }
    return WorkUpdate.findAll({
      where,
      order: [['work_date', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  public async adminListWorkUpdates(filters: {
    status?: string;
    departmentId?: number;
    employeeId?: number;
    workDate?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.employeeId) where.employee_id = filters.employeeId;
    if (filters.workDate) where.work_date = filters.workDate;

    const empWhere: Record<string, unknown> = {};
    if (filters.departmentId) empWhere.department_id = filters.departmentId;

    return WorkUpdate.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          where: Object.keys(empWhere).length ? empWhere : undefined,
          attributes: ['id', 'employee_code', 'full_name', 'department_id'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
      ],
      order: [['work_date', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  public async reviewWorkUpdate(
    id: number,
    adminUserId: number,
    status: 'Approved' | 'Rejected' | 'Revision Required',
    feedback?: string
  ) {
    const record = await WorkUpdate.findByPk(id);
    if (!record) throw new AppError('Work update not found.', 404);

    if ((status === 'Rejected' || status === 'Revision Required') && !feedback?.trim()) {
      throw new AppError('Feedback is required when rejecting or requesting revision.', 400);
    }

    record.status = status;
    record.admin_feedback = feedback?.trim() || null;
    record.reviewed_by = adminUserId;
    record.reviewed_at = new Date();
    await record.save();

    await notificationService.notifyEmployee(
      record.employee_id,
      'WorkUpdate',
      `Work Update ${status}`,
      feedback
        ? `Your work update for ${record.work_date} is marked "${status}". Feedback: ${feedback}`
        : `Your work update for ${record.work_date} has been ${status.toLowerCase()}.`,
      '/employee/work-updates'
    );

    await auditLogService.log({
      userId: adminUserId,
      action: `WORK_UPDATE_${status.replace(/\s+/g, '_').toUpperCase()}`,
      entityType: 'WorkUpdate',
      entityId: record.id,
      newValues: { status, feedback },
    });

    return record;
  }
}

export default new WorkUpdateService();
