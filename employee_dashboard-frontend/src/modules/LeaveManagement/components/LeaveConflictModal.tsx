import React from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { ILeaveConflict } from '../types/LeaveConflict';

interface LeaveConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts?: ILeaveConflict[];
  onConfirmOverride?: () => void;
}

/**
 * Leave Conflict Modal Component
 * Displays conflict details and allows admin override or application cancellation.
 */
export const LeaveConflictModal: React.FC<LeaveConflictModalProps> = ({
  isOpen,
  onClose,
  conflicts = [],
  onConfirmOverride,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-lg font-bold text-slate-900">Leave Conflict Detected</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 text-sm mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Multiple employees from the same team cannot be on leave concurrently based on configured team policies.
            </p>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {conflicts.map((conflict, idx) => (
              <div key={conflict.id || idx} className="border border-slate-200 rounded-lg p-3 text-sm">
                <div className="font-semibold text-slate-800">{conflict.reason}</div>
                <div className="text-xs text-slate-500 mt-1">Date: {conflict.conflict_date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
          {onConfirmOverride && (
            <button
              onClick={onConfirmOverride}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
            >
              Override Conflict
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveConflictModal;
