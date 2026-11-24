import { Request, Response, NextFunction } from 'express';
import employeeService from '../../services/employee.service';
import { sendSuccess } from '../../utils/apiResponse.util';
import { AppError } from '../../utils/appError.util';

export class EmployeeController {
  public async getMetadata(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await employeeService.getMetadata();
      sendSuccess(res, data, 'Organization metadata retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getEmployeeDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) {
        throw new AppError('No employee profile found for current user.', 403);
      }
      const data = await employeeService.getEmployeeDashboardOverview(
        req.user.employeeId,
        req.user.userId
      );
      sendSuccess(res, data, 'Employee dashboard loaded');
    } catch (error) {
      next(error);
    }
  }

  public async getAdminDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await employeeService.getAdminDashboardOverview();
      sendSuccess(res, data, 'Admin dashboard loaded');
    } catch (error) {
      next(error);
    }
  }

  public async listEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.listEmployees({
        search: req.query.search as string | undefined,
        departmentId: req.query.departmentId ? Number(req.query.departmentId) : undefined,
        status: req.query.status as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      });
      sendSuccess(res, result, 'Employees fetched');
    } catch (error) {
      next(error);
    }
  }

  public async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const emp = await employeeService.getEmployeeById(id);
      sendSuccess(res, emp, 'Employee details fetched');
    } catch (error) {
      next(error);
    }
  }

  public async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { first_name, last_name, company_email } = req.body;
      if (!first_name || !last_name || !company_email) {
        throw new AppError('First name, last name, and company email are required.', 400);
      }
      const result = await employeeService.createEmployee(req.body, req.user!.userId);
      sendSuccess(res, result, 'Employee created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await employeeService.updateEmployee(id, req.body, req.user!.userId);
      sendSuccess(res, result, 'Employee updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async activateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.activateEmployee(Number(req.params.id), req.user!.userId);
      sendSuccess(res, result, 'Employee activated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async deactivateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.deactivateEmployee(
        Number(req.params.id),
        req.body?.reason || req.body?.inactivity_reason || 'Deactivated',
        req.user!.userId
      );
      sendSuccess(res, result, 'Employee deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async toggleDashboardAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (typeof req.body?.enabled !== 'boolean') {
        throw new AppError('Boolean "enabled" field is required.', 400);
      }
      const result = await employeeService.toggleDashboardAccess(
        Number(req.params.id),
        req.body.enabled,
        req.user!.userId
      );
      sendSuccess(res, result, 'Employee dashboard access updated');
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.resetEmployeePassword(
        Number(req.params.id),
        req.body?.newPassword || req.body?.password,
        req.user!.userId
      );
      sendSuccess(res, result, 'Employee password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  public async softDeleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.softDeleteEmployee(Number(req.params.id), req.user!.userId);
      sendSuccess(res, result, 'Employee soft-deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public async bulkAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids, action, reason } = req.body;
      if (!Array.isArray(ids) || !action) {
        throw new AppError('Employee "ids" array and "action" are required.', 400);
      }
      const result = await employeeService.bulkAction(
        ids.map(Number),
        action,
        req.user!.userId,
        reason
      );
      sendSuccess(res, result, 'Bulk action completed');
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeController();
