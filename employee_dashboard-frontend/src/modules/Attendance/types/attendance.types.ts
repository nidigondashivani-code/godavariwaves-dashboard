import { Employee } from '../../Employee/types/employee.types';

export type AttendanceStatus =
  | 'Present'
  | 'Late'
  | 'Half Day'
  | 'On Leave'
  | 'Absent'
  | 'Work From Home'
  | 'Holiday'
  | 'Weekend'
  | 'Not Logged In';

export type CorrectionStatus = 'Pending' | 'Approved' | 'Rejected';

export type AttendanceSummaryFilter =
  | 'all'
  | 'present'
  | 'late'
  | 'absent'
  | 'leave'
  | 'half-day'
  | 'not-logged-in'
  | 'corrections';

export interface AttendanceRecord {
  id: string;
  employeeKey: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  workingMinutes: number;
  lateMinutes: number;
  status: AttendanceStatus;
  updatedAt: string;
}

export interface AttendanceRow {
  employee: Employee;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  workingMinutes: number;
  lateMinutes: number;
  status: AttendanceStatus;
  isOnline: boolean;
}

export interface AttendanceCorrectionRequest {
  id: string;
  employeeKey: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  reason: string;
  status: CorrectionStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export interface AttendanceSummaryMetric {
  key: AttendanceSummaryFilter;
  label: string;
  count: number;
  description: string;
  percentage: number;
}