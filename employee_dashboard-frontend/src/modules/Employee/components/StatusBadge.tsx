import React from 'react';
import { EmployeeStatusType } from '../types/employee.types';

interface StatusBadgeProps {
  status: EmployeeStatusType | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const isActive = status === 'Active';
  const py = size === 'sm' ? 'py-0.5' : 'py-1';
  const px = size === 'sm' ? 'px-2.5' : 'px-3';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${px} ${py} rounded-full font-semibold ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'
        }`}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
