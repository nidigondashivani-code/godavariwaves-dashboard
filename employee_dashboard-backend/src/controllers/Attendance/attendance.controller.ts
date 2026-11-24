import { Request, Response, NextFunction } from 'express';
import attendanceService from '../../services/attendance.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class AttendanceController {
  public async clockIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.clockIn(
        req.user!.employeeId!,
        req.user!.userId,
        req.ip,
        req.body?.notes
      );
      sendSuccess(res, record, 'Clocked in successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async clockOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.clockOut(
        req.user!.employeeId!,
        req.user!.userId,
        req.ip,
        req.body?.notes
      );
      sendSuccess(res, record, 'Clocked out successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getToday(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.getTodayAttendance(req.user!.employeeId!);
      sendSuccess(res, record, "Today's attendance retrieved");
    } catch (error) {
      next(error);
    }
  }

  public async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await attendanceService.getHistory(req.user!.employeeId!, {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        status: req.query.status as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      });
      sendSuccess(res, data, 'Attendance history retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getMonthly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = new Date();
      const year = req.query.year ? Number(req.query.year) : now.getFullYear();
      const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
      const data = await attendanceService.getMonthlyAttendance(req.user!.employeeId!, year, month);
      sendSuccess(res, data, 'Monthly attendance retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await attendanceService.getSummary(req.user!.employeeId!);
      sendSuccess(res, data, 'Attendance summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async exportMyAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buffer = await attendanceService.exportAttendanceExcel(
        req.user!.employeeId!,
        req.query.startDate as string | undefined,
        req.query.endDate as string | undefined
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="attendance_history.xlsx"');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  public async adminList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await attendanceService.adminListAttendance({
        date: req.query.date as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        departmentId: req.query.departmentId ? Number(req.query.departmentId) : undefined,
        status: req.query.status as string | undefined,
        employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 30,
      });
      sendSuccess(res, data, 'Admin attendance records retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
