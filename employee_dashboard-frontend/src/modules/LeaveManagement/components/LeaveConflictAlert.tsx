import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LeaveConflictAlertProps {
  message?: string;
  conflictingColleagues?: string[];
}

/**
 * Leave Conflict Alert Component
 * Inline banner displayed during leave application when a team overlap is detected.
 */
export const LeaveConflictAlert: React.FC<LeaveConflictAlertProps> = ({
  message = 'Team Leave Conflict: Another team member is already scheduled on leave for this date.',
  conflictingColleagues = [],
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex items-start gap-3 my-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold">{message}</p>
        {conflictingColleagues.length > 0 && (
          <ul className="text-xs text-amber-800 list-disc list-inside mt-1 space-y-0.5">
            {conflictingColleagues.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LeaveConflictAlert;
