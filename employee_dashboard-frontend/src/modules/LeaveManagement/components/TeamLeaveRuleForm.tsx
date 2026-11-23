import React from 'react';
import { ITeamLeaveRule, ICreateTeamLeaveRuleDTO } from '../types/TeamLeaveRule';

interface TeamLeaveRuleFormProps {
  initialData?: ITeamLeaveRule | null;
  onSubmit: (data: ICreateTeamLeaveRuleDTO) => void;
  onCancel?: () => void;
}

/**
 * Team Leave Rule Form Component
 * Form interface to define or edit maximum concurrent leaves and workforce thresholds.
 */
export const TeamLeaveRuleForm: React.FC<TeamLeaveRuleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Boilerplate submission handler
        onSubmit({
          team_id: initialData?.team_id || 1,
          max_concurrent_leaves: 1,
        });
      }}
      className="space-y-4 bg-white p-6 rounded-xl border border-slate-200"
    >
      <h3 className="text-lg font-bold text-slate-800 mb-2">
        {initialData ? 'Edit Team Leave Rule' : 'Configure New Team Leave Rule'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Max Concurrent Leaves Allowed
        </label>
        <input
          type="number"
          min="1"
          defaultValue={initialData?.max_concurrent_leaves || 1}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Minimum Workforce Percentage (%)
        </label>
        <input
          type="number"
          min="1"
          max="100"
          defaultValue={initialData?.min_workforce_percentage || 75}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allow_admin_override"
          defaultChecked={initialData?.allow_admin_override ?? true}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="allow_admin_override" className="text-sm text-slate-700">
          Allow Admin Override on Conflict
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
        >
          Save Rule
        </button>
      </div>
    </form>
  );
};

export default TeamLeaveRuleForm;
