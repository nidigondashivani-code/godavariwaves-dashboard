/**
 * PermissionMatrix Component
 * Professional enterprise matrix table with 13 application modules, 8 permission columns,
 * smooth toggle switches, row-level "Select All", reset, and save workflow.
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  UserCheck,
  CheckCheck,
  RotateCcw,
  Save,
  Lock,
  Layers,
  Users,
  Clock,
  CheckSquare,
  CalendarCheck,
  CalendarDays,
  Calendar,
  ListTodo,
  TrendingUp,
  Award,
  Megaphone,
  Bell,
  BarChart3,
  Settings,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AppModule,
  PermissionAction,
  RoleItem,
  RolePermissionsMap,
} from '../types/rolePermissions.types';
import {
  ALL_PERMISSION_ACTIONS,
  APP_MODULES,
  buildAdminPermissions,
  buildDefaultEmployeePermissions,
} from '../constants/rolePermissions.constants';
import PermissionToggle from './PermissionToggle';

interface PermissionMatrixProps {
  roles: RoleItem[];
  onSaveEmployeePermissions: (updatedPermissions: RolePermissionsMap) => void;
  onResetEmployeePermissions: () => void;
}

// Module icon registry
const MODULE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Users,
  Clock,
  CheckSquare,
  CalendarCheck,
  CalendarDays,
  Calendar,
  ListTodo,
  TrendingUp,
  Award,
  Megaphone,
  Bell,
  BarChart3,
  Settings,
};

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  roles,
  onSaveEmployeePermissions,
  onResetEmployeePermissions,
}) => {
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Employee'>('Employee');

  const employeeRole = roles.find((r) => r.name === 'Employee');
  const adminRole = roles.find((r) => r.name === 'Admin');

  // Working state for Employee permissions
  const [draftPermissions, setDraftPermissions] = useState<RolePermissionsMap>(() => {
    return employeeRole ? employeeRole.permissions : buildDefaultEmployeePermissions();
  });

  // Keep in sync when external employeeRole updates
  React.useEffect(() => {
    if (employeeRole) {
      setDraftPermissions(employeeRole.permissions);
    }
  }, [employeeRole]);

  // Read-only admin permissions
  const adminPermissions = useMemo(() => buildAdminPermissions(), []);

  const activePermissions = selectedRole === 'Admin' ? adminPermissions : draftPermissions;
  const isLocked = selectedRole === 'Admin';

  // Calculate unsaved changes count
  const unsavedCount = useMemo(() => {
    if (selectedRole === 'Admin' || !employeeRole) return 0;
    let count = 0;
    APP_MODULES.forEach((mod) => {
      const orig = employeeRole.permissions[mod.name] || {};
      const draft = draftPermissions[mod.name] || {};
      ALL_PERMISSION_ACTIONS.forEach((action) => {
        if (Boolean(orig[action]) !== Boolean(draft[action])) {
          count++;
        }
      });
    });
    return count;
  }, [selectedRole, employeeRole, draftPermissions]);

  // Handle single toggle change
  const handleToggle = (moduleName: AppModule, action: PermissionAction, checked: boolean) => {
    if (isLocked) return;

    setDraftPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...(prev[moduleName] || {}),
        [action]: checked,
      },
    }));
  };

  // Handle Select All for a single module row
  const handleSelectAllModule = (moduleName: AppModule, currentAllSelected: boolean) => {
    if (isLocked) return;

    const targetValue = !currentAllSelected;
    setDraftPermissions((prev) => {
      const updatedRow = { ...prev[moduleName] };
      ALL_PERMISSION_ACTIONS.forEach((action) => {
        updatedRow[action] = targetValue;
      });
      return {
        ...prev,
        [moduleName]: updatedRow,
      };
    });
  };

  // Handle Select All across all modules
  const handleSelectAllGlobal = (targetVal: boolean) => {
    if (isLocked) return;

    setDraftPermissions(() => {
      const updated: Partial<RolePermissionsMap> = {};
      APP_MODULES.forEach((mod) => {
        updated[mod.name] = {
          View: targetVal,
          Create: targetVal,
          Edit: targetVal,
          Delete: targetVal,
          Export: targetVal,
          Approve: targetVal,
          Reject: targetVal,
          Assign: targetVal,
        };
      });
      return updated as RolePermissionsMap;
    });
  };

  // Reset local drafts
  const handleReset = () => {
    if (isLocked || !employeeRole) return;
    setDraftPermissions(buildDefaultEmployeePermissions());
    onResetEmployeePermissions();
  };

  // Save changes
  const handleSave = () => {
    if (isLocked) return;
    onSaveEmployeePermissions(draftPermissions);
  };

  // Calculate total active permissions for selected role
  const totalActive = useMemo(() => {
    let count = 0;
    Object.values(activePermissions).forEach((mod) => {
      Object.values(mod).forEach((val) => {
        if (val) count++;
      });
    });
    return count;
  }, [activePermissions]);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mb-8">
      {/* Matrix Controls & Header */}
      <div className="p-6 border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Permission Matrix</h3>
            </div>
            <p className="text-xs text-[#6B7280]">
              Configure granular module capabilities across 13 enterprise operational modules.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#E5E7EB] self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setSelectedRole('Employee')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'Employee'
                  ? 'bg-white text-[#2563EB] shadow-xs ring-1 ring-slate-200'
                  : 'text-[#6B7280] hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Employee (Customizable)
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('Admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'Admin'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin (Full Lock)
            </button>
          </div>
        </div>

        {/* Action Toolbar & Info Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#6B7280]">
              Active Privileges:{' '}
              <span className="font-extrabold text-[#111827]">{totalActive}</span> / 104
            </span>

            {isLocked && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Read-Only System Authority
              </span>
            )}

            {!isLocked && unsavedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-bold animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                {unsavedCount} Unsaved Change{unsavedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {!isLocked && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectAllGlobal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                Grant All
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={unsavedCount === 0}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Permission Matrix Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider select-none">
              <th className="py-4 px-6 w-72">Application Module</th>
              <th className="py-4 px-3 text-center w-28">Select All</th>
              {ALL_PERMISSION_ACTIONS.map((action) => (
                <th key={action} className="py-4 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span>{action}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {APP_MODULES.map((mod, modIdx) => {
              const IconComp = MODULE_ICONS[mod.iconName] || Layers;
              const modulePerms = activePermissions[mod.name] || {};
              const allChecked = ALL_PERMISSION_ACTIONS.every((a) => Boolean(modulePerms[a]));
              const someChecked =
                !allChecked && ALL_PERMISSION_ACTIONS.some((a) => Boolean(modulePerms[a]));

              return (
                <tr
                  key={mod.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    modIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]/50'
                  }`}
                >
                  {/* Module Title & Info */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#111827]">
                            {mod.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6B7280] block truncate">
                          {mod.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Module Row Select All Toggle */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex justify-center">
                      <PermissionToggle
                        checked={allChecked}
                        indeterminate={someChecked}
                        isLocked={isLocked}
                        disabled={isLocked}
                        onChange={() => handleSelectAllModule(mod.name, allChecked)}
                        title={
                          allChecked
                            ? `Deselect all permissions for ${mod.name}`
                            : `Select all permissions for ${mod.name}`
                        }
                      />
                    </div>
                  </td>

                  {/* 8 Action Toggles */}
                  {ALL_PERMISSION_ACTIONS.map((action) => {
                    const isChecked = Boolean(modulePerms[action]);

                    return (
                      <td key={action} className="py-3.5 px-3 text-center">
                        <div className="flex justify-center">
                          <PermissionToggle
                            checked={isChecked}
                            isLocked={isLocked}
                            disabled={isLocked}
                            onChange={(checked) => handleToggle(mod.name, action, checked)}
                            title={`${action} on ${mod.name}: ${
                              isChecked ? 'Allowed' : 'Denied'
                            }`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Save Bar for easy access on long scrolling */}
      {!isLocked && (
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="text-xs text-[#6B7280] flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Tip: Toggling individual permissions updates security enforcement instantly upon saving.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={unsavedCount === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition"
            >
              Save Permission Changes ({unsavedCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionMatrix;
