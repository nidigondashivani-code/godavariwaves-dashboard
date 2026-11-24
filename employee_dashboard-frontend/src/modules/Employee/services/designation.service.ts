import { DepartmentType } from '../types/employee.types';
import { DESIGNATIONS_BY_DEPARTMENT } from '../constants/employee.constants';
import employeeService from './employee.service';
import notificationService from '../../Notifications/services/notification.service';

const DESIGNATIONS_STORAGE_KEY = 'ems_designations_matrix_v1';

type Listener = (designations: Record<DepartmentType, string[]>) => void;

class DesignationService {
  private designations: Record<DepartmentType, string[]> = {
    'Software Development': [...DESIGNATIONS_BY_DEPARTMENT['Software Development']],
    'Digital Marketing': [...DESIGNATIONS_BY_DEPARTMENT['Digital Marketing']],
    'Sales': [...DESIGNATIONS_BY_DEPARTMENT['Sales']],
    'Administration': [...DESIGNATIONS_BY_DEPARTMENT['Administration']],
  };

  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(DESIGNATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          this.designations = {
            'Software Development': Array.isArray(parsed['Software Development'])
              ? parsed['Software Development']
              : [...DESIGNATIONS_BY_DEPARTMENT['Software Development']],
            'Digital Marketing': Array.isArray(parsed['Digital Marketing'])
              ? parsed['Digital Marketing']
              : [...DESIGNATIONS_BY_DEPARTMENT['Digital Marketing']],
            Sales: Array.isArray(parsed['Sales'])
              ? parsed['Sales']
              : [...DESIGNATIONS_BY_DEPARTMENT['Sales']],
            Administration: Array.isArray(parsed['Administration'])
              ? parsed['Administration']
              : [...DESIGNATIONS_BY_DEPARTMENT['Administration']],
          };
        }
      }
    } catch (e) {
      console.error('Failed to load designations from storage', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(DESIGNATIONS_STORAGE_KEY, JSON.stringify(this.designations));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist designations to storage', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const current = this.getDesignations();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.error('Error notifying designation listener', err);
      }
    });
  }

  public getDesignations(): Record<DepartmentType, string[]> {
    return {
      'Software Development': [...(this.designations['Software Development'] || [])],
      'Digital Marketing': [...(this.designations['Digital Marketing'] || [])],
      Sales: [...(this.designations['Sales'] || [])],
      Administration: [...(this.designations['Administration'] || [])],
    };
  }

  public getByDepartment(department: DepartmentType): string[] {
    return [...(this.designations[department] || [])];
  }

  public getAllDesignations(): string[] {
    const all: string[] = [];
    Object.values(this.designations).forEach((list) => {
      list.forEach((desig) => {
        if (!all.includes(desig)) all.push(desig);
      });
    });
    return all;
  }

  public addDesignation(
    department: DepartmentType,
    title: string
  ): { success: boolean; message?: string } {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return { success: false, message: 'Designation title cannot be empty.' };
    }

    const currentList = this.designations[department] || [];
    const exists = currentList.some((d) => d.toLowerCase() === cleanTitle.toLowerCase());
    if (exists) {
      return { success: false, message: `"${cleanTitle}" already exists in ${department}.` };
    }

    this.designations[department] = [...currentList, cleanTitle];
    this.saveToStorage();

    notificationService.addNotification({
      title: 'New Designation Added',
      description: `Added "${cleanTitle}" under ${department} department.`,
      category: 'employee',
      priority: 'low',
      department,
      actionUrl: '#employees',
    });

    return { success: true };
  }

  public updateDesignation(
    department: DepartmentType,
    oldTitle: string,
    newTitle: string
  ): { success: boolean; message?: string; affectedCount?: number } {
    const cleanNewTitle = newTitle.trim();
    if (!cleanNewTitle) {
      return { success: false, message: 'Designation title cannot be empty.' };
    }

    if (oldTitle === cleanNewTitle) {
      return { success: true, affectedCount: 0 };
    }

    const currentList = this.designations[department] || [];
    const exists = currentList.some(
      (d) => d.toLowerCase() === cleanNewTitle.toLowerCase() && d.toLowerCase() !== oldTitle.toLowerCase()
    );
    if (exists) {
      return { success: false, message: `"${cleanNewTitle}" already exists in ${department}.` };
    }

    this.designations[department] = currentList.map((d) => (d === oldTitle ? cleanNewTitle : d));
    this.saveToStorage();

    // Automatically update all employee records that hold oldTitle in department
    const affectedCount = employeeService.batchUpdateDesignation(department, oldTitle, cleanNewTitle);

    notificationService.addNotification({
      title: 'Designation Updated',
      description: `Renamed "${oldTitle}" to "${cleanNewTitle}" in ${department}.${
        affectedCount > 0 ? ` Updated ${affectedCount} employee profile(s).` : ''
      }`,
      category: 'employee',
      priority: 'medium',
      department,
      actionUrl: '#employees',
    });

    return { success: true, affectedCount };
  }

  public deleteDesignation(
    department: DepartmentType,
    title: string,
    reassignTo?: string
  ): { success: boolean; message?: string; affectedCount?: number } {
    const currentList = this.designations[department] || [];
    if (!currentList.includes(title)) {
      return { success: false, message: `"${title}" not found in ${department}.` };
    }

    if (currentList.length <= 1) {
      return { success: false, message: `Cannot delete the only remaining designation in ${department}.` };
    }

    // Check affected employees
    const employees = employeeService.getEmployees();
    const assignedEmployees = employees.filter(
      (e) => e.department === department && e.designation === title
    );

    let affectedCount = 0;
    if (assignedEmployees.length > 0) {
      const targetDesignation = reassignTo || currentList.find((d) => d !== title);
      if (!targetDesignation) {
        return {
          success: false,
          message: `Cannot remove "${title}" because employees are assigned and no fallback designation was found.`,
        };
      }
      affectedCount = employeeService.batchUpdateDesignation(department, title, targetDesignation);
    }

    this.designations[department] = currentList.filter((d) => d !== title);
    this.saveToStorage();

    notificationService.addNotification({
      title: 'Designation Removed',
      description: `Removed "${title}" from ${department}.${
        affectedCount > 0 ? ` Reassigned ${affectedCount} employee(s) to ${reassignTo || 'default role'}.` : ''
      }`,
      category: 'employee',
      priority: 'high',
      department,
      actionUrl: '#employees',
    });

    return { success: true, affectedCount };
  }

  public resetToDefaults(): void {
    this.designations = {
      'Software Development': [...DESIGNATIONS_BY_DEPARTMENT['Software Development']],
      'Digital Marketing': [...DESIGNATIONS_BY_DEPARTMENT['Digital Marketing']],
      Sales: [...DESIGNATIONS_BY_DEPARTMENT['Sales']],
      Administration: [...DESIGNATIONS_BY_DEPARTMENT['Administration']],
    };
    this.saveToStorage();
  }
}

export const designationService = new DesignationService();
export default designationService;
