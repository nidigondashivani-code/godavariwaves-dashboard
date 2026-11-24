import { Router } from 'express';
import calendarController from '../controllers/Calendar/calendar.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', calendarController.listHolidays);
router.post('/', requireAdmin, calendarController.createHoliday);
router.delete('/:id', requireAdmin, calendarController.deleteHoliday);

export default router;
