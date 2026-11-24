import React from 'react';
import { ChevronRight, Home, Shield } from 'lucide-react';
import { RoleCardFilterType } from './RoleSummaryCards';

interface RoleBreadcrumbFilterTrailProps {
  activeCard: RoleCardFilterType | null;
  status: string;
  permissionType: string;
  searchQuery: string;
  bottomTab: 'matrix' | 'activity' | 'audit';
  onResetAll: () => void;
}

export const RoleBreadcrumbFilterTrail: React.FC<RoleBreadcrumbFilterTrailProps> = ({
  activeCard,
  status,
  permissionType,
  searchQuery,
  bottomTab,
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
        <Shield className="w-3.5 h-3.5 text-blue-600" />
        <span>Role & Permissions</span>
      </button>

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

      {permissionType !== 'All' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-400">Access</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {permissionType}
          </span>
        </>
      )}

      {activeCard === 'total-permissions' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            Permission Matrix (104)
          </span>
        </>
      )}

      {activeCard === 'assigned-employees' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
            Assigned Employees (12)
          </span>
        </>
      )}

      {status === 'All' &&
        permissionType === 'All' &&
        !activeCard && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Overview (2 Roles)
            </span>
          </>
        )}
    </nav>
  );
};

export default RoleBreadcrumbFilterTrail;
