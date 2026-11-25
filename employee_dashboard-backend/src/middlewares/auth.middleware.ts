import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../utils/appError.util';
import { User, Role, Permission, Employee } from '../models';

export interface AuthenticatedUser {
  userId: number;
  employeeId: number | null;
  email: string;
  role: string;
  dashboardAccess: 'admin' | 'employee' | 'both';
  departmentId: number | null;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : (req.cookies?.accessToken as string | undefined);

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw new AppError('Invalid or expired authentication token.', 401);
    }

    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }],
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'department_id', 'employment_status', 'is_deleted'],
        },
      ],
    });

    if (!user || !user.is_active) {
      throw new AppError('Account is inactive or dashboard access is disabled.', 401);
    }

    // Rule 5: Single active login session enforcement
    if (decoded.loginTimestamp && user.last_login_at) {
      const lastLoginTime = new Date(user.last_login_at).getTime();
      if (lastLoginTime - decoded.loginTimestamp > 3000) {
        throw new AppError(
          'Your session has expired because you logged in from another device. Please log in again.',
          401
        );
      }
    }

    const roleObj = user.get('role') as (Role & { permissions?: Permission[] }) | undefined;
    const empObj = user.get('employee') as Employee | undefined;
    if (empObj && (empObj.is_deleted || empObj.employment_status === 'Inactive' || empObj.employment_status === 'Terminated')) {
      throw new AppError('Employee account is inactive.', 403);
    }
    const permissions = (roleObj?.permissions || []).map((p) => p.name);

    req.user = {
      userId: user.id,
      employeeId: empObj?.id ?? null,
      email: user.email,
      role: roleObj?.name || 'Employee',
      dashboardAccess: user.dashboard_access,
      departmentId: empObj?.department_id ?? null,
      permissions,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
