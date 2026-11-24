/**
 * Role & Permissions Module - Service Layer
 * Enterprise LocalStorage & Audit Logging Orchestration
 */

import {
  ActivityLogItem,
  AuditHistoryItem,
  PermissionAction,
  PermissionDiff,
  RoleItem,
  RolePermissionsMap,
  RoleSummaryMetrics,
} from '../types/rolePermissions.types';
import {
  APP_MODULES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_AUDIT_HISTORY,
  INITIAL_ROLES,
  buildAdminPermissions,
  buildDefaultEmployeePermissions,
} from '../constants/rolePermissions.constants';
import { employeeService } from '../../Employee/services/employee.service';
import { Employee } from '../../Employee/types/employee.types';
import notificationService from '../../Notifications/services/notification.service';
import hrmsApi from '../../../services/hrmsApi.service';

const ROLES_STORAGE_KEY = 'ems_roles_v1';
const ACTIVITY_STORAGE_KEY = 'ems_role_activities_v1';
const AUDIT_STORAGE_KEY = 'ems_role_audits_v1';

class RolePermissionsService {
  /**
   * Calculate total active permissions count for a permissions map
   */
  public countActivePermissions(permissions: RolePermissionsMap): number {
    let count = 0;
    Object.values(permissions).forEach((actionMap) => {
      Object.values(actionMap).forEach((val) => {
        if (val) count++;
      });
    });
    return count;
  }

  /**
   * Get all roles
   */
  public getRoles(): RoleItem[] {
    try {
      const stored = localStorage.getItem(ROLES_STORAGE_KEY);
      let roles: RoleItem[] = stored ? JSON.parse(stored) : INITIAL_ROLES;

      // Always ensure Admin role is present, active, and has 104 permissions
      const adminRole = roles.find((r) => r.name === 'Admin');
      if (adminRole) {
        adminRole.permissions = buildAdminPermissions();
        adminRole.totalPermissions = 104;
        adminRole.isEditable = false;
        adminRole.isDeletable = false;
      }

      // Sync employee counts from Employee Service if available
      try {
        const allEmployees: Employee[] = employeeService.getEmployees();
        const adminEmployees = allEmployees.filter((e: Employee) => e.role === 'Admin' && !e.isDeleted);
        const regularEmployees = allEmployees.filter((e: Employee) => e.role === 'Employee' && !e.isDeleted);

        roles = roles.map((role) => {
          if (role.name === 'Admin') {
            return {
              ...role,
              assignedEmployeesCount: adminEmployees.length,
            };
          }
          if (role.name === 'Employee') {
            return {
              ...role,
              assignedEmployeesCount: regularEmployees.length,
              totalPermissions: this.countActivePermissions(role.permissions),
            };
          }
          return role;
        });
      } catch {
        // Fallback to static count
      }

      return roles;
    } catch {
      return INITIAL_ROLES;
    }
  }

  /**
   * Get single role by ID
   */
  public getRoleById(id: string): RoleItem | undefined {
    return this.getRoles().find((r) => r.id === id);
  }

  /**
   * Get single role by name
   */
  public getRoleByName(name: 'Admin' | 'Employee'): RoleItem | undefined {
    return this.getRoles().find((r) => r.name === name);
  }

  /**
   * Update permissions for Employee role with audit logging
   */
  public updateEmployeePermissions(
    updatedPermissions: RolePermissionsMap,
    adminName = 'Admin User'
  ): { success: boolean; diffCount: number; message: string } {
    const roles = this.getRoles();
    const employeeRoleIndex = roles.findIndex((r) => r.name === 'Employee');

    if (employeeRoleIndex === -1) {
      return { success: false, diffCount: 0, message: 'Employee role not found.' };
    }

    const currentRole = roles[employeeRoleIndex];
    const diffs: PermissionDiff[] = [];

    // Calculate diffs across all modules and actions
    APP_MODULES.forEach((mod) => {
      const prevModuleMap = currentRole.permissions[mod.name] || {};
      const newModuleMap = updatedPermissions[mod.name] || {};

      (Object.keys(newModuleMap) as PermissionAction[]).forEach((action) => {
        const prevVal = Boolean(prevModuleMap[action]);
        const newVal = Boolean(newModuleMap[action]);
        if (prevVal !== newVal) {
          diffs.push({
            module: mod.name,
            action,
            previousValue: prevVal,
            newValue: newVal,
          });
        }
      });
    });

    if (diffs.length === 0) {
      return { success: true, diffCount: 0, message: 'No permission changes detected.' };
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Update role
    const updatedEmployeeRole: RoleItem = {
      ...currentRole,
      permissions: updatedPermissions,
      totalPermissions: this.countActivePermissions(updatedPermissions),
      lastUpdatedBy: adminName,
      lastUpdatedDate: now.slice(0, 10),
    };

    roles[employeeRoleIndex] = updatedEmployeeRole;
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));

