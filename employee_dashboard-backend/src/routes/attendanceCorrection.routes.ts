import { Router } from 'express';
import attendanceCorrectionController from '../controllers/AttendanceCorrection/attendanceCorrection.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';

const router = Router();

router.use(authenticate);

// Employee correction endpoints
router.post(
  '/',
  requireEmployee,
  requirePermission(PERMISSIONS.REQUEST_ATTENDANCE_CORRECTION),
  attendanceCorrectionController.submit
);
router.get('/me', requireEmployee, attendanceCorrectionController.getMyCorrections);

// Admin approval endpoints
router.get('/admin/all', requireAdmin, attendanceCorrectionController.adminList);
router.patch('/:id/approve', requireAdmin, attendanceCorrectionController.approve);
router.patch('/:id/reject', requireAdmin, attendanceCorrectionController.reject);

export default router;
