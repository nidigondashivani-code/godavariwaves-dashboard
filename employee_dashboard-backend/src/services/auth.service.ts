import crypto from 'crypto';
import { User, Role, Permission, Employee, Department, Designation } from '../models';
import { AppError } from '../utils/appError.util';
import { comparePassword, hashPassword } from '../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtUserPayload,
} from '../utils/jwt.util';
import auditLogService from './auditLog.service';

export class AuthService {
  private buildSafeUserResponse(user: User) {
    const roleObj = user.get('role') as (Role & { permissions?: Permission[] }) | undefined;
    const empObj = user.get('employee') as
      | (Employee & { department?: Department; designation?: Designation; reportingManager?: Employee })
      | undefined;

    const permissions = (roleObj?.permissions || []).map((p) => p.name);

    return {
      id: user.id,
      email: user.email,
      role: roleObj?.name || 'Employee',
      roleId: user.role_id,
      dashboardAccess: user.dashboard_access,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
      permissions,
      employee: empObj
        ? {
            id: empObj.id,
            employeeCode: empObj.employee_code,
            firstName: empObj.first_name,
            lastName: empObj.last_name,
            fullName: empObj.full_name,
            companyEmail: empObj.company_email,
            phone: empObj.phone,
            profilePicture: empObj.profile_picture,
            departmentId: empObj.department_id,
            departmentName: empObj.department?.name || null,
            designationId: empObj.designation_id,
            designationTitle: empObj.designation?.title || null,
            reportingManagerId: empObj.reporting_manager_id,
            reportingManagerName: empObj.reportingManager?.full_name || null,
            joiningDate: empObj.joining_date,
            employmentType: empObj.employment_type,
            employmentStatus: empObj.employment_status,
          }
        : null,
    };
  }

  private async loadFullUser(where: Record<string, unknown>) {
    return User.findOne({
      where,
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        {
          model: Employee,
          as: 'employee',
          include: [
            { model: Department, as: 'department' },
            { model: Designation, as: 'designation' },
            { model: Employee, as: 'reportingManager', attributes: ['id', 'full_name', 'employee_code'] },
          ],
        },
      ],
    });
  }

  public async login(
    email: string,
    password: string,
    portal?: 'admin' | 'employee',
    ipAddress?: string,
    userAgent?: string
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.loadFullUser({ email: normalizedEmail });

    if (!user) {
      throw new AppError('Invalid company email or password.', 401);
    }

    if (!user.is_active) {
      throw new AppError('Dashboard access is disabled or your account has been deactivated. Contact HR/Admin.', 403);
    }

    const linkedEmployee = user.get('employee') as Employee | undefined;
    if (linkedEmployee && (linkedEmployee.is_deleted || linkedEmployee.employment_status === 'Inactive' || linkedEmployee.employment_status === 'Terminated')) {
      throw new AppError('Your employee account is inactive. Login is not permitted.', 403);
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid company email or password.', 401);
    }

    const safeUser = this.buildSafeUserResponse(user);

    if (portal === 'admin' && safeUser.dashboardAccess === 'employee') {
      throw new AppError('You do not have Admin Dashboard access. Please use Employee Login.', 403);
    }
    if (portal === 'employee' && safeUser.dashboardAccess === 'admin') {
      throw new AppError('This account is restricted to Admin Dashboard access.', 403);
    }

    const jwtPayload: JwtUserPayload = {
      userId: user.id,
      employeeId: safeUser.employee?.id ?? null,
      email: user.email,
      role: safeUser.role,
      dashboardAccess: user.dashboard_access,
      permissions: safeUser.permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    user.last_login_at = new Date();
    user.refresh_token_hash = await hashPassword(refreshToken);
    await user.save();

    await auditLogService.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, role: safeUser.role, portal: portal || 'auto' },
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: safeUser,
    };
  }

  public async getCurrentUser(userId: number) {
    const user = await this.loadFullUser({ id: userId });
    if (!user) throw new AppError('User not found.', 404);
    return this.buildSafeUserResponse(user);
  }

  public async refreshToken(token: string) {
    if (!token) throw new AppError('Refresh token is required.', 400);
    let decoded: JwtUserPayload;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await this.loadFullUser({ id: decoded.userId });
    if (!user || !user.is_active || !user.refresh_token_hash) {
      throw new AppError('Session has expired. Please log in again.', 401);
    }

    const valid = await comparePassword(token, user.refresh_token_hash);
    if (!valid) {
      throw new AppError('Refresh token mismatch.', 401);
    }

    const safeUser = this.buildSafeUserResponse(user);
    const jwtPayload: JwtUserPayload = {
      userId: user.id,
      employeeId: safeUser.employee?.id ?? null,
      email: user.email,
      role: safeUser.role,
      dashboardAccess: user.dashboard_access,
      permissions: safeUser.permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);
    return { accessToken, user: safeUser };
  }

  public async logout(userId: number, ipAddress?: string) {
    await User.update({ refresh_token_hash: null }, { where: { id: userId } });
    await auditLogService.log({
      userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
      ipAddress,
    });
    return { loggedOut: true };
  }

  public async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      // Prevent account enumeration
      return {
        message: 'If an account matches this email, password reset instructions have been initiated.',
      };
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.reset_token = resetToken;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return {
      message: 'Password reset instructions have been initiated. Contact Admin if you need immediate reset.',
    };
  }

  public async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found.', 404);

    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) throw new AppError('Current password is incorrect.', 400);

    user.password_hash = await hashPassword(newPassword);
    await user.save();

    await auditLogService.log({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: userId,
    });
    return { changed: true };
  }
}

export default new AuthService();
