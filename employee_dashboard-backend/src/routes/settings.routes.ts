import { Router } from 'express';
import settingsController from '../controllers/Settings/settings.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', settingsController.getAll);
router.put('/', requireAdmin, settingsController.update);
router.get('/reports', requireAdmin, settingsController.getReports);
router.get('/performance/me', requireEmployee, settingsController.getMyPerformance);
router.post('/performance', requireAdmin, settingsController.createPerformance);

export default router;
