import React from 'react';
import { X, RotateCcw, Filter, CheckCircle2 } from 'lucide-react';
import { EmployeeFilterOptions } from '../types/employee.types';
import { SummaryCardType } from './ResponsiveSummaryCards';

interface ActiveFilterChipsProps {
  filters: EmployeeFilterOptions;
  activeCard: SummaryCardType | null;
  filteredCount: number;
  totalCount: number;
  onRemoveFilter: (filterKey: keyof EmployeeFilterOptions) => void;
  onResetAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  activeCard,
  filteredCount,
  onRemoveFilter,
  onResetAll,
}) => {
  // Collect active chip tokens
  const chips: Array<{
    id: string;
    label: string;
    value: string;
    onRemove: () => void;
    color: string;
  }> = [];

  if (filters.status) {
    chips.push({
      id: 'status',
      label: 'Status',
      value: filters.status,
      onRemove: () => onRemoveFilter('status'),
      color:
        filters.status === 'Active'
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-rose-50 text-rose-800 border-rose-200',
    });
  }

  if (filters.department) {
    chips.push({
      id: 'department',
      label: 'Department',
      value: filters.department,
      onRemove: () => onRemoveFilter('department'),
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    });
  }

  if (filters.designation) {
    chips.push({
      id: 'designation',
      label: 'Designation',
      value: filters.designation,
      onRemove: () => onRemoveFilter('designation'),
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    });
  }

  if (filters.role) {
    chips.push({
      id: 'role',
      label: 'Role',
      value: filters.role,
      onRemove: () => onRemoveFilter('role'),
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    });
  }

  if (filters.employmentType) {
    chips.push({
      id: 'employmentType',
      label: 'Type',
      value: filters.employmentType,
      onRemove: () => onRemoveFilter('employmentType'),
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    });
  }

  if (filters.dashboardAccess && filters.dashboardAccess !== 'all') {
    chips.push({
      id: 'dashboardAccess',
      label: 'Dashboard Access',
      value: filters.dashboardAccess === 'enabled' ? 'Enabled' : 'Disabled',
      onRemove: () => onRemoveFilter('dashboardAccess'),
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    });
  }

  if (filters.searchQuery) {
    chips.push({
      id: 'searchQuery',
      label: 'Search',
      value: `"${filters.searchQuery}"`,
      onRemove: () => onRemoveFilter('searchQuery'),
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    });
  }

  // Construct feedback text per requirements
  let feedbackText = `Showing ${filteredCount} Employees`;
  if (activeCard === 'total' || chips.length === 0) {
    feedbackText = `Showing ${filteredCount} Total Staff`;
  } else if (filters.status === 'Active' && chips.length === 1) {
    feedbackText = `Showing ${filteredCount} Active Employees`;
  } else if (filters.status === 'Inactive' && chips.length === 1) {
    feedbackText = `Showing ${filteredCount} Inactive ${filteredCount === 1 ? 'Employee' : 'Employees'}`;
  } else if (filters.designation && !filters.department) {
    feedbackText = `Showing all ${filters.designation}s`;
  } else if (filters.department && !filters.designation) {
    feedbackText = `Showing ${filteredCount} Employees in ${filters.department}`;
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

export default ActiveFilterChips;
