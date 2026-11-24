import { Setting, PerformanceReview, Employee, Department, Attendance, LeaveRequest, Task } from '../models';
import { AppError } from '../utils/appError.util';
import { getTodayDateString } from '../utils/dateUtils.util';

export class SettingsService {
  public async getAllSettings() {
    const rows = await Setting.findAll({ order: [['group', 'ASC'], ['key', 'ASC']] });
    return rows;
  }

  public async updateSettings(items: Array<{ key: string; value: string; group?: string; description?: string }>) {
    for (const item of items) {
      const [setting] = await Setting.findOrCreate({
        where: { key: item.key },
        defaults: {
          key: item.key,
          value: String(item.value),
          group: item.group || 'general',
          description: item.description || null,
        },
      });
      setting.value = String(item.value);
      await setting.save();
    }
    return this.getAllSettings();
  }

  public async createPerformanceReview(
    reviewerId: number,
    dto: {
      employee_id: number;
      review_period: string;
      rating: number;
      goals_achieved?: string;
      strengths?: string;
      areas_for_improvement?: string;
      comments?: string;
    }
  ) {
    if (!dto.employee_id || !dto.review_period || dto.rating === undefined) {
      throw new AppError('Employee, review period, and rating are required.', 400);
    }
    return PerformanceReview.create({
      employee_id: dto.employee_id,
      reviewer_id: reviewerId,
      review_period: dto.review_period,
      rating: Number(dto.rating),
      goals_achieved: dto.goals_achieved || null,
      strengths: dto.strengths || null,
      areas_for_improvement: dto.areas_for_improvement || null,
      comments: dto.comments || null,
      status: 'Completed',
      review_date: getTodayDateString(),
    });
  }

  public async getMyPerformanceReviews(employeeId: number) {
    return PerformanceReview.findAll({
      where: { employee_id: employeeId },
      order: [['review_date', 'DESC']],
    });
  }

  public async getReportsSummary() {
    const [employees, attendance, leaves, tasks, departments] = await Promise.all([
      Employee.count(),
      Attendance.findAll(),
      LeaveRequest.findAll(),
      Task.findAll(),
      Department.findAll({ include: [{ model: Employee, as: 'employees', attributes: ['id'] }] }),
    ]);

    return {
      totalEmployees: employees,
      attendanceStats: {
        totalRecords: attendance.length,
        present: attendance.filter((a) => a.status === 'Present').length,
        late: attendance.filter((a) => a.status === 'Late').length,
        halfDay: attendance.filter((a) => a.status === 'Half Day').length,
        absent: attendance.filter((a) => a.status === 'Absent').length,
        onLeave: attendance.filter((a) => a.status === 'On Leave').length,
      },
      leaveStats: {
        total: leaves.length,
        pending: leaves.filter((l) => l.status === 'Pending').length,
        approved: leaves.filter((l) => l.status === 'Approved').length,
        rejected: leaves.filter((l) => l.status === 'Rejected').length,
      },
      taskStats: {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === 'Pending').length,
        inProgress: tasks.filter((t) => t.status === 'In Progress').length,
        completed: tasks.filter((t) => t.status === 'Completed').length,
      },
      departmentBreakdown: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        employeeCount: ((d.get('employees') as Employee[]) || []).length,
      })),
    };
  }
}

export default new SettingsService();
