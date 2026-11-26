import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import profileService from '../../services/profile.service';
import { sendSuccess } from '../../utils/apiResponse.util';
import { AppError } from '../../utils/appError.util';

export class ProfileController {
  public async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await profileService.getMyProfile(req.user!.employeeId!);
      sendSuccess(res, data, 'Employee profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new AppError('Please upload an image file.', 400);

      // Convert uploaded file to base64 data URL for permanent database persistence
      let dataUrl = `/uploads/${req.file.filename}`;
      try {
        if (req.file.path && fs.existsSync(req.file.path)) {
          const fileBuffer = fs.readFileSync(req.file.path);
          const mimeType = req.file.mimetype || 'image/jpeg';
          dataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
          // Clean up local temp file
          try {
            fs.unlinkSync(req.file.path);
          } catch {
            // ignore
          }
        }
      } catch {
        // Fall back to relative path if conversion fails
      }

      const result = await profileService.updateProfilePicture(
        req.user!.employeeId!,
        req.user!.userId,
        dataUrl
      );
      sendSuccess(res, result, 'Profile picture updated');
    } catch (error) {
      next(error);
    }
  }

  public async submitUpdateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await profileService.submitUpdateRequest(
        req.user!.employeeId!,
        req.user!.userId,
        req.body
      );
      sendSuccess(res, data, 'Profile update request submitted', 201);
    } catch (error) {
      next(error);
    }
  }

  public async adminListRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await profileService.adminListUpdateRequests(
        req.query.status as string | undefined
      );
      sendSuccess(res, data, 'Profile update requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async approveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await profileService.reviewUpdateRequest(
        Number(req.params.id),
        req.user!.userId,
        'Approved'
      );
      sendSuccess(res, data, 'Profile update request approved');
    } catch (error) {
      next(error);
    }
  }

  public async rejectRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await profileService.reviewUpdateRequest(
        Number(req.params.id),
        req.user!.userId,
        'Rejected',
        req.body?.rejection_reason
      );
      sendSuccess(res, data, 'Profile update request rejected');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProfileController();
