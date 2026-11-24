import { Request, Response, NextFunction } from 'express';
import attendanceCorrectionService from '../../services/attendanceCorrection.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class AttendanceCorrectionController {
  public async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attendanceCorrectionService.submitCorrection(
        req.user!.employeeId!,
        req.user!.userId,
        req.body
      );
      sendSuccess(res, result, 'Attendance correction request submitted', 201);
    } catch (error) {
      next(error);
    }
  }

  public async getMyCorrections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await attendanceCorrectionService.getMyCorrections(
        req.user!.employeeId!,
        req.query.status as string | undefined
      );
      sendSuccess(res, data, 'Attendance correction history retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async adminList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await attendanceCorrectionService.adminListCorrections(
        req.query.status as string | undefined
      );
      sendSuccess(res, data, 'Attendance correction requests fetched');
    } catch (error) {
      next(error);
    }
  }

  public async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attendanceCorrectionService.reviewCorrection(
        Number(req.params.id),
        req.user!.userId,
        'Approved'
      );
      sendSuccess(res, result, 'Attendance correction approved and record updated');
    } catch (error) {
      next(error);
    }
  }

  public async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attendanceCorrectionService.reviewCorrection(
        Number(req.params.id),
        req.user!.userId,
        'Rejected',
        req.body?.rejection_reason
      );
      sendSuccess(res, result, 'Attendance correction rejected');
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceCorrectionController();
