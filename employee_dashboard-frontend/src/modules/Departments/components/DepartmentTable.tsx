/**
 * DepartmentTable Component
 * Modern enterprise data table for the 4 core departments with sorting, pagination, and action menus.
 */

import React, { useState, useMemo } from 'react';
import {
  Code2,
  Megaphone,
  TrendingUp,
  Building2,
  Users,
  Eye,
  Edit,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { DepartmentItem } from '../types/department.types';

interface DepartmentTableProps {
  departments: DepartmentItem[];
  onViewDetails: (dept: DepartmentItem) => void;
  onEditDepartment: (dept: DepartmentItem) => void;
  onManageEmployees: (dept: DepartmentItem) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Code2,
  Megaphone,
  TrendingUp,
  Building2,
};

type SortField = 'name' | 'totalEmployees' | 'activeProjectsCount' | 'createdDate';
type SortOrder = 'asc' | 'desc';

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  onViewDetails,
  onEditDepartment,
  onManageEmployees,
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

  const sortedDepartments = useMemo(() => {
    return [...departments].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [departments, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedDepartments.length / pageSize) || 1;
  const paginated = sortedDepartments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mb-8">
      {/* Table Header */}
      <div className="p-5 border-b border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#111827]">Department Directory</h3>
          <p className="text-xs text-[#6B7280]">
            Complete management overview of organizational divisions.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          4 Operating Departments
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider select-none">
              <th
                onClick={() => handleSort('name')}
                className="py-3.5 px-6 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1.5">
                  Department
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4">Team Lead</th>
              <th
                onClick={() => handleSort('totalEmployees')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  Total Employees
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('activeProjectsCount')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1.5">
                  Active Projects / Ops
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th
                onClick={() => handleSort('createdDate')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1.5">
                  Created Date
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {paginated.map((dept) => {
              const IconComp = ICON_MAP[dept.iconName] || Building2;

              return (
                <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Department */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: dept.accentColor }}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-[#111827] text-sm block">
                          {dept.name}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">
                          {dept.performanceStatus}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Team Lead */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={dept.teamLead.avatar}
                        alt={dept.teamLead.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-xs text-[#111827]">
                          {dept.teamLead.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{dept.teamLead.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Total Employees */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1E3A8A] border border-blue-100">
                      {dept.totalEmployees} Members
                    </span>
                  </td>

                  {/* Active Projects / Campaigns */}
                  <td className="py-4 px-4">
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        {dept.activeProjectsCount} {dept.activeProjectsLabel}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        Score: {dept.performanceScore}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {dept.status}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 text-xs text-[#6B7280]">
                    {dept.createdDate}
                  </td>

                  {/* Actions: View, Edit, Manage Employees */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetails(dept)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        title="View department details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditDepartment(dept)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        title="Edit department lead & parameters"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onManageEmployees(dept)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition"
                        title="Manage employees in this department"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Manage Employees
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination / Footer */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
        <div>
          Showing {sortedDepartments.length} of 4 core departments
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

export default DepartmentTable;
