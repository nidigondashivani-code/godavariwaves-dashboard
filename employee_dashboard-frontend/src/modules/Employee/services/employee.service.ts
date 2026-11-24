import { Employee, EmployeeDashboardMetrics } from '../types/employee.types';
import { INITIAL_EMPLOYEES } from '../constants/employee.constants';
import notificationService from '../../Notifications/services/notification.service';

const STORAGE_KEY = 'ems_employees_data_v4';

class EmployeeService {
  private employees: Employee[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize to ensure strict 4 departments
          this.employees = parsed.map((emp) => {
            let dept = emp.department;
            let desig = emp.designation;
            if (dept === 'Graphic Design') {
              dept = 'Digital Marketing';
              desig = 'Graphic Designer';
            } else if (dept === 'HR') {
              dept = 'Administration';
              desig = 'Operations Coordinator';
            } else if (dept === 'Finance') {
              dept = 'Administration';
              desig = 'Administrator';
            }
            return {
              ...emp,
              department: dept,
              designation: desig,
              inactivityReason:
                emp.status === 'Inactive' ? emp.inactivityReason || 'Resigned' : undefined,
            };
          });
        } else {
          this.employees = [...INITIAL_EMPLOYEES];
          this.saveToStorage();
        }
      } else {
        this.employees = [...INITIAL_EMPLOYEES];
        this.saveToStorage();
      }
    } catch (e) {
      this.employees = [...INITIAL_EMPLOYEES];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.employees));
    } catch (e) {
      console.error('Failed to persist employees to storage', e);
    }
  }

  public getEmployees(): Employee[] {
    return this.employees.filter((e) => !e.isDeleted);
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.employees.find((e) => e.id === id && !e.isDeleted);
  }

  public createEmployee(
    newEmployee: Omit<Employee, 'id' | 'createdAt' | 'employmentHistory' | 'loginHistory'>
  ): Employee {
    const id = `emp-${Date.now()}`;
    const employee: Employee = {
      ...newEmployee,
      id,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      employmentHistory: [
        {
          id: `eh-${Date.now()}`,
          date: newEmployee.joiningDate || new Date().toISOString().split('T')[0],
          designation: newEmployee.designation,
          department: newEmployee.department,
          changeType: 'Joined',
          notes: 'Employee joined company',
        },
      ],
      loginHistory: [],
    };

    this.employees = [employee, ...this.employees];
    this.saveToStorage();

    // Broadcast real-time notification
    notificationService.addNotification({
      title: 'New Employee Added',
      description: `${employee.firstName} ${employee.lastName} was onboarded to ${employee.department} as ${employee.designation}.`,
      category: 'employee',
      priority: 'medium',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      department: employee.department,
      actionUrl: '#employees',
      actionLabel: 'View Employee',
    });

    return employee;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const current = this.employees[index];
    const hasDeptOrDesigChanged =
      (updates.department && updates.department !== current.department) ||
      (updates.designation && updates.designation !== current.designation);

    const historyCopy = [...(current.employmentHistory || [])];
    if (hasDeptOrDesigChanged) {
      historyCopy.unshift({
        id: `eh-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        designation: updates.designation || current.designation,
        department: updates.department || current.department,
        changeType:
          updates.designation !== current.designation ? 'Promotion' : 'Department Transfer',
        notes: `Updated from ${current.designation} (${current.department})`,
      });
    }

    const updated: Employee = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      employmentHistory: historyCopy,
    };

    this.employees[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public batchUpdateDesignation(
    department: string,
    oldDesignation: string,
    newDesignation: string
  ): number {
    let affected = 0;
    this.employees = this.employees.map((emp) => {
      if (!emp.isDeleted && emp.department === department && emp.designation === oldDesignation) {
        affected++;
        const historyCopy = [...(emp.employmentHistory || [])];
        historyCopy.unshift({
          id: `eh-${Date.now()}-${affected}`,
          date: new Date().toISOString().split('T')[0],
          designation: newDesignation,
          department: emp.department,
          changeType: 'Status Change',
          notes: `Designation title updated from "${oldDesignation}" to "${newDesignation}"`,
        });
        return {
          ...emp,
          designation: newDesignation,
          employmentHistory: historyCopy,
          updatedAt: new Date().toISOString(),
        };
      }
      return emp;
    });

    if (affected > 0) {
      this.saveToStorage();
    }
    return affected;
  }

  public deleteEmployee(id: string): boolean {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) return false;

    // Soft delete
    this.employees[index] = {
      ...this.employees[index],
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return true;
  }

  public activateEmployee(id: string): Employee | null {
    const updated = this.updateEmployee(id, {
      status: 'Active',
      dashboardAccess: true,
      inactivityReason: undefined,
    });
    if (updated) {
      notificationService.addNotification({
        title: 'Employee Activated',
        description: `Active status and login privileges restored for ${updated.firstName} ${updated.lastName}.`,
        category: 'employee',
        priority: 'medium',
        employeeName: `${updated.firstName} ${updated.lastName}`,
        employeeId: updated.employeeId,
        department: updated.department,
        actionUrl: '#employees',
      });
    }
    return updated;
  }

  public deactivateEmployee(id: string, reason: string = 'Deactivated'): Employee | null {
    const updated = this.updateEmployee(id, {
      status: 'Inactive',
      dashboardAccess: false,
      inactivityReason: reason,
    });
    if (updated) {
      notificationService.addNotification({
        title: 'Employee Deactivated',
        description: `${updated.firstName} ${updated.lastName}'s account was deactivated (${reason}). Access revoked.`,
        category: 'employee',
        priority: 'high',
        employeeName: `${updated.firstName} ${updated.lastName}`,
        employeeId: updated.employeeId,
        department: updated.department,
        actionUrl: '#employees',
        actionLabel: 'View Details',
      });
    }
    return updated;
  }

  public toggleDashboardAccess(id: string, enabled: boolean): Employee | null {
    const updated = this.updateEmployee(id, {
      dashboardAccess: enabled,
    });
    if (updated) {
      notificationService.addNotification({
        title: enabled ? 'Dashboard Access Granted' : 'Dashboard Access Revoked',
        description: `Dashboard privileges for ${updated.firstName} ${updated.lastName} were ${
          enabled ? 'granted' : 'revoked'
        }.`,
        category: 'employee',
        priority: enabled ? 'low' : 'high',
        employeeName: `${updated.firstName} ${updated.lastName}`,
        employeeId: updated.employeeId,
        department: updated.department,
        actionUrl: '#employees',
      });
    }
    return updated;
  }

  public resetPassword(id: string, newPassword: string): Employee | null {
    const updated = this.updateEmployee(id, {
      temporaryPassword: newPassword,
    });
    if (updated) {
      notificationService.addNotification({
        title: 'Temporary Password Reset',
        description: `New credentials generated for ${updated.firstName} ${updated.lastName}.`,
        category: 'employee',
        priority: 'medium',
        employeeName: `${updated.firstName} ${updated.lastName}`,
        employeeId: updated.employeeId,
        department: updated.department,
      });
    }
    return updated;
  }

  public bulkAction(
    ids: string[],
    action: 'activate' | 'deactivate' | 'delete' | 'enableAccess' | 'disableAccess'
  ): void {
    ids.forEach((id) => {
      switch (action) {
        case 'activate':
          this.activateEmployee(id);
          break;
        case 'deactivate':
          this.deactivateEmployee(id);
          break;
        case 'delete':
          this.deleteEmployee(id);
          break;
        case 'enableAccess':
          this.toggleDashboardAccess(id, true);
          break;
        case 'disableAccess':
          this.toggleDashboardAccess(id, false);
          break;
      }
    });
  }

  public getMetrics(): EmployeeDashboardMetrics {
    const activeList = this.getEmployees();
    const activeCount = activeList.filter((e) => e.status === 'Active').length;
    const inactiveCount = activeList.filter((e) => e.status === 'Inactive').length;

    // New employees: joined within last 60 days
    const now = new Date('2026-11-24T00:00:00'); // Consistent baseline with app
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const newCount = activeList.filter((e) => {
      const jDate = new Date(e.joiningDate);
      return jDate >= sixtyDaysAgo && jDate <= now;
    }).length;

    const deptSet = new Set(activeList.map((e) => e.department));
    const desigSet = new Set(activeList.map((e) => e.designation));

    return {
      totalEmployees: activeList.length,
      activeEmployees: activeCount,
      inactiveEmployees: inactiveCount,
      newEmployees: newCount,
      departmentCount: deptSet.size,
      designationCount: desigSet.size,
    };
  }

  public resetToDefaultSeed(): void {
    this.employees = [...INITIAL_EMPLOYEES];
    this.saveToStorage();
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
