import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.util';
import { ADMIN_ROLES } from '../constants/roles.constants';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient role permissions.', 403));
    }
    next();
  };
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  const hasAdminRole = ADMIN_ROLES.includes(req.user.role);
  const hasAdminDashboard = req.user.dashboardAccess === 'admin' || req.user.dashboardAccess === 'both';
  if (!hasAdminRole || !hasAdminDashboard) {
    return next(new AppError('Forbidden: Admin access required.', 403));
  }
  next();
};

export const requireEmployee = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  if (!req.user.employeeId) {
    return next(new AppError('No employee profile associated with this account.', 403));
  }
  if (req.user.dashboardAccess !== 'employee' && req.user.dashboardAccess !== 'both') {
    return next(new AppError('Forbidden: Employee dashboard access is not enabled.', 403));
  }
  next();
};

export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (ADMIN_ROLES.includes(req.user.role) || req.user.permissions.includes(permission)) {
      return next();
    }
    return next(new AppError(`Forbidden: missing permission '${permission}'.`, 403));
  };
};

export default { requireRole, requireAdmin, requireEmployee, requirePermission };
