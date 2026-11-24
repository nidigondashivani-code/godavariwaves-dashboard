import { Op } from 'sequelize';
import {
  Attendance,
  AttendanceCorrection,
  LeaveRequest,
  LeaveType,
  Task,
  WorkUpdate,
  PerformanceReview,
  ProfileUpdateRequest,
  EmployeeHistory,
} from '../models';

export class HistoryService {
  public async getConsolidatedHistory(
    employeeId: number,
    filters: {
      section?: string;
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 15));
    const search = filters.search?.trim().toLowerCase() || '';
    const status = filters.status && filters.status !== 'All' ? filters.status : undefined;
    const section = filters.section || 'all';

    const dateRange =
      filters.startDate && filters.endDate
        ? { [Op.between]: [filters.startDate, filters.endDate] }
        : filters.startDate
        ? { [Op.gte]: filters.startDate }
        : filters.endDate
        ? { [Op.lte]: filters.endDate }
        : undefined;

    const [
      attendance,
      leaves,
      tasks,
      workUpdates,
      performanceReviews,
      profileUpdates,
      attendanceCorrections,
      timelineEvents,
    ] = await Promise.all([
      section === 'all' || section === 'attendance'
        ? Attendance.findAll({
            where: {
              employee_id: employeeId,
              ...(status ? { status } : {}),
              ...(dateRange ? { date: dateRange } : {}),
            },
            order: [['date', 'DESC']],
          })
        : Promise.resolve([]),
      section === 'all' || section === 'leave'
        ? LeaveRequest.findAll({
            where: {
              employee_id: employeeId,
              ...(status ? { status } : {}),
              ...(dateRange ? { start_date: dateRange } : {}),
            },
            include: [{ model: LeaveType, as: 'leaveType', attributes: ['id', 'name', 'code'] }],
            order: [['createdAt', 'DESC']],
          })
        : Promise.resolve([]),
      section === 'all' || section === 'task'
        ? Task.findAll({
            where: {
              assigned_to: employeeId,
              ...(status ? { status } : {}),
              ...(dateRange ? { due_date: dateRange } : {}),
            },
            order: [['updatedAt', 'DESC']],
          })
        : Promise.resolve([]),
      section === 'all' || section === 'work_update'
        ? WorkUpdate.findAll({
            where: {
              employee_id: employeeId,
              ...(status ? { status } : {}),
              ...(dateRange ? { work_date: dateRange } : {}),
            },
            order: [['work_date', 'DESC']],
          })
        : Promise.resolve([]),
      section === 'all' || section === 'performance'
        ? PerformanceReview.findAll({
            where: {
              employee_id: employeeId,
              ...(status ? { status } : {}),
              ...(dateRange ? { review_date: dateRange } : {}),
            },
            order: [['review_date', 'DESC']],
          })
        : Promise.resolve([]),
      section === 'all' || section === 'profile'
        ? ProfileUpdateRequest.findAll({
            where: {
              employee_id: employeeId,
              ...(status ? { status } : {}),
            },
            order: [['createdAt', 'DESC']],
          })
        : Promise.resolve([]),
      section === 'all' || section === 'attendance_correction'
        ? AttendanceCorrection.findAll({
            where: {
              employee_id: employeeId,
              ...(status ? { status } : {}),
              ...(dateRange ? { attendance_date: dateRange } : {}),
            },
            order: [['createdAt', 'DESC']],
          })
        : Promise.resolve([]),
      EmployeeHistory.findAll({
        where: { employee_id: employeeId },
        order: [['createdAt', 'DESC']],
        limit: 50,
      }),
    ]);

    const filterBySearch = <T extends object>(items: T[]): T[] => {
      if (!search) return items;
      return items.filter((item) => JSON.stringify(item).toLowerCase().includes(search));
    };

    const paginate = <T>(items: T[]) => {
      const start = (page - 1) * limit;
      return {
        items: items.slice(start, start + limit),
        total: items.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(items.length / limit)),
      };
    };

    return {
      attendance: paginate(filterBySearch(attendance.map((r) => r.toJSON()))),
      leaves: paginate(filterBySearch(leaves.map((r) => r.toJSON()))),
      tasks: paginate(filterBySearch(tasks.map((r) => r.toJSON()))),
      workUpdates: paginate(filterBySearch(workUpdates.map((r) => r.toJSON()))),
      performanceReviews: paginate(filterBySearch(performanceReviews.map((r) => r.toJSON()))),
      profileUpdates: paginate(filterBySearch(profileUpdates.map((r) => r.toJSON()))),
      attendanceCorrections: paginate(filterBySearch(attendanceCorrections.map((r) => r.toJSON()))),
      timeline: timelineEvents,
    };
  }
}

export default new HistoryService();
