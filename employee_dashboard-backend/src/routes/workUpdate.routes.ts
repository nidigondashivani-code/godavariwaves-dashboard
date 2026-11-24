import { Router } from 'express';
import workUpdateController from '../controllers/WorkUpdate/workUpdate.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';
import { uploadSingle } from '../middlewares/multerUpload.middleware';

const router = Router();

router.use(authenticate);

// Employee work updates
router.post(
  '/',
  requireEmployee,
  requirePermission(PERMISSIONS.SUBMIT_WORK_UPDATE),
  uploadSingle('attachment'),
  workUpdateController.submit
);
router.get('/me', requireEmployee, workUpdateController.getMine);
router.put(
  '/:id',
  requireEmployee,
  requirePermission(PERMISSIONS.SUBMIT_WORK_UPDATE),
  uploadSingle('attachment'),
  workUpdateController.editMine
);

// Admin review
router.get('/admin/all', requireAdmin, workUpdateController.adminList);
router.patch('/:id/review', requireAdmin, workUpdateController.review);

export default router;
