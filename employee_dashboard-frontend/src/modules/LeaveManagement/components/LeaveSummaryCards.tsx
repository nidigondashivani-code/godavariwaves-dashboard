import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  UserX,
  CalendarRange,
  ChevronRight,
} from 'lucide-react';
import { LeaveDashboardMetrics, SummaryCardFilterType } from '../types/leave.types';

interface LeaveSummaryCardsProps {
  metrics: LeaveDashboardMetrics;
  activeFilter: SummaryCardFilterType;
  onSelectFilter: (filter: SummaryCardFilterType) => void;
}

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 400;
    const stepTime = 20;
    const step = Math.max(1, Math.ceil(end / (duration / stepTime)));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

export const LeaveSummaryCards: React.FC<LeaveSummaryCardsProps> = ({
  metrics,
  activeFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'all' as SummaryCardFilterType,
      title: 'Total Requests',
      count: metrics.totalRequests,
      caption: 'All submitted leaves',
      icon: ClipboardList,
      iconBg: 'bg-blue-50 text-blue-600',
      activeRing: 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/25',
      countColor: 'text-slate-900',
    },
    {
      id: 'pending' as SummaryCardFilterType,
      title: 'Pending Approval',
      count: metrics.pendingApproval,
      caption: 'Requires Admin review',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
      activeRing: 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/25',
      countColor: 'text-amber-600',
    },
    {
      id: 'approved' as SummaryCardFilterType,
      title: 'Approved Leaves',
      count: metrics.approvedLeaves,
      caption: 'Authorized & scheduled',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      activeRing: 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/25',
      countColor: 'text-emerald-600',
    },
    {
      id: 'rejected' as SummaryCardFilterType,
      title: 'Rejected Leaves',
      count: metrics.rejectedLeaves,
      caption: 'Declined with reason',
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600',
      activeRing: 'border-rose-600 ring-2 ring-rose-600/20 bg-rose-50/25',
      countColor: 'text-rose-600',
    },
    {
      id: 'today' as SummaryCardFilterType,
      title: 'On Leave Today',
      count: metrics.onLeaveToday,
      caption: 'Absent with approval',
      icon: UserX,
      iconBg: 'bg-purple-50 text-purple-600',
      activeRing: 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/25',
      countColor: 'text-purple-600',
    },
    {
      id: 'upcoming' as SummaryCardFilterType,
      title: 'Upcoming Leaves',
      count: metrics.upcomingLeaves,
      caption: 'Starting after today',
      icon: CalendarRange,
      iconBg: 'bg-indigo-50 text-indigo-600',
      activeRing: 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/25',
      countColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`text-left rounded-2xl p-4 transition-all duration-200 h-full flex flex-col justify-between group shadow-sm border ${
              isActive
                ? card.activeRing
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition truncate pr-1">
                  {card.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${card.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black tracking-tight ${card.countColor}`}>
                  <AnimatedCounter value={card.count} />
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 px-1.5 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100/80 mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate pr-1 group-hover:text-slate-600 transition">
                {card.caption}
              </span>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive
                    ? 'text-blue-600 translate-x-0.5'
                    : 'text-slate-300 group-hover:translate-x-0.5'
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LeaveSummaryCards;
