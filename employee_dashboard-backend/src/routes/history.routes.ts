import { Router } from 'express';
import historyController from '../controllers/History/history.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';

const router = Router();
router.use(authenticate);

router.get('/me', requireEmployee, requirePermission(PERMISSIONS.VIEW_OWN_HISTORY), historyController.getMyHistory);
router.get('/admin/:employeeId', requireAdmin, historyController.adminGetEmployeeHistory);

export default router;
