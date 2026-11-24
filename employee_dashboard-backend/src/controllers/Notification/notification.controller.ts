import { Request, Response, NextFunction } from 'express';
import notificationService from '../../services/notification.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class NotificationController {
  public async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await notificationService.getForUser(req.user!.userId, {
        isRead: req.query.isRead as string | undefined,
        category: req.query.category as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 25,
      });
      sendSuccess(res, data, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await notificationService.markAsRead(Number(req.params.id), req.user!.userId);
      sendSuccess(res, data, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  public async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await notificationService.markAllAsRead(req.user!.userId);
      sendSuccess(res, { updated }, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
