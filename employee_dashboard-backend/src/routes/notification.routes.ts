import { Router } from 'express';
import notificationController from '../controllers/Notification/notification.controller';
import authenticate from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', notificationController.listMine);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
