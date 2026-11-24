/**
 * Leave Controller
 * MVC Architecture - Express.js
 */

import { Request, Response } from 'express';
import backendLeaveService from '../../services/leave.service';

export class LeaveController {
  public static async getLeaveRequests(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        department: req.query.department as string,
        status: req.query.status as string,
        leaveType: req.query.leaveType as string,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const data = await backendLeaveService.getLeaveRequests(filters);
      res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getDashboardMetrics(req: Request, res: Response): Promise<void> {
    try {
      const refDate = (req.query.refDate as string) || '2026-11-24';
      const metrics = await backendLeaveService.getMetrics(refDate);
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async approveLeave(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { adminName, overrideConflict, overrideReason } = req.body;

      const result = await backendLeaveService.approveLeaveRequest(
        id,
        adminName || 'Admin User',
        Boolean(overrideConflict),
        overrideReason
      );

      if (!result.success) {
        res.status(result.requiresOverride ? 409 : 400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async rejectLeave(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { adminName, reason } = req.body;

      if (!reason || !reason.trim()) {
        res.status(400).json({ success: false, message: 'Reason for rejection is required.' });
        return;
      }

      const result = await backendLeaveService.rejectLeaveRequest(
        id,
        adminName || 'Admin User',
        reason.trim()
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async checkConflict(req: Request, res: Response): Promise<void> {
    try {
      const { department, startDate, endDate, excludeId } = req.query;

      if (!department || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'department, startDate, and endDate are required parameters.',
        });
        return;
      }

      const conflict = await backendLeaveService.checkTeamConflict(
        department as string,
        startDate as string,
        endDate as string,
        excludeId as string
      );

      res.status(200).json({ success: true, data: conflict });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default LeaveController;
