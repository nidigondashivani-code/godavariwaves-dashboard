/**
 * Departments Module - TypeScript Definitions
 * Enterprise Employee Management System (EMS)
 * Enhanced with Multiple Team Leads Management & Automatic Deactivation Cascade
 */

export type DepartmentName =
  | 'Software Development'
  | 'Digital Marketing'
  | 'Sales'
  | 'Administration';

export type DepartmentStatus = 'Active' | 'Under Review' | 'Restructuring';

export interface TeamLeadMember {
  id: string;
  employeeId: string;
  name: string;
  avatar: string;
  designation: string;
  email: string;
  companyEmail: string;
  phone: string;
  assignedDate: string;
  status: 'Active' | 'Inactive';
  department: DepartmentName;
}

export interface DepartmentEmployee {
  id: string;
  employeeId: string;
  name: string;
  avatar: string;
  designation: string;
  department: DepartmentName;
  email: string;
  phone: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Probation' | 'Inactive';
}

export interface DepartmentItem {
  id: string;
  name: DepartmentName;
  description: string;
  teamLeads: TeamLeadMember[];
  teamLeadCount: number;
  teamLead: TeamLeadMember;
  totalEmployees: number;
  activeProjectsCount: number;
  activeProjectsLabel: string;
  status: DepartmentStatus;
  createdDate: string;
  monthlyTarget?: string;
  performanceStatus: string;
  performanceScore: number;
  designations: string[];
  iconName: string;
  accentColor: string;
  metrics: {
    label1: string;
    value1: string | number;
    label2: string;
    value2: string | number;
    label3: string;
    value3: string | number;
  };
}

export interface DepartmentActivity {
  id: string;
  date: string;
  activity: string;
  department: DepartmentName;
  status: 'Completed' | 'In Progress' | 'Announced' | 'Approved';
}

export interface DepartmentSummaryMetrics {
  totalDepartments: number; // 4
  totalEmployees: number; // 125
  totalTeamLeads: number; // Dynamic sum of all team leads across depts
  departmentsWithoutLeads: number; // Dynamic count where teamLeads.length === 0
  activeProjects: number; // 18
  softwareEmployees: number; // 48
  marketingEmployees: number; // 32
  salesEmployees: number; // 30
  adminEmployees: number; // 15
}

export interface DepartmentFilterOptions {
  searchQuery: string;
  teamLead: string | 'All';
  status: string | 'All';
  minEmployees: number;
}
