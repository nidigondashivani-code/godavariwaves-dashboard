/**
 * Role & Permissions Module - Main Enterprise Page
 * Premium White Theme, Blue Sidebar (#1E3A8A), Complete Security & Matrix Management
 * Focused permission matrix with activity and audit history.
 */

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import {
  RoleItem,
  RolePermissionsMap,
  RoleSummaryMetrics,
} from '../types/rolePermissions.types';
import { rolePermissionsService } from '../services/rolePermissions.service';
import RoleSummaryCards from '../components/RoleSummaryCards';
import PermissionMatrix from '../components/PermissionMatrix';
import PermissionConfirmationModal from '../components/PermissionConfirmationModal';
import {
  ToastNotification,
  ToastMessage,
  ToastType,
} from '../../Employee/components/ToastNotification';
import { extractApiError } from '../../../api/apiClient';

export const RolePermissionsPage: React.FC = () => {
  // State
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [metrics, setMetrics] = useState<RoleSummaryMetrics>({
    totalRoles: 2,
    activeRoles: 2,
    totalConfiguredPermissions: 104,
    assignedEmployees: 12,
    adminEmployeesCount: 2,
    regularEmployeesCount: 10,
  });
  const [pendingPermissionsToSave, setPendingPermissionsToSave] =
    useState<RolePermissionsMap | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    message: string,
    type: ToastType = 'success'
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Data
  const loadData = () => {
    const fetchedRoles = rolePermissionsService.getRoles();
    setRoles(fetchedRoles);
    setMetrics(rolePermissionsService.getSummaryMetrics());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Request Save from the permission matrix
  const handleRequestSavePermissions = (newPermissions: RolePermissionsMap) => {
    setPendingPermissionsToSave(newPermissions);
    setIsConfirmationOpen(true);
  };

  // Confirm Save — persists directly to MySQL backend Roles & Permissions API
  const handleConfirmSavePermissions = async () => {
    if (!pendingPermissionsToSave) return;

    try {
      const backendRoles = await rolePermissionsService.fetchRolesFromApi();
      const empRole = Array.isArray(backendRoles)
        ? backendRoles.find((r: { name: string }) => r.name === 'Employee')
        : null;
      if (!empRole?.id) {
        showToast('Update Failed', 'Employee role not found in backend database.', 'error');
        return;
      }
      await rolePermissionsService.updatePermissionsOnBackend(empRole.id, pendingPermissionsToSave);
      rolePermissionsService.updateEmployeePermissions(pendingPermissionsToSave, 'Admin User');
      loadData();
      setIsConfirmationOpen(false);
      setPendingPermissionsToSave(null);
      showToast('Permissions Updated', 'Employee permissions saved to MySQL and enforced on backend.', 'success');
    } catch (err) {
      showToast('Update Failed', extractApiError(err, 'Unable to update permissions in backend.'), 'error');
    }
  };

  // Reset to Defaults
  const handleResetEmployeePermissions = () => {
    rolePermissionsService.resetEmployeePermissions('Admin User');
    loadData();
    showToast('Permissions Reset', 'Employee permissions restored to system standard defaults.', 'info');
  };

  // Export Matrix
  const handleExportMatrixJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(roles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `GodavariWave_RolePermissions_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export Complete', 'Role & Permissions matrix downloaded successfully.', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">
              Role & Permissions
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200">
              Enterprise RBAC
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure access control boundaries, module authorizations, and security privileges across the system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportMatrixJson}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#111827] border border-[#E5E7EB] rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Matrix
          </button>
        </div>
      </div>

      <RoleSummaryCards metrics={metrics} />

      <PermissionMatrix
        roles={roles}
        onSaveEmployeePermissions={handleRequestSavePermissions}
        onResetEmployeePermissions={handleResetEmployeePermissions}
      />

      <PermissionConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmSavePermissions}
        diffCount={1}
      />
    </div>
  );
};

export default RolePermissionsPage;
