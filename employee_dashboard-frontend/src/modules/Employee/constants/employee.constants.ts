import { DepartmentType, Employee } from '../types/employee.types';

export const DEPARTMENTS: DepartmentType[] = [
  'Software Development',
  'Digital Marketing',
  'Sales',
  'Administration',
];

export const DESIGNATIONS_BY_DEPARTMENT: Record<DepartmentType, string[]> = {
  'Software Development': [
    'Intern',
    'Junior Developer',
    'Software Engineer',
    'Senior Software Engineer',
    'Team Lead',
  ],
  'Digital Marketing': [
    'SEO Executive',
    'Social Media Executive',
    'Content Writer',
    'Graphic Designer',
  ],
  Sales: ['Sales Executive', 'Senior Sales Executive', 'Sales Manager'],
  Administration: ['Administrator', 'Office Executive', 'Operations Coordinator'],
};

export const ROLES = ['Admin', 'Employee'] as const;

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Intern',
] as const;

export const GENDERS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say',
] as const;

export const INACTIVITY_REASONS = [
  'Resigned',
  'Deactivated',
  'Access Revoked',
  'Long Leave',
] as const;

// Production clean initial workforce: 0 dummy employees
export const INITIAL_EMPLOYEES: Employee[] = [];
