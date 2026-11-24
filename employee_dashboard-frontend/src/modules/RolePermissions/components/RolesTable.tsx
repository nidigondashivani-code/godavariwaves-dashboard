/**
 * RolesTable Component
 * Responsive enterprise data table for System Roles with sorting, pagination, and role-specific action guards.
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  UserCheck,
  Eye,
  Sliders,
  Lock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { RoleItem } from '../types/rolePermissions.types';

interface RolesTableProps {
  roles: RoleItem[];
  onViewRole: (role: RoleItem) => void;
  onEditPermissions: (role: RoleItem) => void;
}

type SortField = 'name' | 'assignedEmployeesCount' | 'totalPermissions' | 'lastUpdatedDate';
type SortOrder = 'asc' | 'desc';

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  onViewRole,
  onEditPermissions,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [roles, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedRoles.length / pageSize) || 1;
  const paginatedRoles = sortedRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mb-8">
      {/* Table Header Bar */}
      <div className="p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h3 className="text-base font-bold text-[#111827]">System Roles</h3>
          <p className="text-xs text-[#6B7280]">
            Core access profiles governing enterprise application capabilities.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1E3A8A] px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-semibold">
          <Info className="w-4 h-4 text-[#2563EB]" />
          <span>Strict Dual-Role Security Model</span>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider select-none">
              <th
                onClick={() => handleSort('name')}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1.5">
                  Role Name
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4">Description</th>
              <th
                onClick={() => handleSort('assignedEmployeesCount')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  Assigned Employees
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('totalPermissions')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1.5">
                  Total Permissions
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th
                onClick={() => handleSort('lastUpdatedDate')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1.5">
                  Last Updated
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {paginatedRoles.map((role) => {
              const isAdmin = role.name === 'Admin';
              const percent = Math.round((role.totalPermissions / role.maxPermissions) * 100);

              return (
                <tr
                  key={role.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Role Name */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                          isAdmin
                            ? 'bg-blue-100 text-[#1E3A8A] ring-2 ring-blue-300/40'
                            : 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200'
                        }`}
                      >
                        {isAdmin ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-[#111827] text-sm block">
                          {role.name}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">
                          {isAdmin ? 'System Administrator' : 'Staff Member'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-4 px-4 max-w-xs">
                    <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>
                  </td>

                  {/* Assigned Employees */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {role.assignedEmployeesCount} Users
                    </span>
                  </td>

                  {/* Total Permissions with Progress Bar */}
                  <td className="py-4 px-4 min-w-[170px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#111827]">
                          {role.totalPermissions}{' '}
                          <span className="text-[#6B7280] font-normal">
                            / {role.maxPermissions}
                          </span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#2563EB]">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isAdmin ? 'bg-[#2563EB]' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {role.status}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 text-xs text-[#6B7280]">
                    {role.createdDate}
                  </td>

                  {/* Last Updated */}
                  <td className="py-4 px-4">
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">{role.lastUpdatedDate}</p>
                      <p className="text-[11px] text-[#6B7280]">by {role.lastUpdatedBy}</p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewRole(role)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        title="View detailed role breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      {isAdmin ? (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200/80 cursor-not-allowed"
                          title="Admin role cannot be modified or deleted"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          View Only
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEditPermissions(role)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition"
                          title="Edit permissions matrix for Employee role"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Edit Permissions
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="block md:hidden p-4 space-y-4">
        {paginatedRoles.map((role) => {
          const isAdmin = role.name === 'Admin';
          const percent = Math.round((role.totalPermissions / role.maxPermissions) * 100);

          return (
            <div
              key={role.id}
              className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAdmin ? 'bg-blue-100 text-[#1E3A8A]' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isAdmin ? <Shield className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{role.name}</h4>
                    <span className="text-[11px] text-[#6B7280]">
                      {role.assignedEmployeesCount} Employees
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {role.status}
                </span>
              </div>

              <p className="text-xs text-[#6B7280] leading-relaxed">
                {role.description}
              </p>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">Total Permissions:</span>
                  <span className="font-bold text-slate-900">
                    {role.totalPermissions} / {role.maxPermissions} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isAdmin ? 'bg-[#2563EB]' : 'bg-indigo-600'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onViewRole(role)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition text-center"
                >
                  View Details
                </button>

                {isAdmin ? (
                  <span className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 text-center flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Locked
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onEditPermissions(role)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 transition text-center"
                  >
                    Edit Permissions
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Pagination */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
        <div>
          Showing {sortedRoles.length} system {sortedRoles.length === 1 ? 'role' : 'roles'}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesTable;
