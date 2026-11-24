import { Router } from 'express';
import announcementController from '../controllers/Announcement/announcement.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee } from '../middlewares/role.middleware';
import { uploadSingle } from '../middlewares/multerUpload.middleware';

const router = Router();
router.use(authenticate);

// Employee announcements
router.get('/me', requireEmployee, announcementController.getForEmployee);
router.patch('/:id/read', requireEmployee, announcementController.markAsRead);

// Admin announcements management
router.get('/admin/all', requireAdmin, announcementController.adminList);
router.post('/', requireAdmin, uploadSingle('attachment'), announcementController.create);
router.put('/:id', requireAdmin, announcementController.update);
router.delete('/:id', requireAdmin, announcementController.remove);

export default router;
