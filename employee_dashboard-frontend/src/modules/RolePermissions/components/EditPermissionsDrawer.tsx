/**
 * EditPermissionsDrawer Component
 * Dedicated right-side drawer to configure and modify permissions for the Employee role.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  RotateCcw,
  Save,
  Layers,
  CheckCheck,
  AlertCircle,
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
  buildDefaultEmployeePermissions,
} from '../constants/rolePermissions.constants';
import PermissionToggle from './PermissionToggle';

interface EditPermissionsDrawerProps {
  role: RoleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPermissions: RolePermissionsMap) => void;
}

export const EditPermissionsDrawer: React.FC<EditPermissionsDrawerProps> = ({
  role,
  isOpen,
  onClose,
  onSave,
}) => {
  const [draftPermissions, setDraftPermissions] = useState<RolePermissionsMap>(
    buildDefaultEmployeePermissions()
  );

  useEffect(() => {
    if (role) {
      setDraftPermissions(role.permissions);
    }
  }, [role, isOpen]);

  if (!isOpen || !role) return null;

  // Toggle single action
  const handleToggle = (moduleName: AppModule, action: PermissionAction, checked: boolean) => {
    setDraftPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...(prev[moduleName] || {}),
        [action]: checked,
      },
    }));
  };

  // Toggle all actions for a module
  const handleToggleModuleAll = (moduleName: AppModule, currentAllSelected: boolean) => {
    const newVal = !currentAllSelected;
    setDraftPermissions((prev) => {
      const updatedRow = { ...prev[moduleName] };
      ALL_PERMISSION_ACTIONS.forEach((a) => {
        updatedRow[a] = newVal;
      });
      return {
        ...prev,
        [moduleName]: updatedRow,
      };
    });
  };

  // Reset to default
  const handleReset = () => {
    setDraftPermissions(buildDefaultEmployeePermissions());
  };

  // Trigger parent save (which opens confirmation dialog)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draftPermissions);
  };

  // Group modules by category
  const categories = Array.from(new Set(APP_MODULES.map((m) => m.category)));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <form
          onSubmit={handleSubmit}
          className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827]">
                  Configure Employee Permissions
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Grant or revoke functional privileges across modules.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Notice */}
          <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-3 flex items-center gap-2.5 text-xs text-blue-800">
            <AlertCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              Changes saved here will immediately apply to all employees assigned the standard <strong>Employee</strong> role.
            </span>
          </div>

          {/* Body: Modules grouped by category */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {categories.map((category) => {
              const modules = APP_MODULES.filter((m) => m.category === category);

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {category}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {modules.map((mod) => {
                      const modPerms = draftPermissions[mod.name] || {};
                      const allSelected = ALL_PERMISSION_ACTIONS.every((a) =>
                        Boolean(modPerms[a])
                      );

                      return (
                        <div
                          key={mod.id}
                          className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs space-y-3 transition hover:border-slate-300"
                        >
                          {/* Module Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div>
                              <h4 className="text-sm font-bold text-[#111827]">
                                {mod.name}
                              </h4>
                              <p className="text-[11px] text-[#6B7280]">
                                {mod.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleModuleAll(mod.name, allSelected)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-blue-800 transition px-2 py-1 rounded-lg hover:bg-blue-50"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              {allSelected ? 'Clear All' : 'Select All'}
                            </button>
                          </div>

                          {/* 8 Action Toggle Switches */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            {ALL_PERMISSION_ACTIONS.map((action) => {
                              const isChecked = Boolean(modPerms[action]);

                              return (
                                <div
                                  key={action}
                                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition ${
                                    isChecked
                                      ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-semibold'
                                      : 'bg-[#F8FAFC] border-slate-100 text-slate-600'
                                  }`}
                                >
                                  <span>{action}</span>
                                  <PermissionToggle
                                    size="sm"
                                    checked={isChecked}
                                    onChange={(val) => handleToggle(mod.name, action, val)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Buttons */}
          <div className="p-5 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                Review & Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPermissionsDrawer;
