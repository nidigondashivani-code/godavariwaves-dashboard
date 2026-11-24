/**
 * Leave Routes
 * MVC Architecture - Express.js
 */

import { Router } from 'express';
import LeaveController from '../controllers/Leave/leave.controller';

const router = Router();

// Admin Leave Dashboard endpoints
router.get('/admin', LeaveController.getLeaveRequests);
router.get('/admin/metrics', LeaveController.getDashboardMetrics);
router.get('/admin/conflict', LeaveController.checkConflict);
router.post('/admin/:id/approve', LeaveController.approveLeave);
router.post('/admin/:id/reject', LeaveController.rejectLeave);

export default router;
