import { Request, Response, NextFunction } from 'express';
import teamLeaveRuleService from '../services/teamLeaveRule.service';
import leaveService from '../services/leave.service';
import { sendSuccess } from '../utils/apiResponse.util';

export class TeamLeaveRuleController {
  public async getRules(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rules = await teamLeaveRuleService.getAllRules();
      sendSuccess(res, rules, 'Team leave rules retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getRuleByTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await teamLeaveRuleService.getRuleByTeamId(Number(req.params.teamId));
      sendSuccess(res, rule, 'Team leave rule retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async createRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await teamLeaveRuleService.createRule(req.body);
      sendSuccess(res, rule, 'Rule created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async updateRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await teamLeaveRuleService.updateRule(Number(req.params.id), req.body);
      sendSuccess(res, rule, 'Rule updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async deleteRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await teamLeaveRuleService.deleteRule(Number(req.params.id));
      sendSuccess(res, { deleted: true }, 'Rule deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getTeamAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await teamLeaveRuleService.getTeamAvailability(
        Number(req.params.teamId),
        req.query.date as string | undefined
      );
      sendSuccess(res, data, 'Team availability computed');
    } catch (error) {
      next(error);
    }
  }

  public async checkConflict(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user?.employeeId || Number(req.body.employee_id);
      const calc = await leaveService.calculateLeaveDays(req.body.start_date, req.body.end_date);
      const result = await leaveService.evaluateTeamLeaveRules(employeeId, calc.workingDates);
      sendSuccess(res, result, 'Conflict check completed');
    } catch (error) {
      next(error);
    }
  }

  public async getConflictHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await teamLeaveRuleService.getConflictHistory(
        req.query.teamId ? Number(req.query.teamId) : undefined
      );
      sendSuccess(res, data, 'Leave conflict history retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new TeamLeaveRuleController();
