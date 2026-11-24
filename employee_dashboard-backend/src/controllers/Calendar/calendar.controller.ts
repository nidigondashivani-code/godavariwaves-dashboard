import { Request, Response, NextFunction } from 'express';
import calendarService from '../../services/calendar.service';
import { sendSuccess } from '../../utils/apiResponse.util';
import { ADMIN_ROLES } from '../../constants/roles.constants';

export class CalendarController {
  public async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const startDate = (req.query.startDate as string) || `${y}-${m}-01`;
      const endDate =
        (req.query.endDate as string) ||
        `${y}-${m}-${String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

      const isAdmin = ADMIN_ROLES.includes(req.user!.role);
      const events = await calendarService.getUnifiedEvents({
        startDate,
        endDate,
        employeeId: req.user!.employeeId,
        departmentId: req.user!.departmentId,
        isAdmin,
      });
      sendSuccess(res, events, 'Calendar events retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await calendarService.createEvent(req.user!.userId, req.body);
      sendSuccess(res, event, 'Calendar event created', 201);
    } catch (error) {
      next(error);
    }
  }

  public async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await calendarService.deleteEvent(Number(req.params.id));
      sendSuccess(res, { deleted: true }, 'Calendar event deleted');
    } catch (error) {
      next(error);
    }
  }

  public async listHolidays(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      const holidays = await calendarService.listHolidays(year);
      sendSuccess(res, holidays, 'Holidays retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async createHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const holiday = await calendarService.createHoliday(req.body);
      sendSuccess(res, holiday, 'Holiday added', 201);
    } catch (error) {
      next(error);
    }
  }

  public async deleteHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await calendarService.deleteHoliday(Number(req.params.id));
      sendSuccess(res, { deleted: true }, 'Holiday deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default new CalendarController();
