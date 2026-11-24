export interface EmployeeSummary {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyEmail: string;
  phone?: string | null;
  profilePicture?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  designationId?: number | null;
  designationTitle?: string | null;
  reportingManagerId?: number | null;
  reportingManagerName?: string | null;
  joiningDate: string;
  employmentType: string;
  employmentStatus: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  roleId: number;
  dashboardAccess: 'admin' | 'employee' | 'both';
  isActive: boolean;
  lastLoginAt?: string | null;
  permissions: string[];
  employee: EmployeeSummary | null;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  clock_in?: string | null;
  clock_out?: string | null;
  working_minutes: number;
  working_hours: number;
  late_minutes: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  notes?: string | null;
  is_corrected: boolean;
  is_approved: boolean;
  employee?: {
    id: number;
    employee_code: string;
    full_name: string;
    department?: { id: number; name: string };
  };
}

export interface AttendanceCorrectionRecord {
  id: number;
  employee_id: number;
  attendance_date: string;
  existing_login_time?: string | null;
  requested_login_time: string;
  existing_logout_time?: string | null;
  requested_logout_time: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejection_reason?: string | null;
  createdAt: string;
  employee?: {
    id: number;
    employee_code: string;
    full_name: string;
    department?: { id: number; name: string };
  };
}

export interface LeaveTypeItem {
  id: number;
  name: string;
  code: string;
  default_days_per_year: number;
  requires_attachment: boolean;
  description?: string | null;
}

export interface LeaveBalanceItem {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  leaveType?: LeaveTypeItem;
}

export interface LeaveRequestItem {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  attachment_url?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  rejection_reason?: string | null;
  has_team_conflict: boolean;
  conflict_summary?: string | null;
  createdAt: string;
  leaveType?: LeaveTypeItem;
  employee?: {
    id: number;
    employee_code: string;
    full_name: string;
    department?: { id: number; name: string };
  };
}

export interface WorkUpdateItem {
  id: number;
  employee_id: number;
  work_date: string;
  work_description: string;
  tasks_completed?: string | null;
  progress: number;
  hours_spent: number;
  attachment_url?: string | null;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Revision Required';
  admin_feedback?: string | null;
  createdAt: string;
  employee?: {
    id: number;
    employee_code: string;
    full_name: string;
    department?: { id: number; name: string };
  };
}

export interface TaskUpdateComment {
  id: number;
  task_id: number;
  employee_id: number;
  comment: string;
  progress?: number | null;
  status?: string | null;
  attachment_url?: string | null;
  createdAt: string;
  employee?: { id: number; full_name: string };
}

export interface TaskItem {
  id: number;
  title: string;
  description?: string | null;
  department_id?: number | null;
  assigned_to: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  assigned_date: string;
  due_date: string;
  completed_at?: string | null;
  attachments?: string | null;
  department?: { id: number; name: string };
  assignee?: { id: number; employee_code: string; full_name: string };
  assigner?: { id: number; email: string };
  updates?: TaskUpdateComment[];
}

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  category: 'General' | 'HR Policy' | 'Event' | 'Urgent' | 'IT';
  target_audience: 'All' | 'Department';
  department_id?: number | null;
  department?: { id: number; name: string } | null;
  attachment_url?: string | null;
  status: 'Draft' | 'Scheduled' | 'Published';
  scheduled_at?: string | null;
  published_at?: string | null;
  createdAt: string;
  isRead?: boolean;
  readCount?: number;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  link_url?: string | null;
  createdAt: string;
}

export interface CalendarUnifiedEvent {
  id: string;
  rawId?: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  isAllDay?: boolean;
  description?: string;
}
