export type ProfileRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ProfileRequestEmployee {
  id: number;
  employee_code: string;
  full_name: string;
  company_email?: string;
  profile_picture?: string | null;
  department?: {
    id: number;
    name: string;
  };
}

export interface ProfileUpdateRequest {
  id: number;
  employee_id: number;
  field_name: string;
  current_value: string | null;
  requested_value: string;
  reason: string;
  status: ProfileRequestStatus;
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: ProfileRequestEmployee;
}
