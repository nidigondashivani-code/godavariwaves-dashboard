/**
 * DepartmentFilterBar Component
 * Search & Filters panel for Departments: Name, Team Lead, Status, Min Employee Count.
 */

import React, { useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { DepartmentFilterOptions, DepartmentItem } from '../types/department.types';

interface DepartmentFilterBarProps {
  departments: DepartmentItem[];
  filters: DepartmentFilterOptions;
  onApplyFilters: (filters: DepartmentFilterOptions) => void;
  onResetFilters: () => void;
}

export const DepartmentFilterBar: React.FC<DepartmentFilterBarProps> = ({
  departments,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<DepartmentFilterOptions>(filters);

  const teamLeadOptions = Array.from(new Set(departments.map((d) => d.teamLead.name)));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...localFilters, searchQuery: e.target.value };
    setLocalFilters(updated);
    onApplyFilters(updated);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const reset: DepartmentFilterOptions = {
      searchQuery: '',
      teamLead: 'All',
      status: 'All',
      minEmployees: 0,
    };
    setLocalFilters(reset);
    onResetFilters();
  };

  const hasActiveFilters =
    localFilters.searchQuery.trim() !== '' ||
    localFilters.teamLead !== 'All' ||
    localFilters.status !== 'All' ||
    localFilters.minEmployees > 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localFilters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search departments by title or scope..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Team Lead */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] hidden sm:block">
              Lead:
            </label>
            <select
              value={localFilters.teamLead}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, teamLead: e.target.value })
              }
              className="py-2.5 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#111827] focus:outline-none"
            >
              <option value="All">All Team Leads</option>
              {teamLeadOptions.map((lead) => (
                <option key={lead} value={lead}>
                  {lead}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] hidden sm:block">
              Status:
            </label>
            <select
              value={localFilters.status}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, status: e.target.value })
              }
              className="py-2.5 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#111827] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          {/* Min Employees */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] hidden sm:block">
              Size:
            </label>
            <select
              value={localFilters.minEmployees}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, minEmployees: Number(e.target.value) })
              }
              className="py-2.5 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#111827] focus:outline-none"
            >
              <option value={0}>Any Size</option>
              <option value={20}>20+ Employees</option>
              <option value={40}>40+ Employees</option>
            </select>
          </div>

          {/* Buttons */}
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Filter className="w-3.5 h-3.5" />
            Apply Filters
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
              title="Clear filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentFilterBar;
