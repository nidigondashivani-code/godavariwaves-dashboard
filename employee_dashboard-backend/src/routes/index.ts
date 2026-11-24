import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import departmentRoutes from './department.routes';
import roleRoutes from './role.routes';
import attendanceRoutes from './attendance.routes';
import attendanceCorrectionRoutes from './attendanceCorrection.routes';
import leaveRoutes from './leave.routes';
import teamLeaveRuleRoutes from './teamLeaveRule.routes';
import taskRoutes from './task.routes';
import workUpdateRoutes from './workUpdate.routes';
import calendarRoutes from './calendar.routes';
import holidayRoutes from './holiday.routes';
import announcementRoutes from './announcement.routes';
import notificationRoutes from './notification.routes';
import historyRoutes from './history.routes';
import profileRoutes from './profile.routes';
import settingsRoutes from './settings.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Godavari Wave EMS API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/roles', roleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/attendance-corrections', attendanceCorrectionRoutes);
router.use('/leaves', leaveRoutes);
router.use('/team-leave-rules', teamLeaveRuleRoutes);
router.use('/tasks', taskRoutes);
router.use('/work-updates', workUpdateRoutes);
router.use('/calendar', calendarRoutes);
router.use('/holidays', holidayRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/history', historyRoutes);
router.use('/profile', profileRoutes);
router.use('/settings', settingsRoutes);

export default router;
