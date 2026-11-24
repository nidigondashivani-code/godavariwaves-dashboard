import { Request, Response, NextFunction } from 'express';
import workUpdateService from '../../services/workUpdate.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class WorkUpdateController {
  public async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.attachment_url || null;
      const result = await workUpdateService.submitWorkUpdate(
        req.user!.employeeId!,
        req.user!.userId,
        {
          work_date: req.body.work_date,
          work_description: req.body.work_description,
          tasks_completed: req.body.tasks_completed,
          progress: req.body.progress !== undefined ? Number(req.body.progress) : 0,
          hours_spent: req.body.hours_spent !== undefined ? Number(req.body.hours_spent) : 0,
          attachment_url: attachmentUrl,
        }
      );
      sendSuccess(res, result, 'Daily work update submitted', 201);
    } catch (error) {
      next(error);
    }
  }

  public async editMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.attachment_url;
      const result = await workUpdateService.editMyWorkUpdate(
        Number(req.params.id),
        req.user!.employeeId!,
        req.user!.userId,
        {
          work_description: req.body.work_description,
          tasks_completed: req.body.tasks_completed,
          progress: req.body.progress !== undefined ? Number(req.body.progress) : undefined,
          hours_spent: req.body.hours_spent !== undefined ? Number(req.body.hours_spent) : undefined,
          attachment_url: attachmentUrl,
        }
      );
      sendSuccess(res, result, 'Work update resubmitted');
    } catch (error) {
      next(error);
    }
  }

  public async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await workUpdateService.getMyWorkUpdates(req.user!.employeeId!, {
        status: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      sendSuccess(res, data, 'Work updates retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async adminList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await workUpdateService.adminListWorkUpdates({
        status: req.query.status as string | undefined,
        departmentId: req.query.departmentId ? Number(req.query.departmentId) : undefined,
        employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
        workDate: req.query.workDate as string | undefined,
      });
      sendSuccess(res, data, 'All work updates retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async review(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await workUpdateService.reviewWorkUpdate(
        Number(req.params.id),
        req.user!.userId,
        req.body.status,
        req.body.feedback || req.body.admin_feedback
      );
      sendSuccess(res, result, `Work update marked as ${req.body.status}`);
    } catch (error) {
      next(error);
    }
  }
}

export default new WorkUpdateController();
