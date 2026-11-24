import { Request, Response, NextFunction } from 'express';
import departmentService from '../../services/department.service';
import { sendSuccess } from '../../utils/apiResponse.util';
import { AppError } from '../../utils/appError.util';

export class DepartmentController {
  public async listDepartments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.listDepartments();
      sendSuccess(res, data, 'Departments retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.getDepartmentById(Number(req.params.id));
      sendSuccess(res, data, 'Department details retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.createDepartment(req.user!.userId, req.body);
      sendSuccess(res, data, 'Department created', 201);
    } catch (error) {
      next(error);
    }
  }

  public async updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.updateDepartment(
        Number(req.params.id),
        req.user!.userId,
        req.body
      );
      sendSuccess(res, data, 'Department updated');
    } catch (error) {
      next(error);
    }
  }

  public async assignTeamLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = Number(req.body.employee_id || req.body.employeeId);
      if (!employeeId) throw new AppError('employee_id is required.', 400);
      const data = await departmentService.assignTeamLead(
        Number(req.params.id),
        employeeId,
        req.user!.userId
      );
      sendSuccess(res, data, 'Team Lead assigned to department', 201);
    } catch (error) {
      next(error);
    }
  }

  public async removeTeamLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.removeTeamLead(
        Number(req.params.id),
        Number(req.params.employeeId),
        req.user!.userId
      );
      sendSuccess(res, data, 'Team Lead removed from department');
    } catch (error) {
      next(error);
    }
  }

  public async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 25;
      const data = await departmentService.getDepartmentActivities(limit);
      sendSuccess(res, data, 'Department activities retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async listDesignations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deptId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const data = await departmentService.listDesignations(deptId);
      sendSuccess(res, data, 'Designations retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async createDesignation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.createDesignation(req.user!.userId, req.body);
      sendSuccess(res, data, 'Designation created', 201);
    } catch (error) {
      next(error);
    }
  }

  public async updateDesignation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.updateDesignation(
        Number(req.params.id),
        req.user!.userId,
        req.body
      );
      sendSuccess(res, data, 'Designation updated');
    } catch (error) {
      next(error);
    }
  }

  public async deleteDesignation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await departmentService.deleteDesignation(
        Number(req.params.id),
        req.user!.userId
      );
      sendSuccess(res, data, 'Designation deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentController();
