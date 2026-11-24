import React from 'react';
import { Calendar, Clock, Sparkles, X } from 'lucide-react';
import { NewHireRangeType } from '../types/employee.types';

interface NewHiresFilterBarProps {
  currentRange: NewHireRangeType;
  customFrom: string;
  customTo: string;
  onSelectRange: (range: NewHireRangeType) => void;
  onCustomChange: (from: string, to: string) => void;
  onClose: () => void;
  matchingCount: number;
}

export const NewHiresFilterBar: React.FC<NewHiresFilterBarProps> = ({
  currentRange,
  customFrom,
  customTo,
  onSelectRange,
  onCustomChange,
  onClose,
  matchingCount,
}) => {
  const quickFilters: Array<{ id: NewHireRangeType; label: string }> = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '15d', label: 'Last 15 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '60d', label: 'Last 60 Days' },
    { id: 'current-month', label: 'Current Month' },
    { id: 'custom', label: 'Custom Date Range' },
  ];

  return (
    <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 animate-in fade-in duration-200 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
              New Hires Filter Matrix
            </h4>
            <p className="text-[11px] text-purple-700">
              Filter recently onboarded staff by joining date window
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-900 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-sm">
            Showing {matchingCount} New {matchingCount === 1 ? 'Employee' : 'Employees'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-purple-400 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition"
            title="Dismiss New Hires Matrix"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick filter buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {quickFilters.map((q) => {
          const isActive = currentRange === q.id;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectRange(q.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition shadow-sm ${
                isActive
                  ? 'bg-purple-600 border-purple-600 text-white shadow-purple-200'
                  : 'bg-white border-purple-200 text-purple-800 hover:bg-purple-100/60'
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range pickers */}
      {currentRange === 'custom' && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 text-xs text-purple-900 font-semibold">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Select Custom Range:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">From:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomChange(e.target.value, customTo)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">To:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => onCustomChange(customFrom, e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewHiresFilterBar;
