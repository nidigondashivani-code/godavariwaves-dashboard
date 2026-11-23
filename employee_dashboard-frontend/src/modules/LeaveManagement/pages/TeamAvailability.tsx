import React from 'react';
import { Calendar, Users } from 'lucide-react';
import TeamAvailabilityCard from '../components/TeamAvailabilityCard';
import TeamAvailabilityTable from '../components/TeamAvailabilityTable';

/**
 * Team Availability Dashboard Page
 * Real-time visibility into team capacity, scheduled absences, and coverage forecasts.
 */
export const TeamAvailability: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Availability</h1>
          <p className="text-sm text-slate-500">
            Track workforce coverage and upcoming team leaves in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TeamAvailabilityCard
          teamName="Software Development"
          totalMembers={4}
          availableMembers={3}
          onLeaveMembers={1}
          coveragePercentage={75}
        />
        <TeamAvailabilityCard
          teamName="Digital Marketing"
          totalMembers={3}
          availableMembers={3}
          onLeaveMembers={0}
          coveragePercentage={100}
        />
        <TeamAvailabilityCard
          teamName="Graphic Design"
          totalMembers={2}
          availableMembers={2}
          onLeaveMembers={0}
          coveragePercentage={100}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> Member Availability Details
        </h2>
        <TeamAvailabilityTable />
      </div>
    </div>
  );
};

export default TeamAvailability;
