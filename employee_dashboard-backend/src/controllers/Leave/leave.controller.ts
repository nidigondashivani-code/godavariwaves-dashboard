import { Request, Response, NextFunction } from 'express';
import leaveService from '../../services/leave.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class LeaveController {
  public async getLeaveTypes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await leaveService.getLeaveTypes();
      sendSuccess(res, data, 'Leave types retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async upsertLeaveType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await leaveService.upsertLeaveType(req.body);
      sendSuccess(res, data, 'Leave policy saved', 201);
    } catch (error) {
      next(error);
    }
  }

  public async previewDuration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start_date, end_date } = req.query as { start_date: string; end_date: string };
      const calc = await leaveService.calculateLeaveDays(start_date, end_date);
      const teamCheck = req.user?.employeeId
        ? await leaveService.evaluateTeamLeaveRules(req.user.employeeId, calc.workingDates)
        : { hasConflict: false, conflicts: [] };
      sendSuccess(res, { ...calc, teamCheck }, 'Leave duration preview computed');
    } catch (error) {
      next(error);
    }
  }

  public async getMyBalances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      const data = await leaveService.getEmployeeBalances(req.user!.employeeId!, year);
      sendSuccess(res, data, 'Leave balances retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async applyLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.attachment_url || null;
      const result = await leaveService.applyLeave(req.user!.employeeId!, req.user!.userId, {
        leave_type_id: Number(req.body.leave_type_id),
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        reason: req.body.reason,
        attachment_url: attachmentUrl,
      });
      sendSuccess(res, result, 'Leave application submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async getMyLeaves(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await leaveService.getMyLeaveRequests(
        req.user!.employeeId!,
        req.query.status as string | undefined
      );
      sendSuccess(res, data, 'Leave history retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async cancelMyLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leaveService.cancelMyLeaveRequest(
        Number(req.params.id),
        req.user!.employeeId!,
        req.user!.userId
      );
      sendSuccess(res, result, 'Leave request cancelled');
    } catch (error) {
      next(error);
    }
  }

  public async adminListLeaves(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await leaveService.adminListLeaveRequests({
        status: req.query.status as string | undefined,
        departmentId: req.query.departmentId ? Number(req.query.departmentId) : undefined,
        employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
      });
      sendSuccess(res, data, 'Leave requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async approveLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leaveService.reviewLeaveRequest(
        Number(req.params.id),
        req.user!.userId,
        'Approved'
      );
      sendSuccess(res, result, 'Leave request approved');
    } catch (error) {
      next(error);
    }
  }

  public async rejectLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leaveService.reviewLeaveRequest(
        Number(req.params.id),
        req.user!.userId,
        'Rejected',
        req.body?.rejection_reason
      );
      sendSuccess(res, result, 'Leave request rejected');
    } catch (error) {
      next(error);
    }
  }

  public async adminUpdateBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employee_id, leave_type_id, allocated_days, year } = req.body;
      const result = await leaveService.updateEmployeeBalance(
        Number(employee_id),
        Number(leave_type_id),
        Number(allocated_days),
        year ? Number(year) : undefined
      );
      sendSuccess(res, result, 'Leave balance updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new LeaveController();
