/**
 * RoleFilterBar Component
 * Search & Filters panel for Roles with status and permission type selectors.
 */

import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ShieldCheck } from 'lucide-react';
import { RoleFilterOptions } from '../types/rolePermissions.types';

interface RoleFilterBarProps {
  filters: RoleFilterOptions;
  onApplyFilters: (filters: RoleFilterOptions) => void;
  onResetFilters: () => void;
}

export const RoleFilterBar: React.FC<RoleFilterBarProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<RoleFilterOptions>(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...localFilters, searchQuery: e.target.value };
    setLocalFilters(updated);
    // Instant search
    onApplyFilters(updated);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const reset: RoleFilterOptions = {
      searchQuery: '',
      status: 'All',
      permissionType: 'All',
    };
    setLocalFilters(reset);
    onResetFilters();
  };

  const hasActiveFilters =
    localFilters.searchQuery.trim() !== '' ||
    localFilters.status !== 'All' ||
    localFilters.permissionType !== 'All';

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localFilters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search roles by title (Admin, Employee)..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition"
          />
        </div>

        {/* Filter Selects & Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] hidden sm:block">
              Status:
            </label>
            <select
              value={localFilters.status}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  status: e.target.value as RoleFilterOptions['status'],
                })
              }
              className="py-2.5 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Permission Type Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[#6B7280] hidden sm:block">
              Type:
            </label>
            <select
              value={localFilters.permissionType}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  permissionType: e.target.value as RoleFilterOptions['permissionType'],
                })
              }
              className="py-2.5 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition"
            >
              <option value="All">All Access Types</option>
              <option value="Full Access">Full Access (Admin)</option>
              <option value="Custom Access">Custom Access (Employee)</option>
              <option value="Read Only">Read Only</option>
            </select>
          </div>

          {/* Action Buttons */}
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
              title="Reset all filters"
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

export default RoleFilterBar;
