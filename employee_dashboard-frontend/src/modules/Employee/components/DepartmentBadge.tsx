import React from 'react';
import { DepartmentType } from '../types/employee.types';

interface DepartmentBadgeProps {
  department: DepartmentType | string;
}

const DEPARTMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Software Development': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/70' },
  'Digital Marketing': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/70' },
  Sales: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200/70' },
  'Graphic Design': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200/70' },
  HR: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/70' },
  Finance: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/70' },
  Administration: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300/70' },
};

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({ department }) => {
  const color = DEPARTMENT_COLORS[department] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
    >
      {department}
    </span>
  );
};

export default DepartmentBadge;
