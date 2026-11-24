import { Router } from 'express';
import profileController from '../controllers/Profile/profile.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';
import { uploadSingle } from '../middlewares/multerUpload.middleware';

const router = Router();
router.use(authenticate);

// Employee self-service profile & update requests
router.get('/me', requireEmployee, profileController.getMyProfile);
router.post('/avatar', requireEmployee, uploadSingle('avatar'), profileController.uploadAvatar);
router.post(
  '/update-requests',
  requireEmployee,
  requirePermission(PERMISSIONS.REQUEST_PROFILE_UPDATE),
  profileController.submitUpdateRequest
);

// Admin approval of profile update requests
router.get('/admin/update-requests', requireAdmin, profileController.adminListRequests);
router.patch('/admin/update-requests/:id/approve', requireAdmin, profileController.approveRequest);
router.patch('/admin/update-requests/:id/reject', requireAdmin, profileController.rejectRequest);

export default router;
