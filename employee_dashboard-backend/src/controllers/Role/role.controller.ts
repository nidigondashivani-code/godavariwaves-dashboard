import { Request, Response, NextFunction } from 'express';
import roleService from '../../services/role.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export class RoleController {
  public async listRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await roleService.listRoles();
      sendSuccess(res, data, 'Roles and permissions retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await roleService.getRoleById(Number(req.params.id));
      sendSuccess(res, data, 'Role details retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async updatePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await roleService.updateRolePermissions(
        Number(req.params.id),
        req.user!.userId,
        req.body
      );
      sendSuccess(res, data, 'Role permissions updated');
    } catch (error) {
      next(error);
    }
  }

  public async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const data = await roleService.getPermissionAuditLogs(limit);
      sendSuccess(res, data, 'Permission audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new RoleController();
