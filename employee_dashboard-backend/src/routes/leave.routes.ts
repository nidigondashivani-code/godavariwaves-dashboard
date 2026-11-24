import { Router } from 'express';
import leaveController from '../controllers/Leave/leave.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';
import { uploadSingle } from '../middlewares/multerUpload.middleware';

const router = Router();

router.use(authenticate);

// Shared leave types & duration preview
router.get('/types', leaveController.getLeaveTypes);
router.get('/preview-duration', requireEmployee, leaveController.previewDuration);

// Employee leave endpoints
router.get('/balances/me', requireEmployee, leaveController.getMyBalances);
router.get('/me', requireEmployee, leaveController.getMyLeaves);
router.post(
  '/apply',
  requireEmployee,
  requirePermission(PERMISSIONS.APPLY_LEAVE),
  uploadSingle('attachment'),
  leaveController.applyLeave
);
router.patch(
  '/:id/cancel',
  requireEmployee,
  requirePermission(PERMISSIONS.APPLY_LEAVE),
  leaveController.cancelMyLeave
);

// Admin leave management endpoints
router.get('/admin/all', requireAdmin, leaveController.adminListLeaves);
router.patch('/:id/approve', requireAdmin, leaveController.approveLeave);
router.patch('/:id/reject', requireAdmin, leaveController.rejectLeave);
router.post('/types', requireAdmin, leaveController.upsertLeaveType);
router.put('/balances', requireAdmin, leaveController.adminUpdateBalance);

export default router;
