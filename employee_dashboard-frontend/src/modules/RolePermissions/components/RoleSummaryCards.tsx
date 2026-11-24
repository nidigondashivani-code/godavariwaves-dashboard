import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { RoleSummaryMetrics } from '../types/rolePermissions.types';

export type RoleCardFilterType =
  | 'total-roles'
  | 'active-roles'
  | 'total-permissions'
  | 'assigned-employees';

interface RoleSummaryCardsProps {
  metrics: RoleSummaryMetrics;
}

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500;
    const incrementTime = 20;
    const step = Math.max(1, Math.ceil(value / (duration / incrementTime)));

    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

export const RoleSummaryCards: React.FC<RoleSummaryCardsProps> = ({ metrics }) => (
  <div className="inline-flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-xs">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
      <Users className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
        Assigned Employees
      </p>
      <p className="text-2xl font-extrabold tracking-tight text-[#111827]">
        <AnimatedCounter value={metrics.assignedEmployees} />
      </p>
      <p className="text-xs text-[#6B7280]">
        {metrics.adminEmployeesCount} Admins · {metrics.regularEmployeesCount} Staff Employees
      </p>
    </div>
  </div>
);

export default RoleSummaryCards;
