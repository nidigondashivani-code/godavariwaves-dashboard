/**
 * Departments Module - Service Layer
 * Enhanced with Multiple Team Leads Management, Safe Removal, and Automatic Deactivation Cascade
 */

import {
  DepartmentActivity,
  DepartmentEmployee,
  DepartmentItem,
  DepartmentName,
  DepartmentSummaryMetrics,
  TeamLeadMember,
} from '../types/department.types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_DEPARTMENT_ACTIVITIES,
  INITIAL_DEPARTMENT_EMPLOYEES,
  DEPARTMENT_ANALYTICS_DATA,
} from '../constants/department.constants';
import { employeeService } from '../../Employee/services/employee.service';
import { Employee } from '../../Employee/types/employee.types';
import notificationService from '../../Notifications/services/notification.service';
import hrmsApi from '../../../services/hrmsApi.service';

const DEPARTMENTS_STORAGE_KEY = 'ems_departments_v2';
const DEPT_ACTIVITIES_KEY = 'ems_department_activities_v2';

class DepartmentService {
  /**
   * Get all 4 system departments with automatic inactive lead purge
   */
  public getDepartments(): DepartmentItem[] {
    try {
      const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      let departments: DepartmentItem[] = stored ? JSON.parse(stored) : INITIAL_DEPARTMENTS;

      // Apply Automatic Business Rule: Purge inactive/deactivated employees from Team Leads
      departments = this.purgeInactiveTeamLeads(departments);

      return departments;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  }

  /**
   * Automatic Business Rule:
   * If an employee becomes Deactivated or Inactive, automatically remove them from Team Leads
   * while preserving the employee record in history/audit logs.
   */
  private purgeInactiveTeamLeads(departments: DepartmentItem[]): DepartmentItem[] {
    try {
      const allEmployees: Employee[] = employeeService.getEmployees();
      let hasChanges = false;

      const updatedDepartments = departments.map((dept) => {
        const activeLeads = dept.teamLeads.filter((lead) => {
          // Check if employee is still active and not soft-deleted
          const emp = allEmployees.find(
            (e) => e.employeeId === lead.employeeId || e.companyEmail === lead.companyEmail
          );

          if (emp) {
            const isPurged = emp.isDeleted || emp.status === 'Inactive';
            if (isPurged) {
              hasChanges = true;
              return false;
            }
          }
          return lead.status === 'Active';
        });

        if (activeLeads.length !== dept.teamLeads.length) {
          return {
            ...dept,
            teamLeads: activeLeads,
            teamLeadCount: activeLeads.length,
            teamLead: activeLeads[0] || {
              id: 'none',
              employeeId: 'EMP-000',
              name: 'Unassigned',
              email: 'none@company.com',
              companyEmail: 'none@company.com',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              phone: 'N/A',
              designation: 'No Active Lead',
              assignedDate: 'N/A',
              status: 'Inactive',
              department: dept.name,
            },
          };
        }
        return dept;
      });

      if (hasChanges) {
        localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updatedDepartments));
      }

      return updatedDepartments;
    } catch {
      return departments;
    }
  }

  /**
   * Get single department by ID
   */
  public getDepartmentById(id: string): DepartmentItem | undefined {
    return this.getDepartments().find((d) => d.id === id);
  }

  /**
   * Get single department by Name
   */
  public getDepartmentByName(name: DepartmentName): DepartmentItem | undefined {
    return this.getDepartments().find((d) => d.name === name);
  }

  /**
   * Assign a new Team Lead from the same department
   * VALIDATIONS:
   * 1. Only active employees can become Team Leads
   * 2. Must belong to the selected department
   * 3. Prevent duplicate assignments
   */
  public assignTeamLead(
    departmentId: string,
    employeeId: string,
    adminName = 'Admin User'
  ): { success: boolean; message: string; teamLead?: TeamLeadMember } {
    const departments = this.getDepartments();
    const deptIndex = departments.findIndex((d) => d.id === departmentId);

    if (deptIndex === -1) {
      return { success: false, message: 'Department not found.' };
    }

    const dept = departments[deptIndex];

    // Find employee from department roster or global employee service
    let candidate: DepartmentEmployee | Employee | undefined =
      this.getEmployeesByDepartment(dept.name).find((e) => e.id === employeeId || e.employeeId === employeeId);

    if (!candidate) {
      try {
        const globalEmp = employeeService.getEmployeeById(employeeId);
        if (globalEmp && globalEmp.department === dept.name) {
          candidate = globalEmp;
        }
      } catch {
        // Fallback
      }
    }

    if (!candidate) {
      return {
        success: false,
        message: `Employee not found in ${dept.name}. Team Leads must belong to the same department.`,
      };
    }

    // Validation: Only Active employees can become Team Leads
    if (candidate.status !== 'Active') {
      return {
        success: false,
        message: 'Only active employees can be assigned as Team Leads.',
      };
    }

    // Validation: Prevent duplicate assignments
    const alreadyLead = dept.teamLeads.some(
      (tl) => tl.employeeId === candidate?.employeeId || tl.id === candidate?.id
    );

    if (alreadyLead) {
      return {
        success: false,
        message: `${'firstName' in candidate ? `${candidate.firstName} ${candidate.lastName}` : candidate.name} is already assigned as a Team Lead in this department.`,
      };
    }

    const candidateName =
      'firstName' in candidate
        ? `${candidate.firstName} ${candidate.lastName}`
        : candidate.name;
    const candidateEmail =
      'companyEmail' in candidate ? candidate.companyEmail : candidate.email;
    const candidateAvatar: string =
      'profilePhoto' in candidate && typeof (candidate as any).profilePhoto === 'string'
        ? (candidate as any).profilePhoto
        : 'avatar' in candidate && typeof (candidate as any).avatar === 'string'
        ? (candidate as any).avatar
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    const candidatePhone: string =
      'mobileNumber' in candidate && typeof (candidate as any).mobileNumber === 'string'
        ? (candidate as any).mobileNumber
        : 'phone' in candidate && typeof (candidate as any).phone === 'string'
        ? (candidate as any).phone
        : '+91 98765 43210';

    const newTeamLead: TeamLeadMember = {
      id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employeeId: candidate.employeeId,
      name: candidateName,
      avatar: candidateAvatar,
      designation: candidate.designation,
      email: candidateEmail,
      companyEmail: candidateEmail,
      phone: candidatePhone,
      assignedDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
      department: dept.name,
    };

    dept.teamLeads.push(newTeamLead);
    dept.teamLeadCount = dept.teamLeads.length;
    dept.teamLead = newTeamLead; // update primary pointer

    departments[deptIndex] = dept;
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));

    // Log Activity
    this.addActivity(
      `${candidateName} assigned as Team Lead in ${dept.name} by ${adminName}`,
      dept.name,
      'Approved'
    );

    // Broadcast real-time notification
    notificationService.addNotification({
      title: 'Team Lead Assigned',
      description: `${candidateName} has been assigned as Team Lead for ${dept.name}.`,
      category: 'department',
      priority: 'medium',
      employeeName: candidateName,
      department: dept.name,
      actionUrl: '#departments',
      actionLabel: 'View Department',
    });

    return {
      success: true,
      message: `${candidateName} has been assigned as Team Lead for ${dept.name}.`,
      teamLead: newTeamLead,
    };
  }

  /**
   * Remove a Team Lead assignment
   * Removes ONLY the assignment; DOES NOT delete the employee record.
   */
  public removeTeamLead(
    departmentId: string,
    teamLeadId: string,
    adminName = 'Admin User'
  ): { success: boolean; message: string } {
    const departments = this.getDepartments();
    const deptIndex = departments.findIndex((d) => d.id === departmentId);

    if (deptIndex === -1) {
      return { success: false, message: 'Department not found.' };
    }

    const dept = departments[deptIndex];
    const leadIndex = dept.teamLeads.findIndex((tl) => tl.id === teamLeadId || tl.employeeId === teamLeadId);

    if (leadIndex === -1) {
      return { success: false, message: 'Team Lead assignment not found.' };
    }

    const removedLead = dept.teamLeads[leadIndex];
    dept.teamLeads.splice(leadIndex, 1);
    dept.teamLeadCount = dept.teamLeads.length;

    // Update primary pointer
    dept.teamLead = dept.teamLeads[0] || {
      id: 'none',
      employeeId: 'EMP-000',
      name: 'Unassigned',
      email: 'none@company.com',
      companyEmail: 'none@company.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: 'N/A',
      designation: 'No Active Lead',
      assignedDate: 'N/A',
      status: 'Inactive',
      department: dept.name,
    };

    departments[deptIndex] = dept;
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));

    // Log Activity
    this.addActivity(
      `${removedLead.name} removed from Team Lead role in ${dept.name} by ${adminName}`,
      dept.name,
      'Completed'
    );

    // Broadcast real-time notification
    notificationService.addNotification({
      title: 'Team Lead Removed',
      description: `${removedLead.name} was removed from Team Lead role in ${dept.name}.`,
      category: 'department',
      priority: 'high',
      employeeName: removedLead.name,
      department: dept.name,
      actionUrl: '#departments',
    });

    return {
      success: true,
      message: `${removedLead.name} removed from Team Lead assignment. (Employee record preserved).`,
    };
  }

  /**
   * Update department parameters
   */
  public updateDepartment(
    id: string,
    updates: Partial<DepartmentItem>,
    adminName = 'Admin User'
  ): { success: boolean; department?: DepartmentItem; message: string } {
    const departments = this.getDepartments();
    const index = departments.findIndex((d) => d.id === id);

    if (index === -1) {
      return { success: false, message: 'Department not found.' };
    }

    const updated: DepartmentItem = {
      ...departments[index],
      ...updates,
    };

    departments[index] = updated;
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));

    this.addActivity(
      `${updated.name} parameters updated by ${adminName}`,
      updated.name,
      'Completed'
    );

    return {
      success: true,
      department: updated,
      message: `${updated.name} updated successfully.`,
    };
  }

  /**
   * Get employee roster for a specific department
   */
  public getEmployeesByDepartment(departmentName: DepartmentName): DepartmentEmployee[] {
    return INITIAL_DEPARTMENT_EMPLOYEES.filter(
      (emp) => emp.department === departmentName
    );
  }

  /**
   * Get Dashboard Summary Metrics
   * - Total Departments
   * - Total Employees
   * - Total Team Leads
   * - Departments Without Team Leads
   * - Active Projects
   */
  public getSummaryMetrics(): DepartmentSummaryMetrics {
    const departments = this.getDepartments();
    const totalEmployees = departments.reduce((acc, d) => acc + d.totalEmployees, 0);
    const activeProjects = departments.reduce((acc, d) => acc + d.activeProjectsCount, 0);
    const totalTeamLeads = departments.reduce((acc, d) => acc + d.teamLeadCount, 0);
    const departmentsWithoutLeads = departments.filter((d) => d.teamLeadCount === 0).length;

    const software = departments.find((d) => d.name === 'Software Development')?.totalEmployees || 48;
    const marketing = departments.find((d) => d.name === 'Digital Marketing')?.totalEmployees || 32;
    const sales = departments.find((d) => d.name === 'Sales')?.totalEmployees || 30;
    const admin = departments.find((d) => d.name === 'Administration')?.totalEmployees || 15;

    return {
      totalDepartments: 4,
      totalEmployees: totalEmployees || 125,
      totalTeamLeads,
      departmentsWithoutLeads,
      activeProjects: activeProjects || 18,
      softwareEmployees: software,
      marketingEmployees: marketing,
      salesEmployees: sales,
      adminEmployees: admin,
    };
  }

  /**
   * Get recent department activities
   */
  public getRecentActivities(): DepartmentActivity[] {
    try {
      const stored = localStorage.getItem(DEPT_ACTIVITIES_KEY);
      return stored ? JSON.parse(stored) : INITIAL_DEPARTMENT_ACTIVITIES;
    } catch {
      return INITIAL_DEPARTMENT_ACTIVITIES;
    }
  }

  /**
   * Add a new department activity
   */
  public addActivity(
    activity: string,
    department: DepartmentName,
    status: DepartmentActivity['status'] = 'Completed'
  ): void {
    const activities = this.getRecentActivities();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newActivity: DepartmentActivity = {
      id: `act-d-${Date.now()}`,
      date: now,
      activity,
      department,
      status,
    };

    const updated = [newActivity, ...activities].slice(0, 50);
    localStorage.setItem(DEPT_ACTIVITIES_KEY, JSON.stringify(updated));
  }

  /**
   * Get analytics data
   */
  public getAnalyticsData() {
    return DEPARTMENT_ANALYTICS_DATA;
  }

  /**
   * Shared Backend API Integration Methods (MySQL 8 via Express /api/v1/departments)
   */
  public async fetchDepartmentsFromApi() {
    return hrmsApi.listDepartments();
  }

  public async assignTeamLeadOnBackend(departmentId: number, employeeId: number) {
    return hrmsApi.assignTeamLead(departmentId, employeeId);
  }

  public async removeTeamLeadOnBackend(departmentId: number, employeeId: number) {
    return hrmsApi.removeTeamLead(departmentId, employeeId);
  }

  public async fetchDesignationsFromApi(departmentId?: number) {
    return hrmsApi.listDesignations(departmentId);
  }

  public async createDesignationOnBackend(payload: { title: string; department_id?: number | null }) {
    return hrmsApi.createDesignation(payload);
  }
}

export const departmentService = new DepartmentService();
