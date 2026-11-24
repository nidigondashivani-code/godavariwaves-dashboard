import { apiClient } from '../api/apiClient';

/**
 * Unified Shared Backend API Layer for Admin & Employee Modules.
 * Ensures both dashboards read and mutate the same MySQL 8 records through Express APIs.
 */
export const hrmsApi = {
  // Employee Lifecycle & Directory
  listEmployees: (params?: { search?: string; departmentId?: number; status?: string; page?: number; limit?: number }) =>
    apiClient.get('/employees', { params }).then((r) => r.data.data),
  getEmployee: (id: number) => apiClient.get(`/employees/${id}`).then((r) => r.data.data),
  createEmployee: (payload: Record<string, unknown>) =>
    apiClient.post('/employees', payload).then((r) => r.data.data),
  updateEmployee: (id: number, payload: Record<string, unknown>) =>
    apiClient.put(`/employees/${id}`, payload).then((r) => r.data.data),
  activateEmployee: (id: number) =>
    apiClient.patch(`/employees/${id}/activate`).then((r) => r.data.data),
  deactivateEmployee: (id: number, reason = 'Deactivated') =>
    apiClient.patch(`/employees/${id}/deactivate`, { reason }).then((r) => r.data.data),
  toggleDashboardAccess: (id: number, enabled: boolean) =>
    apiClient.patch(`/employees/${id}/dashboard-access`, { enabled }).then((r) => r.data.data),
  resetEmployeePassword: (id: number, newPassword?: string) =>
    apiClient.post(`/employees/${id}/reset-password`, { newPassword }).then((r) => r.data.data),
  softDeleteEmployee: (id: number) =>
    apiClient.delete(`/employees/${id}`).then((r) => r.data.data),
  bulkEmployeeAction: (
    ids: number[],
    action: 'activate' | 'deactivate' | 'delete' | 'enableAccess' | 'disableAccess',
    reason?: string
  ) => apiClient.post('/employees/bulk-action', { ids, action, reason }).then((r) => r.data.data),

  // Departments, Designations & Multiple Team Leads
  listDepartments: () => apiClient.get('/departments').then((r) => r.data.data),
  createDepartment: (payload: Record<string, unknown>) =>
    apiClient.post('/departments', payload).then((r) => r.data.data),
  updateDepartment: (id: number, payload: Record<string, unknown>) =>
    apiClient.put(`/departments/${id}`, payload).then((r) => r.data.data),
  assignTeamLead: (departmentId: number, employeeId: number) =>
    apiClient.post(`/departments/${departmentId}/team-leads`, { employee_id: employeeId }).then((r) => r.data.data),
  removeTeamLead: (departmentId: number, employeeId: number) =>
    apiClient.delete(`/departments/${departmentId}/team-leads/${employeeId}`).then((r) => r.data.data),
  listDesignations: (departmentId?: number) =>
    apiClient.get('/departments/designations', { params: departmentId ? { departmentId } : undefined }).then((r) => r.data.data),
  createDesignation: (payload: Record<string, unknown>) =>
    apiClient.post('/departments/designations', payload).then((r) => r.data.data),
  updateDesignation: (id: number, payload: Record<string, unknown>) =>
    apiClient.put(`/departments/designations/${id}`, payload).then((r) => r.data.data),
  deleteDesignation: (id: number) =>
    apiClient.delete(`/departments/designations/${id}`).then((r) => r.data.data),

  // Roles & Granular Permissions
  listRoles: () => apiClient.get('/roles').then((r) => r.data.data),
  updateRolePermissions: (
    roleId: number,
    payload: { permissions?: string[]; permissionMatrix?: Record<string, Record<string, boolean>> }
  ) => apiClient.put(`/roles/${roleId}/permissions`, payload).then((r) => r.data.data),
  getRoleAuditLogs: () => apiClient.get('/roles/audit/logs').then((r) => r.data.data),
};

export default hrmsApi;
