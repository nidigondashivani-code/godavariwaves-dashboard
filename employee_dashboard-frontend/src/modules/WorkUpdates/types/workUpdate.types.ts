export interface WorkUpdateEmployee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  companyEmail: string;
  photoUrl?: string;
}

export interface WorkUpdateAttachment {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface WorkUpdateAdminRemark {
  id: string;
  text: string;
  addedBy: string;
  addedAt: string;
}

export type WorkUpdateStatus = 'Pending' | 'Submitted' | 'Completed' | 'On Leave';

export interface DailyWorkUpdate {
  id: string;
  employeeKey: string;
  employee: WorkUpdateEmployee;
  date: string;
  workSummary: string;
  progressPercentage: number;
  remainingWork?: string;
  challenges?: string;
  comments?: string;
  attachment?: WorkUpdateAttachment;
  attachmentUrl?: string | null;
  submittedAt: string;
  logoutTime: string | null;
  adminRemarks?: WorkUpdateAdminRemark[];
}

export interface WorkUpdateRow {
  employee: WorkUpdateEmployee;
  date: string;
  update: DailyWorkUpdate | null;
  status: WorkUpdateStatus;
  logoutTime: string | null;
  isWorking: boolean;
}

export interface WorkUpdateAuditEntry {
  id: string;
  employeeKey: string;
  employeeId: string;
  employeeName: string;
  date: string;
  action: 'submitted' | 'logout-blocked' | 'logout-recorded' | 'admin-remark-added';
  timestamp: string;
  details: string;
}

export type WorkUpdateFilter =
  | 'all'
  | 'employees'
  | 'updates'
  | 'pending'
  | 'logged-out'
  | 'working'
  | 'completed';

export type WorkUpdateReportType =
  | 'daily'
  | 'department'
  | 'productivity'
  | 'monthly';
