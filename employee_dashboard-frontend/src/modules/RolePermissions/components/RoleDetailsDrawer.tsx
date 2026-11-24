/**
 * RoleDetailsDrawer Component
 * Right-side slide-over drawer showing detailed role specifications, audit timestamps,
 * and categorized permission breakdowns.
 */

import React from 'react';
import {
  X,
  Shield,
  UserCheck,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Layers,
  Lock,
} from 'lucide-react';
import { RoleItem } from '../types/rolePermissions.types';
import { ALL_PERMISSION_ACTIONS, APP_MODULES } from '../constants/rolePermissions.constants';

interface RoleDetailsDrawerProps {
  role: RoleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEditPermissions?: (role: RoleItem) => void;
}

export const RoleDetailsDrawer: React.FC<RoleDetailsDrawerProps> = ({
  role,
  isOpen,
  onClose,
  onEditPermissions,
}) => {
  if (!isOpen || !role) return null;

  const isAdmin = role.name === 'Admin';
  const percent = Math.round((role.totalPermissions / role.maxPermissions) * 100);

  // Group modules by category for clean presentation
  const modulesByCategory = APP_MODULES.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, typeof APP_MODULES>);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                  isAdmin ? 'bg-[#1E3A8A]' : 'bg-[#2563EB]'
                }`}
              >
                {isAdmin ? <Shield className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#111827]">{role.name} Role</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {role.status}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  System Access Profile Specification
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Role Overview
              </h4>
              <p className="text-sm text-[#111827] leading-relaxed">
                {role.description}
              </p>

              {/* Stat Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-[#6B7280] block mb-1">
                    Assigned Employees
                  </span>
                  <span className="text-base font-bold text-[#111827]">
                    {role.assignedEmployeesCount} Users
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-[#6B7280] block mb-1">
                    Privilege Score
                  </span>
                  <span className="text-base font-bold text-[#2563EB]">
                    {role.totalPermissions} / {role.maxPermissions} ({percent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Categorized Permissions Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Permission Categories
                </h4>
                <span className="text-xs text-blue-600 font-semibold">
                  13 Total Modules
                </span>
              </div>

              {Object.entries(modulesByCategory).map(([category, modules]) => (
                <div
                  key={category}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Layers className="w-4 h-4 text-[#2563EB]" />
                    <h5 className="text-xs font-bold text-[#111827]">{category}</h5>
                  </div>

                  <div className="space-y-2">
                    {modules.map((mod) => {
                      const modPerms = role.permissions[mod.name] || {};
                      const granted = ALL_PERMISSION_ACTIONS.filter((a) => Boolean(modPerms[a]));

                      return (
                        <div
                          key={mod.id}
                          className="p-2.5 rounded-xl bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              {mod.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {granted.length} of 8 actions enabled
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {ALL_PERMISSION_ACTIONS.map((action) => {
                              const isAllowed = Boolean(modPerms[action]);
                              return (
                                <span
                                  key={action}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                    isAllowed
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-200/70 text-slate-400'
                                  }`}
                                >
                                  {action}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Audit & Governance Metadata */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Governance & Audit Trail
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Created By</span>
                    <span className="font-semibold text-slate-800">{role.createdBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Created Date</span>
                    <span className="font-semibold text-slate-800">{role.createdDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Last Updated By</span>
                    <span className="font-semibold text-slate-800">{role.lastUpdatedBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Last Updated Date</span>
                    <span className="font-semibold text-slate-800">{role.lastUpdatedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E5E7EB] bg-white flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Close
            </button>

            {!isAdmin && onEditPermissions && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditPermissions(role);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition"
              >
                Edit Role Permissions
              </button>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                Protected Root Role
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsDrawer;
