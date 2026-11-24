import { Request, Response, NextFunction } from 'express';
import taskService from '../../services/task.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class TaskController {
  public async getMyTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await taskService.getMyTasks(req.user!.employeeId!, {
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        search: req.query.search as string | undefined,
      });
      sendSuccess(res, tasks, 'Assigned tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async updateMyTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.attachment_url || null;
      const task = await taskService.updateOwnTaskProgress(
        Number(req.params.id),
        req.user!.employeeId!,
        req.user!.userId,
        {
          status: req.body.status,
          progress: req.body.progress !== undefined ? Number(req.body.progress) : undefined,
          comment: req.body.comment,
          attachment_url: attachmentUrl,
        }
      );
      sendSuccess(res, task, 'Task progress updated');
    } catch (error) {
      next(error);
    }
  }

  public async adminListTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await taskService.adminListTasks({
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        departmentId: req.query.departmentId ? Number(req.query.departmentId) : undefined,
        employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
        delayedOnly: req.query.delayedOnly === 'true',
      });
      sendSuccess(res, data, 'All tasks and analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.createTask(req.user!.userId, req.body);
      sendSuccess(res, task, 'Task assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async adminUpdateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.adminUpdateTask(
        Number(req.params.id),
        req.user!.userId,
        req.body
      );
      sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async adminDeleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.adminDeleteTask(Number(req.params.id), req.user!.userId);
      sendSuccess(res, { deleted: true }, 'Task deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
