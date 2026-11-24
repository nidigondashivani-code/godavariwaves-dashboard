import { Request, Response, NextFunction } from 'express';
import historyService from '../../services/history.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class HistoryController {
  public async getMyHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Strictly scoped to authenticated employee ID — never trusts query/body employeeId
      const data = await historyService.getConsolidatedHistory(req.user!.employeeId!, {
        section: req.query.section as string | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 15,
      });
      sendSuccess(res, data, 'Employee history retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async adminGetEmployeeHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await historyService.getConsolidatedHistory(Number(req.params.employeeId), {
        section: req.query.section as string | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 15,
      });
      sendSuccess(res, data, 'Employee history retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new HistoryController();
