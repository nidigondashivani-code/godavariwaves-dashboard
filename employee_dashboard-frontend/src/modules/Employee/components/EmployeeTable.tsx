import React, { useState } from 'react';
import {
  MoreVertical,
  Eye,
  Edit2,
  KeyRound,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  UserX,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { Employee, SortField, SortOrder } from '../types/employee.types';
import DepartmentBadge from './DepartmentBadge';
import DashboardAccessToggle from './DashboardAccessToggle';

interface EmployeeTableProps {
  employees: Employee[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onViewProfile: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onResetPassword: (emp: Employee) => void;
  onToggleStatus: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onToggleDashboardAccess: (emp: Employee, newAccess: boolean) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onViewProfile,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
  onToggleDashboardAccess,
  sortField,
  sortOrder,
  onSort,
}) => {
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const isAllSelected = employees.length > 0 && employees.every((e) => selectedIds.includes(e.id));
  const isPartiallySelected = selectedIds.length > 0 && !isAllSelected;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 inline ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 inline ml-1" />
    );
  };

  return (
    <div className="relative overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-[#F8FAFC] text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
          <tr>
            <th className="w-10 px-4 py-3.5">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isPartiallySelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3.5">Photo</th>
            <th
              className="px-4 py-3.5 cursor-pointer select-none group"
              onClick={() => onSort('employeeId')}
            >
              Employee ID {renderSortIcon('employeeId')}
            </th>
            <th
              className="px-4 py-3.5 cursor-pointer select-none group"
              onClick={() => onSort('name')}
            >
              Employee Name {renderSortIcon('name')}
            </th>
            <th className="px-4 py-3.5">Company Email</th>
            <th
              className="px-4 py-3.5 cursor-pointer select-none group"
              onClick={() => onSort('designation')}
            >
              Department & Designation {renderSortIcon('designation')}
            </th>
            <th className="px-4 py-3.5">Role</th>
            <th className="px-4 py-3.5">Employment</th>
            <th
              className="px-4 py-3.5 cursor-pointer select-none group"
              onClick={() => onSort('joiningDate')}
            >
              Joining Date {renderSortIcon('joiningDate')}
            </th>
            <th
              className="px-4 py-3.5 cursor-pointer select-none group"
              onClick={() => onSort('dashboardAccess')}
            >
              Dashboard Access {renderSortIcon('dashboardAccess')}
            </th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((emp) => {
            const isSelected = selectedIds.includes(emp.id);
            const initials = `${emp.firstName[0] || ''}${emp.lastName[0] || ''}`.toUpperCase();

            return (
              <tr
                key={emp.id}
                className={`transition-colors duration-150 ${
                  isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'
                } ${emp.status === 'Inactive' ? 'bg-rose-50/20' : ''}`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectOne(emp.id, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>

                {/* Photo */}
                <td className="px-4 py-3.5">
                  {emp.photoUrl ? (
                    <img
                      src={emp.photoUrl}
                      alt={`${emp.firstName} ${emp.lastName}`}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shadow-sm">
                      {initials}
                    </div>
                  )}
                </td>

                {/* ID */}
                <td className="px-4 py-3.5 font-semibold text-slate-900 font-mono">
                  {emp.employeeId}
                </td>

                {/* Name & Manager */}
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => onViewProfile(emp)}
                    className="text-left font-bold text-slate-900 hover:text-blue-600 transition"
                  >
                    {emp.firstName} {emp.lastName}
                  </button>
                  {emp.reportingManagerName ? (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Reports to: {emp.reportingManagerName}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Reports to: Direct to Admin
                    </div>
                  )}
                </td>

                {/* Company Email */}
                <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.companyEmail}</span>
                  </div>
                </td>

                {/* Department & Designation */}
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900 text-xs">{emp.designation}</div>
                  <div className="mt-1">
                    <DepartmentBadge department={emp.department} />
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      emp.role === 'Admin'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {emp.role}
                  </span>
                </td>

                {/* Employment Type */}
                <td className="px-4 py-3.5 text-slate-600">
                  {emp.employmentType}
                </td>

                {/* Joining Date */}
                <td className="px-4 py-3.5 text-slate-600 font-medium">
                  {emp.joiningDate}
                </td>

                {/* Dashboard Access */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <DashboardAccessToggle
                      size="sm"
                      enabled={emp.dashboardAccess}
                      disabled={emp.status === 'Inactive'}
                      onChange={(newVal) => onToggleDashboardAccess(emp, newVal)}
                    />
                    {!emp.dashboardAccess && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <ShieldAlert className="w-3 h-3" /> Access Revoked
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right">
                  <div className="relative inline-block text-left">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewProfile(emp)}
                        title="View Profile"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEdit(emp)}
                        title="Edit Employee"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setActiveActionMenuId(activeActionMenuId === emp.id ? null : emp.id)
                        }
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Popover Action Menu */}
                    {activeActionMenuId === emp.id && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setActiveActionMenuId(null)}
                        />
                        <div className="absolute right-0 z-30 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs divide-y divide-slate-100 animate-in fade-in duration-100">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onResetPassword(emp);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                              Reset Password
                            </button>

                            <button
                              onClick={() => {
                                onToggleStatus(emp);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition"
                            >
                              {emp.status === 'Active' ? (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="text-amber-700">Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-700">Activate</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="py-1">
                            <button
                              onClick={() => {
                                onDelete(emp);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Employee
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
