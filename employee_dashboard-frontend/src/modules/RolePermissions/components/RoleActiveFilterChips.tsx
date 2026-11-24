import React from 'react';
import { X, RotateCcw, CheckCircle2 } from 'lucide-react';
import { RoleFilterOptions } from '../types/rolePermissions.types';
import { RoleCardFilterType } from './RoleSummaryCards';

interface RoleActiveFilterChipsProps {
  filters: RoleFilterOptions;
  activeCard: RoleCardFilterType | null;
  filteredCount: number;
  totalRolesCount: number;
  onRemoveFilter: (key: keyof RoleFilterOptions) => void;
  onResetAll: () => void;
}

export const RoleActiveFilterChips: React.FC<RoleActiveFilterChipsProps> = ({
  filters,
  activeCard,
  filteredCount,
  totalRolesCount,
  onRemoveFilter,
  onResetAll,
}) => {
  const chips: Array<{
    id: string;
    label: string;
    value: string;
    onRemove: () => void;
    color: string;
  }> = [];

  if (filters.status !== 'All') {
    chips.push({
      id: 'status',
      label: 'Status',
      value: filters.status,
      onRemove: () => onRemoveFilter('status'),
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    });
  }

  if (filters.permissionType !== 'All') {
    chips.push({
      id: 'permissionType',
      label: 'Access Type',
      value: filters.permissionType,
      onRemove: () => onRemoveFilter('permissionType'),
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    });
  }

  if (filters.searchQuery) {
    chips.push({
      id: 'search',
      label: 'Search',
      value: `"${filters.searchQuery}"`,
      onRemove: () => onRemoveFilter('searchQuery'),
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    });
  }

  // Feedback text
  let feedbackText = `Showing ${filteredCount} of ${totalRolesCount} System Roles`;
  if (activeCard === 'total-roles' || chips.length === 0) {
    feedbackText = `Showing 2 System Roles (Admin & Employee)`;
  } else if (activeCard === 'active-roles' || filters.status === 'Active') {
    feedbackText = `Showing ${filteredCount} Active Operational Roles`;
  } else if (activeCard === 'total-permissions') {
    feedbackText = `Viewing Full Permission Matrix (104 Configured Permissions)`;
  } else if (activeCard === 'assigned-employees') {
    feedbackText = `Showing 12 Assigned Employees across 2 Roles`;
  }

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left: Feedback headline & count */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>{feedbackText}</span>
        </div>

        {/* Chips */}
        {chips.map((chip) => (
          <span
            key={chip.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm transition animate-in fade-in duration-100 ${chip.color}`}
          >
            <span className="text-[10px] uppercase font-bold opacity-75">{chip.label}:</span>
            <span>{chip.value}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="p-0.5 hover:bg-black/10 rounded-full transition"
              title={`Remove ${chip.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Right: Clear All Filters */}
      {chips.length > 0 && (
        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition shadow-sm shrink-0 self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear All Filters</span>
        </button>
      )}
    </div>
  );
};

export default RoleActiveFilterChips;
