import React from 'react';
import { ShieldAlert, History } from 'lucide-react';

/**
 * Leave Conflict History Page
 * Audit log of all detected, resolved, and overridden leave conflicts across teams.
 */
export const LeaveConflictHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Conflict History</h1>
          <p className="text-sm text-slate-500">
            Audit trail of team leave conflicts, resolutions, and managerial overrides.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <History className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="font-medium text-slate-700">Leave Conflict Audit Log</p>
        <p className="text-xs text-slate-400 mt-1">
          Historical records of leave overlap conflicts will appear here.
        </p>
      </div>
    </div>
  );
};

export default LeaveConflictHistory;
