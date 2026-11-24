import React from 'react';
import { ChevronRight, Home, Building2 } from 'lucide-react';
import { DepartmentCardFilterType } from './DepartmentSummaryCards';

interface DepartmentBreadcrumbTrailProps {
  activeCard: DepartmentCardFilterType | null;
  teamLead: string;
  status: string;
  minEmployees: number;
  searchQuery: string;
  activeTab: 'cards' | 'table' | 'analytics';
  onResetAll: () => void;
}

export const DepartmentBreadcrumbTrail: React.FC<DepartmentBreadcrumbTrailProps> = ({
  activeCard,
  teamLead,
  status,
  minEmployees,
  searchQuery,
  activeTab,
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
        className="font-semibold text-slate-700 hover:text-blue-600 transition flex items-center gap-1"
      >
        <Building2 className="w-3.5 h-3.5 text-blue-600" />
        <span>Department Management</span>
      </button>

      {teamLead !== 'All' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-400">Team Lead</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            {teamLead}
          </span>
        </>
      )}

      {status !== 'All' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-400">Status</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {status}
          </span>
        </>
      )}

      {minEmployees > 0 && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Min Staff: {minEmployees}+
          </span>
        </>
      )}

      {activeCard === 'total-team-leads' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            Assigned Leads (6)
          </span>
        </>
      )}

      {activeCard === 'depts-without-leads' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            Without Leads (0)
          </span>
        </>
      )}

      {activeCard === 'active-projects' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Active Projects (18)
          </span>
        </>
      )}

      {teamLead === 'All' &&
        status === 'All' &&
        minEmployees === 0 &&
        !activeCard && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              4 Divisions
            </span>
          </>
        )}
    </nav>
  );
};

export default DepartmentBreadcrumbTrail;
