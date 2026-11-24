import { Request, Response, NextFunction } from 'express';
import settingsService from '../../services/settings.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class SettingsController {
  public async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await settingsService.getAllSettings();
      sendSuccess(res, data, 'Settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body.settings || [];
      const data = await settingsService.updateSettings(items);
      sendSuccess(res, data, 'Settings updated');
    } catch (error) {
      next(error);
    }
  }

  public async getReports(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await settingsService.getReportsSummary();
      sendSuccess(res, data, 'Reports summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getMyPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await settingsService.getMyPerformanceReviews(req.user!.employeeId!);
      sendSuccess(res, data, 'Performance reviews retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async createPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await settingsService.createPerformanceReview(req.user!.userId, req.body);
      sendSuccess(res, data, 'Performance review recorded', 201);
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
