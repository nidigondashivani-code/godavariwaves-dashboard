export type DepartmentType =
  | 'Software Development'
  | 'Digital Marketing'
  | 'Sales'
  | 'Administration';

export type RoleType = 'Admin' | 'Employee';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';

export type EmployeeStatusType = 'Active' | 'Inactive';

export type InactivityReasonType =
  | 'Resigned'
  | 'Deactivated'
  | 'Access Revoked'
  | 'Long Leave';

export type GenderType = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type NewHireRangeType =
  | '7d'
  | '15d'
  | '30d'
  | '60d'
  | 'current-month'
  | 'custom'
  | '';

export interface EmploymentHistoryEntry {
  id: string;
  date: string;
  designation: string;
  department: string;
  changeType: 'Joined' | 'Promotion' | 'Department Transfer' | 'Status Change';
  notes?: string;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: 'Success' | 'Failed';
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  gender: GenderType;
  dateOfBirth: string;
  mobileNumber: string;
  personalEmail: string;
  address: string;
  photoUrl?: string;

  // Company Information
  department: DepartmentType | string;
  designation: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  employmentType: EmploymentType;
  joiningDate: string;

  // Login Credentials
  companyEmail: string;
  temporaryPassword?: string;
  role: RoleType;
  dashboardAccess: boolean;
  status: EmployeeStatusType;
  inactivityReason?: InactivityReasonType | string;

  // Audit and System Information
  lastLogin?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;

  // Lifecycle History
  employmentHistory: EmploymentHistoryEntry[];
  loginHistory: LoginHistoryEntry[];
}

export interface EmployeeFilterOptions {
  searchQuery: string;
  department: string;
  designation: string;
  role: string;
  employmentType: string;
  status: string;
  dashboardAccess: string; // 'all' | 'enabled' | 'disabled'
  joiningDateFrom: string;
  joiningDateTo: string;
  newHireRange?: NewHireRangeType;
}

export type SortField =
  | 'employeeId'
  | 'name'
  | 'department'
  | 'designation'
  | 'joiningDate'
  | 'status'
  | 'dashboardAccess';

export type SortOrder = 'asc' | 'desc';

export interface EmployeeDashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newEmployees: number;
  departmentCount: number;
  designationCount: number;
}
