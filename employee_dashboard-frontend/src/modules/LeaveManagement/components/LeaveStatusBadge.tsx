import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { LeaveStatus } from '../types/leave.types';

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  size?: 'sm' | 'md';
}

export const LeaveStatusBadge: React.FC<LeaveStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const isSmall = size === 'sm';

  switch (status) {
    case 'Approved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200/80 ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <CheckCircle2 className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-600`} />
          <span>Approved</span>
        </span>
      );

    case 'Pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-amber-50 text-amber-700 border-amber-200/80 ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <Clock className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-600 animate-pulse`} />
          <span>Pending</span>
        </span>
      );

    case 'Rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-rose-50 text-rose-700 border-rose-200/80 ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <XCircle className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-rose-600`} />
          <span>Rejected</span>
        </span>
      );

    default:
      return null;
  }
};

export default LeaveStatusBadge;
