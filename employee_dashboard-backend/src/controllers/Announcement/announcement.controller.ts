import { Request, Response, NextFunction } from 'express';
import announcementService from '../../services/announcement.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class AnnouncementController {
  public async getForEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await announcementService.getForEmployee(
        req.user!.employeeId!,
        req.user!.departmentId
      );
      sendSuccess(res, data, 'Announcements retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await announcementService.markAsRead(
        Number(req.params.id),
        req.user!.employeeId!
      );
      sendSuccess(res, data, 'Announcement marked as read');
    } catch (error) {
      next(error);
    }
  }

  public async adminList(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await announcementService.adminListAll();
      sendSuccess(res, data, 'All announcements retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.attachment_url || null;
      const data = await announcementService.create(req.user!.userId, {
        ...req.body,
        department_id: req.body.department_id ? Number(req.body.department_id) : null,
        attachment_url: attachmentUrl,
      });
      sendSuccess(res, data, 'Announcement created', 201);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await announcementService.update(
        Number(req.params.id),
        req.user!.userId,
        req.body
      );
      sendSuccess(res, data, 'Announcement updated');
    } catch (error) {
      next(error);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await announcementService.remove(Number(req.params.id), req.user!.userId);
      sendSuccess(res, { deleted: true }, 'Announcement deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default new AnnouncementController();
