export type ConflictStatus = 'Detected' | 'Resolved' | 'Overridden' | 'Rejected';

export interface ILeaveConflict {
  id: number;
  team_id: number;
  team_name?: string;
  rule_id: number;
  leave_request_id: number;
  conflicting_employee_id: number;
  conflicting_employee_name?: string;
  existing_leave_request_id: number;
  existing_leave_employee_name?: string;
  conflict_date: string;
  reason: string;
  status: ConflictStatus;
  resolved_by?: number | null;
  resolver_name?: string;
  resolution_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ICheckConflictParams {
  employee_id: number;
  team_id: number;
  start_date: string;
  end_date: string;
}

export interface IConflictCheckResult {
  hasConflict: boolean;
  conflicts: ILeaveConflict[];
  message?: string;
}
