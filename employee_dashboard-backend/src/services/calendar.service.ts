import { Op } from 'sequelize';
import { Holiday, CalendarEvent, Employee, LeaveRequest, LeaveType } from '../models';
import { AppError } from '../utils/appError.util';

export class CalendarService {
  public async getUnifiedEvents(params: {
    startDate: string;
    endDate: string;
    employeeId?: number | null;
    departmentId?: number | null;
    isAdmin?: boolean;
  }) {
    const { startDate, endDate, employeeId, departmentId, isAdmin } = params;

    const [holidays, events, employeesWithDob, approvedLeaves] = await Promise.all([
      Holiday.findAll({
        where: { date: { [Op.between]: [startDate, endDate] } },
        order: [['date', 'ASC']],
      }),
      CalendarEvent.findAll({
        where: {
          start_date: { [Op.lte]: endDate },
          end_date: { [Op.gte]: startDate },
          ...(!isAdmin
            ? {
                [Op.or]: [
                  { department_id: null },
                  ...(departmentId ? [{ department_id: departmentId }] : []),
                ],
              }
            : {}),
        },
        order: [['start_date', 'ASC']],
      }),
      Employee.findAll({
        where: { employment_status: 'Active', date_of_birth: { [Op.ne]: null } },
        attributes: ['id', 'full_name', 'date_of_birth'],
      }),
      LeaveRequest.findAll({
        where: {
          status: 'Approved',
          start_date: { [Op.lte]: endDate },
          end_date: { [Op.gte]: startDate },
          ...(!isAdmin && employeeId ? { employee_id: employeeId } : {}),
        },
        include: [
          { model: Employee, as: 'employee', attributes: ['id', 'full_name'] },
          { model: LeaveType, as: 'leaveType', attributes: ['id', 'name', 'code'] },
        ],
      }),
    ]);

    const startYear = parseInt(startDate.slice(0, 4), 10) || new Date().getFullYear();
    const endYear = parseInt(endDate.slice(0, 4), 10) || startYear;
    const years = startYear === endYear ? [startYear] : [startYear, endYear];

    const birthdayItems: Array<Record<string, unknown>> = [];
    for (const emp of employeesWithDob) {
      if (!emp.date_of_birth) continue;
      const md = emp.date_of_birth.slice(5);
      for (const y of years) {
        const bDate = `${y}-${md}`;
        if (bDate >= startDate && bDate <= endDate) {
          birthdayItems.push({
            id: `birthday-${emp.id}-${y}`,
            title: `${emp.full_name}'s Birthday`,
            category: 'Birthday',
            startDate: bDate,
            endDate: bDate,
            isAllDay: true,
            description: `Wish ${emp.full_name} a Happy Birthday!`,
          });
        }
      }
    }

    const holidayItems = holidays.map((h) => ({
      id: `holiday-${h.id}`,
      rawId: h.id,
      title: h.name,
      category: `${h.type} Holiday`,
      holidayType: h.type,
      startDate: h.date,
      endDate: h.date,
      isAllDay: true,
      description: h.description || `${h.type} Holiday`,
    }));

    const eventItems = events.map((e) => ({
      id: `event-${e.id}`,
      rawId: e.id,
      title: e.title,
      category: e.event_type,
      startDate: e.start_date,
      endDate: e.end_date,
      startTime: e.start_time,
      endTime: e.end_time,
      location: e.location,
      isAllDay: e.is_all_day,
      description: e.description || '',
    }));

    const leaveItems = approvedLeaves.map((l) => {
      const emp = l.get('employee') as Employee | undefined;
      const lt = l.get('leaveType') as LeaveType | undefined;
      return {
        id: `leave-${l.id}`,
        rawId: l.id,
        title: `${emp?.full_name || 'Employee'} - ${lt?.name || 'Approved Leave'}`,
        category: 'Approved Leave',
        startDate: l.start_date,
        endDate: l.end_date,
        isAllDay: true,
        description: l.reason,
      };
    });

    return [...holidayItems, ...eventItems, ...birthdayItems, ...leaveItems].sort((a, b) =>
      String(a.startDate).localeCompare(String(b.startDate))
    );
  }

  public async createEvent(
    adminUserId: number,
    dto: {
      title: string;
      description?: string;
      event_type?: 'Holiday' | 'Meeting' | 'Birthday' | 'Company Event' | 'Activity' | 'Training';
      start_date: string;
      end_date?: string;
      start_time?: string;
      end_time?: string;
      location?: string;
      department_id?: number | null;
      is_all_day?: boolean;
    }
  ) {
    if (!dto.title?.trim() || !dto.start_date) {
      throw new AppError('Event title and start date are required.', 400);
    }
    return CalendarEvent.create({
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      event_type: dto.event_type || 'Company Event',
      start_date: dto.start_date,
      end_date: dto.end_date || dto.start_date,
      start_time: dto.start_time || null,
      end_time: dto.end_time || null,
      location: dto.location || null,
      department_id: dto.department_id ?? null,
      created_by: adminUserId,
      is_all_day: dto.is_all_day ?? false,
    });
  }

  public async deleteEvent(id: number) {
    const deleted = await CalendarEvent.destroy({ where: { id } });
    if (!deleted) throw new AppError('Calendar event not found.', 404);
    return { deleted: true };
  }

  public async listHolidays(year?: number) {
    const where: Record<string, unknown> = {};
    if (year) where.year = year;
    return Holiday.findAll({ where, order: [['date', 'ASC']] });
  }

  public async createHoliday(dto: {
    name: string;
    date: string;
    type?: 'National' | 'Festival' | 'Company' | 'Optional';
    description?: string;
    is_optional?: boolean;
  }) {
    if (!dto.name?.trim() || !dto.date) {
      throw new AppError('Holiday name and date are required.', 400);
    }
    const year = parseInt(dto.date.slice(0, 4), 10) || new Date().getFullYear();
    return Holiday.create({
      name: dto.name.trim(),
      date: dto.date,
      type: dto.type || 'Company',
      description: dto.description?.trim() || null,
      is_optional: dto.is_optional ?? dto.type === 'Optional',
      year,
    });
  }

  public async deleteHoliday(id: number) {
    const deleted = await Holiday.destroy({ where: { id } });
    if (!deleted) throw new AppError('Holiday not found.', 404);
    return { deleted: true };
  }
}

export default new CalendarService();
