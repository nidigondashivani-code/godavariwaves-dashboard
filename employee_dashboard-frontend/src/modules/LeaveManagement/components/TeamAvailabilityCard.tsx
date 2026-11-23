import React from 'react';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface TeamAvailabilityCardProps {
  teamName?: string;
  totalMembers?: number;
  availableMembers?: number;
  onLeaveMembers?: number;
  coveragePercentage?: number;
}

/**
 * Team Availability Card Component
 * Visual metric card summarizing team headcount, active coverage, and status indicators.
 */
export const TeamAvailabilityCard: React.FC<TeamAvailabilityCardProps> = ({
  teamName = 'Team',
  totalMembers = 0,
  availableMembers = 0,
  onLeaveMembers = 0,
  coveragePercentage = 100,
}) => {
  const isHealthy = coveragePercentage >= 75;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">{teamName}</h3>
        </div>
        {isHealthy ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Healthy
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Coverage
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center my-4">
        <div className="bg-slate-50 p-2 rounded-lg">
          <span className="text-xs text-slate-500">Total</span>
          <p className="text-lg font-bold text-slate-800">{totalMembers}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg">
          <span className="text-xs text-slate-500">Available</span>
          <p className="text-lg font-bold text-emerald-600">{availableMembers}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg">
          <span className="text-xs text-slate-500">On Leave</span>
          <p className="text-lg font-bold text-rose-600">{onLeaveMembers}</p>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${Math.min(100, coveragePercentage)}%` }}
        />
      </div>
      <div className="mt-2 text-right">
        <span className="text-xs text-slate-500">{coveragePercentage}% Available</span>
      </div>
    </div>
  );
};

export default TeamAvailabilityCard;
