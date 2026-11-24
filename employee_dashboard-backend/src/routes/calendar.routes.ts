import { Router } from 'express';
import calendarController from '../controllers/Calendar/calendar.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/events', calendarController.getEvents);
router.post('/events', requireAdmin, calendarController.createEvent);
router.delete('/events/:id', requireAdmin, calendarController.deleteEvent);

export default router;