    // Record Audit Logs
    const currentAudits = this.getAuditHistory();
    const newAuditEntries: AuditHistoryItem[] = diffs.map((d, idx) => ({
      id: `aud-${Date.now()}-${idx}`,
      timestamp: now,
      adminName,
      role: 'Employee',
      module: d.module,
      permissionChanged: d.action,
      previousValue: d.previousValue,
      newValue: d.newValue,
    }));
    const updatedAudits = [...newAuditEntries, ...currentAudits].slice(0, 100);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedAudits));

    // Record Activity Log
    const currentActivities = this.getActivityLogs();
    const primaryDiff = diffs[0];
    const summaryAction =
      diffs.length === 1
        ? `${primaryDiff.module} ${primaryDiff.action.toLowerCase()} permission ${
            primaryDiff.newValue ? 'enabled' : 'disabled'
          }`
        : `Updated ${diffs.length} permissions across ${
            new Set(diffs.map((d) => d.module)).size
          } modules`;

    const newActivity: ActivityLogItem = {
      id: `act-${Date.now()}`,
      timestamp: now,
      user: adminName,
      role: 'Employee',
      module: diffs.length === 1 ? primaryDiff.module : 'Role & Permissions',
      action: summaryAction,
      status: 'Success',
    };
    const updatedActivities = [newActivity, ...currentActivities].slice(0, 50);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updatedActivities));

    // Broadcast real-time notification
    notificationService.addNotification({
      title: 'Permissions Matrix Updated',
      description: `${summaryAction} by ${adminName}.`,
      category: 'role',
      priority: 'high',
      department: 'Administration',
      actionUrl: '#roles',
      actionLabel: 'Inspect Matrix',
    });

    return {
      success: true,
      diffCount: diffs.length,
      message: `Successfully updated ${diffs.length} permission(s) for Employee role.`,
    };
  }

  /**
   * Reset Employee permissions to system defaults
   */
  public resetEmployeePermissions(adminName = 'Admin User'): {
    success: boolean;
    diffCount: number;
    message: string;
  } {
    const defaultPermissions = buildDefaultEmployeePermissions();
    const res = this.updateEmployeePermissions(defaultPermissions, adminName);
    notificationService.addNotification({
      title: 'Role Permissions Reset to Default',
      description: `Employee role authorization matrix was restored to defaults by ${adminName}.`,
      category: 'role',
      priority: 'medium',
      department: 'Administration',
      actionUrl: '#roles',
    });
    return res;
  }

  /**
   * Get activity logs
   */
  public getActivityLogs(): ActivityLogItem[] {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  }

  /**
   * Get audit history
   */
  public getAuditHistory(): AuditHistoryItem[] {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_AUDIT_HISTORY;
    } catch {
      return INITIAL_AUDIT_HISTORY;
    }
  }

  /**
   * Get Dashboard Summary Metrics
   */
  public getSummaryMetrics(): RoleSummaryMetrics {
    const employees = employeeService.getEmployees();
    const adminEmployees = employees.filter((e) => e.role === 'Admin').length;
    const regularEmployees = employees.filter((e) => e.role === 'Employee').length;

    return {
      totalRoles: 2,
      activeRoles: 2,
      totalConfiguredPermissions: 104,
      assignedEmployees: adminEmployees + regularEmployees,
      adminEmployeesCount: adminEmployees,
      regularEmployeesCount: regularEmployees,
    };
  }

  /**
   * Shared Backend API Integration Methods (MySQL 8 via Express /api/v1/roles)
   */
  public async fetchRolesFromApi() {
    return hrmsApi.listRoles();
  }

  public async updatePermissionsOnBackend(
    roleId: number,
    permissionMatrix: RolePermissionsMap
  ) {
    return hrmsApi.updateRolePermissions(roleId, {
      permissionMatrix: permissionMatrix as unknown as Record<string, Record<string, boolean>>,
    });
  }

  public async fetchAuditLogsFromApi() {
    return hrmsApi.getRoleAuditLogs();
  }
}

export const rolePermissionsService = new RolePermissionsService();
