import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, RotateCcw } from 'lucide-react';
import { DEPARTMENTS, ROLES, EMPLOYMENT_TYPES } from '../constants/employee.constants';
import designationService from '../services/designation.service';
import { EmployeeFilterOptions, DepartmentType } from '../types/employee.types';

interface EmployeeFilterBarProps {
  filters: EmployeeFilterOptions;
  onFilterChange: (newFilters: EmployeeFilterOptions) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

export const EmployeeFilterBar: React.FC<EmployeeFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalFilteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [designationsByDept, setDesignationsByDept] = useState(() => designationService.getDesignations());

  useEffect(() => {
    return designationService.subscribe(setDesignationsByDept);
  }, []);

  const availableDesignations = filters.department && DEPARTMENTS.includes(filters.department as DepartmentType)
    ? designationsByDept[filters.department as DepartmentType] || []
    : Object.values(designationsByDept).flat();

  const activeFilterCount = [
    filters.department,
    filters.designation,
    filters.role,
    filters.employmentType,
    filters.status,
    filters.dashboardAccess !== 'all' ? filters.dashboardAccess : '',
    filters.joiningDateFrom,
    filters.joiningDateTo,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Top search and quick filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee Name, ID, or Email..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg border transition ${
              isExpanded || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  department: e.target.value,
                  designation: '', // Reset designation when department changes
                })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
            <select
              value={filters.designation}
              onChange={(e) => onFilterChange({ ...filters, designation: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Designations</option>
              {availableDesignations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Employment Type</label>
            <select
              value={filters.employmentType}
              onChange={(e) => onFilterChange({ ...filters, employmentType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Types</option>
              {EMPLOYMENT_TYPES.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Dashboard Access */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Dashboard Access</label>
            <select
              value={filters.dashboardAccess}
              onChange={(e) => onFilterChange({ ...filters, dashboardAccess: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Access</option>
              <option value="enabled">Enabled Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

          {/* Joining Date From */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Joined After</label>
            <div className="relative">
              <input
                type="date"
                value={filters.joiningDateFrom}
                onChange={(e) => onFilterChange({ ...filters, joiningDateFrom: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Joining Date To */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Joined Before</label>
            <div className="relative">
              <input
                type="date"
                value={filters.joiningDateTo}
                onChange={(e) => onFilterChange({ ...filters, joiningDateTo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong>{totalFilteredCount}</strong> matching employees
        </span>
        {activeFilterCount > 0 && (
          <span className="text-blue-700 font-medium">Filtered results applied</span>
        )}
      </div>
    </div>
  );
};

export default EmployeeFilterBar;
