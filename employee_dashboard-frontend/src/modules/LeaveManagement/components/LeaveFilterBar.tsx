import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  BarChart3,
  X,
  Calendar,
} from 'lucide-react';
import {
  LeaveFilterOptions,
} from '../types/leave.types';
import {
  LEAVE_DEPARTMENTS,
  LEAVE_TYPES,
  LEAVE_STATUSES,
} from '../constants/leave.constants';

interface LeaveFilterBarProps {
  filters: LeaveFilterOptions;
  onUpdateFilters: (updates: Partial<LeaveFilterOptions>) => void;
  onResetFilters: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onOpenReports: () => void;
  totalFilteredCount: number;
}

export const LeaveFilterBar: React.FC<LeaveFilterBarProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  onExportExcel,
  onExportPDF,
  onOpenReports,
  totalFilteredCount,
}) => {
  const [panelOpen, setPanelOpen] = useState(false);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.department !== 'All Departments' ||
    filters.leaveType !== 'All Leave Types' ||
    filters.status !== 'All Statuses' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
      {/* Search and Top Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            placeholder="Search by Employee Name, ID, Department, Designation, or Reason..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onUpdateFilters({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle Filter Panel */}
          <button
            type="button"
            onClick={() => setPanelOpen(!panelOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              panelOpen || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-[#1E3A8A]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            )}
          </button>

          {/* Reports Modal Trigger */}
          <button
            type="button"
            onClick={onOpenReports}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
            title="Generate Leave Reports"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Reports</span>
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition"
            title="Export to Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Excel</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 transition"
            title="Export Formatted PDF Summary"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Expandable Advanced Filter Panel */}
      {panelOpen && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Department Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => onUpdateFilters({ department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-700"
              >
                {LEAVE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Type Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Leave Type
              </label>
              <select
                value={filters.leaveType}
                onChange={(e) => onUpdateFilters({ leaveType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-700"
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => onUpdateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-700"
              >
                {LEAVE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Filter by Start Date Range
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onUpdateFilters({ startDate: e.target.value })}
                  className="w-1/2 px-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                  title="From Date"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onUpdateFilters({ endDate: e.target.value })}
                  className="w-1/2 px-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                  title="To Date"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters & Active State */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Showing <strong>{totalFilteredCount}</strong> matching leave requests
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveFilterBar;
