import React from 'react';

export interface TeamMemberAvailabilityRow {
  employeeId: number;
  employeeName: string;
  designation: string;
  status: 'Available' | 'On Leave' | 'Pending Leave';
  leaveType?: string;
}

interface TeamAvailabilityTableProps {
  members?: TeamMemberAvailabilityRow[];
}

/**
 * Team Availability Table Component
 * Detailed tabular view of each team member's presence, role, and leave status.
 */
export const TeamAvailabilityTable: React.FC<TeamAvailabilityTableProps> = ({
  members = [],
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Designation</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                No team member records found.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.employeeId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{member.employeeName}</td>
                <td className="px-4 py-3 text-slate-600">{member.designation}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700'
                        : member.status === 'On Leave'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{member.leaveType || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeamAvailabilityTable;
