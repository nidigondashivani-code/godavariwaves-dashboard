import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { SummaryCardType } from './ResponsiveSummaryCards';

interface BreadcrumbFilterTrailProps {
  activeCard: SummaryCardType | null;
  department: string;
  designation: string;
  status: string;
  onResetAll: () => void;
}

export const BreadcrumbFilterTrail: React.FC<BreadcrumbFilterTrailProps> = ({
  department,
  designation,
  status,
  onResetAll,
}) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap" aria-label="Breadcrumb">
      <button
        type="button"
        onClick={onResetAll}
        className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Enterprise HRMS</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

      <button
        type="button"
        onClick={onResetAll}
        className="font-semibold text-slate-700 hover:text-blue-600 transition"
      >
        Employee Management
      </button>

      {/* Dynamic Filter Steps */}
      {status && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-400">Status</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {status}
          </span>
        </>
      )}

      {department && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-400">Departments</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {department}
          </span>
        </>
      )}

      {designation && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-400">Designations</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            {designation}
          </span>
        </>
      )}

      {!status && !department && !designation && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            All Staff
          </span>
        </>
      )}
    </nav>
  );
};

export default BreadcrumbFilterTrail;
