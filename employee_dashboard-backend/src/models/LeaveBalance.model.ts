/**
 * LeaveBalance Model
 * MVC Architecture - Node.js / Express.js / MySQL
 */

export interface ILeaveBalance {
  id?: string;
  employee_id: string;
  month: number;
  year: number;
  casual_leave_used: number;
  casual_leave_remaining: number;
  casual_leave_total: number; // 1 per month, 12 per year
  sick_leave_used: number;
  sick_leave_remaining: number;
  sick_leave_total: number; // 2 per month, 24 per year
  emergency_leave_used: number;
  created_at?: string;
  updated_at?: string;
}

export default ILeaveBalance;
