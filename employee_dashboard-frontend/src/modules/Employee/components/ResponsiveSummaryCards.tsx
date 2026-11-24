import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  Building2,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { EmployeeDashboardMetrics } from '../types/employee.types';

export type SummaryCardType =
  | 'total'
  | 'active'
  | 'departments'
  | 'designations';

interface ResponsiveSummaryCardsProps {
  metrics: EmployeeDashboardMetrics;
  activeCard: SummaryCardType | null;
  onSelectCard: (card: SummaryCardType) => void;
}

// Micro animated counter
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 500;
    const incrementTime = 20;
    const step = Math.max(1, Math.ceil(end / (duration / incrementTime)));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

export const ResponsiveSummaryCards: React.FC<ResponsiveSummaryCardsProps> = ({
  metrics,
  activeCard,
  onSelectCard,
}) => {
  const cards = [
    {
      id: 'total' as SummaryCardType,
      title: 'Total Staff',
      count: metrics.totalEmployees,
      caption: 'Reset & show all staff',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      activeRing: 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/30',
      countColor: 'text-slate-900',
      tag: 'Company wide',
    },
    {
      id: 'active' as SummaryCardType,
      title: 'Active',
      count: metrics.activeEmployees,
      caption: 'Logged & dashboard ready',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      activeRing: 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/30',
      countColor: 'text-emerald-600',
      tag: '100% Verified',
    },
    {
      id: 'departments' as SummaryCardType,
      title: 'Departments',
      count: metrics.departmentCount,
      caption: 'Click to filter division',
      icon: Building2,
      iconBg: 'bg-amber-50 text-amber-700',
      activeRing: 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/30',
      countColor: 'text-slate-900',
      tag: '4 Divisions',
    },
    {
      id: 'designations' as SummaryCardType,
      title: 'Designations',
      count: metrics.designationCount,
      caption: 'Click to filter job roles',
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-indigo-600',
      activeRing: 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/30',
      countColor: 'text-slate-900',
      tag: 'Role Matrix',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeCard === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectCard(card.id)}
            className={`text-left rounded-2xl p-4 transition-all duration-200 h-full flex flex-col justify-between group shadow-sm border ${
              isActive
                ? card.activeRing
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {/* Header row: title and icon */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition">
                  {card.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${card.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Counter */}
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black tracking-tight ${card.countColor}`}>
                  <AnimatedCounter value={card.count} />
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                    Active Filter
                  </span>
                )}
              </div>
            </div>

            {/* Footer caption & pill */}
            <div className="pt-3 border-t border-slate-100/80 mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate pr-1 group-hover:text-slate-600 transition">
                {card.caption}
              </span>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 group-hover:translate-x-0.5'
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ResponsiveSummaryCards;
