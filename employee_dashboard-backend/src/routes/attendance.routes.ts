import { Router } from 'express';
import attendanceController from '../controllers/Attendance/attendance.controller';
import authenticate from '../middlewares/auth.middleware';
import { requireAdmin, requireEmployee, requirePermission } from '../middlewares/role.middleware';
import { PERMISSIONS } from '../constants/permissions.constants';

const router = Router();

router.use(authenticate);

// Employee self-service attendance endpoints
router.post('/clock-in', requireEmployee, requirePermission(PERMISSIONS.CLOCK_ATTENDANCE), attendanceController.clockIn);
router.post('/clock-out', requireEmployee, requirePermission(PERMISSIONS.CLOCK_ATTENDANCE), attendanceController.clockOut);
router.get('/today', requireEmployee, attendanceController.getToday);
router.get('/history', requireEmployee, attendanceController.getHistory);
router.get('/monthly', requireEmployee, attendanceController.getMonthly);
router.get('/summary', requireEmployee, attendanceController.getSummary);
router.get('/export', requireEmployee, attendanceController.exportMyAttendance);

// Admin attendance view & direct correction
router.get('/admin/all', requireAdmin, attendanceController.adminList);
router.post('/admin/correct', requireAdmin, attendanceController.adminDirectCorrect);

export default router;
