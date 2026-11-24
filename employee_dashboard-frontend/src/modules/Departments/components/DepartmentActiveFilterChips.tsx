import React from 'react';
import { X, RotateCcw, CheckCircle2 } from 'lucide-react';
import { DepartmentFilterOptions } from '../types/department.types';
import { DepartmentCardFilterType } from './DepartmentSummaryCards';

interface DepartmentActiveFilterChipsProps {
  filters: DepartmentFilterOptions;
  activeCard: DepartmentCardFilterType | null;
  filteredCount: number;
  totalDepartmentsCount: number;
  onRemoveFilter: (key: keyof DepartmentFilterOptions) => void;
  onResetAll: () => void;
}

export const DepartmentActiveFilterChips: React.FC<DepartmentActiveFilterChipsProps> = ({
  filters,
  activeCard,
  filteredCount,
  totalDepartmentsCount,
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

  if (filters.teamLead !== 'All') {
    chips.push({
      id: 'teamLead',
      label: 'Team Lead',
      value: filters.teamLead,
      onRemove: () => onRemoveFilter('teamLead'),
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    });
  }

  if (filters.status !== 'All') {
    chips.push({
      id: 'status',
      label: 'Status',
      value: filters.status,
      onRemove: () => onRemoveFilter('status'),
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    });
  }

  if (filters.minEmployees > 0) {
    chips.push({
      id: 'minEmployees',
      label: 'Min Staff',
      value: `${filters.minEmployees}+`,
      onRemove: () => onRemoveFilter('minEmployees'),
      color: 'bg-amber-50 text-amber-800 border-amber-200',
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

  // Construct feedback text
  let feedbackText = `Showing ${filteredCount} of ${totalDepartmentsCount} Departments`;
  if (activeCard === 'total-depts' || chips.length === 0) {
    feedbackText = `Showing 4 Active Organization Departments`;
  } else if (activeCard === 'total-emp') {
    feedbackText = `Showing Employee Distribution across 4 Departments`;
  } else if (activeCard === 'total-team-leads') {
    feedbackText = `Showing Departments with Assigned Team Leads (6 Leads Total)`;
  } else if (activeCard === 'depts-without-leads') {
    feedbackText = `Showing Departments without Team Leads (${filteredCount} Departments)`;
  } else if (activeCard === 'active-projects') {
    feedbackText = `Showing Departments by Active Projects & Initiatives`;
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

export default DepartmentActiveFilterChips;
