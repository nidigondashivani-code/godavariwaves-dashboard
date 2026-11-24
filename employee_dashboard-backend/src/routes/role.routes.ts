import { Router } from 'express';
import roleController from '../controllers/Role/role.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', requireAdmin, roleController.listRoles);
router.get('/audit/logs', requireAdmin, roleController.getAuditLogs);
router.get('/:id', requireAdmin, roleController.getRole);
router.put('/:id/permissions', requireAdmin, roleController.updatePermissions);

export default router;
