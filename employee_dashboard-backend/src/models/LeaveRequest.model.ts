/**
 * LeaveRequest Model
 * MVC Architecture - Node.js / Express.js / MySQL
 */

export interface ILeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  designation: string;
  company_email: string;
  mobile_number: string;
  leave_type: 'Casual Leave' | 'Sick Leave' | 'Emergency Leave';
  start_date: string;
  end_date: string;
  total_days: number;
  applied_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  is_overridden?: boolean;
  override_reason?: string;
  attachment_url?: string;
  attachment_name?: string;
  created_at?: string;
  updated_at?: string;
}

export default ILeaveRequest;
