import React from 'react';
import { Plus, Sliders } from 'lucide-react';

/**
 * Team Leave Rules Management Page
 * Allows Admins and Team Leads to configure concurrent leave limits per team and designation.
 */
export const TeamLeaveRules: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Leave Rules</h1>
          <p className="text-sm text-slate-500">
            Define maximum concurrent leaves and workforce thresholds for working teams.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <Sliders className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
        <p className="font-medium text-slate-700">Team leave rules configuration interface</p>
        <p className="text-xs text-slate-400 mt-1">Ready for business logic implementation.</p>
      </div>
    </div>
  );
};

export default TeamLeaveRules;
