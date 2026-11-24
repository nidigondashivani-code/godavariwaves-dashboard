import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AttendanceSummaryMetric } from '../types/attendance.types';

interface AttendanceStatsCardProps {
  metric: AttendanceSummaryMetric;
  icon: LucideIcon;
  color: string;
  active: boolean;
  onClick: () => void;
}

export const AttendanceStatsCard: React.FC<AttendanceStatsCardProps> = ({
  metric,
  icon: Icon,
  color,
  active,
  onClick,
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.98 }}
    className={`min-w-0 rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
      active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
    }`}
    aria-pressed={active}
  >
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-semibold text-slate-600">{metric.label}</span>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-4 w-4" />
      </span>
    </div>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-2xl font-black tracking-tight text-slate-900">{metric.count}</span>
      <span className="text-[11px] font-semibold text-slate-500">{metric.percentage}%</span>
    </div>
    <p className="mt-1 truncate text-[11px] text-slate-500">{metric.description}</p>
  </motion.button>
);

export default AttendanceStatsCard;