import { Request, Response, NextFunction } from 'express';
import authService from '../../services/auth.service';
import { sendSuccess } from '../../utils/apiResponse.util';
import { AppError } from '../../utils/appError.util';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, portal } = req.body;
      if (!email || !password) {
        throw new AppError('Company email and password are required.', 400);
      }
      const result = await authService.login(
        email,
        password,
        portal,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  public async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      sendSuccess(res, user, 'Authenticated user loaded');
    } catch (error) {
      next(error);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      const result = await authService.refreshToken(token);
      sendSuccess(res, result, 'Access token refreshed');
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.user!.userId, req.ip);
      sendSuccess(res, { loggedOut: true }, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) throw new AppError('Email address is required.', 400);
      const result = await authService.forgotPassword(email);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        throw new AppError('Current password and a new password (min 6 chars) are required.', 400);
      }
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      sendSuccess(res, { changed: true }, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
