import { Router } from 'express';
import taskController from '../controllers/Task/task.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';
import { uploadSingle } from '../middlewares/multerUpload.middleware';

const router = Router();

router.use(authenticate);

// Employee tasks
router.get('/me', requireEmployee, taskController.getMyTasks);
router.patch(
  '/:id/progress',
  requireEmployee,
  requirePermission(PERMISSIONS.UPDATE_OWN_TASKS),
  uploadSingle('attachment'),
  taskController.updateMyTask
);

// Admin task management
router.get('/admin/all', requireAdmin, taskController.adminListTasks);
router.post('/', requireAdmin, taskController.createTask);
router.put('/:id', requireAdmin, taskController.adminUpdateTask);
router.delete('/:id', requireAdmin, taskController.adminDeleteTask);

export default router;
