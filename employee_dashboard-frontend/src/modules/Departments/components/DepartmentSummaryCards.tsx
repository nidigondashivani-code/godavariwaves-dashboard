/**
 * DepartmentSummaryCards Component
 * Updated with 5 responsive enterprise statistic cards:
 * 1. Total Departments
 * 2. Total Employees
 * 3. Total Team Leads
 * 4. Departments Without Team Leads
 * 5. Active Projects
 *
 * Enhanced with animated counters, responsive breakpoints (Desktop >=1440px single row of 5),
 * interactive click filtering, and active visual indicator rings.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, UserCheck, AlertCircle, Briefcase, ChevronRight } from 'lucide-react';
import { DepartmentSummaryMetrics } from '../types/department.types';

export type DepartmentCardFilterType =
  | 'total-depts'
  | 'total-emp'
  | 'total-team-leads'
  | 'depts-without-leads'
  | 'active-projects';

interface DepartmentSummaryCardsProps {
  metrics: DepartmentSummaryMetrics;
  activeCard?: DepartmentCardFilterType | null;
  onSelectCard?: (card: DepartmentCardFilterType) => void;
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

export const DepartmentSummaryCards: React.FC<DepartmentSummaryCardsProps> = ({
  metrics,
  activeCard,
  onSelectCard,
}) => {
  const cards = [
    {
      id: 'total-depts' as DepartmentCardFilterType,
      title: 'Total Departments',
      value: metrics.totalDepartments,
      description: 'Fixed 4 core operating divisions',
      trend: 'Core Hierarchy',
      trendColor: 'text-[#2563EB] bg-blue-50',
      icon: Building2,
      iconBg: 'bg-blue-50 text-[#2563EB] border border-blue-100',
      activeRing: 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20',
      caption: 'Reset & show all divisions',
    },
    {
      id: 'total-emp' as DepartmentCardFilterType,
      title: 'Total Employees',
      value: metrics.totalEmployees,
      description: 'Distributed across 4 divisions',
      trend: '+8.4% vs last Qtr',
      trendColor: 'text-emerald-700 bg-emerald-50',
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      activeRing: 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/20',
      caption: 'View workforce breakdown',
    },
    {
      id: 'total-team-leads' as DepartmentCardFilterType,
      title: 'Total Team Leads',
      value: metrics.totalTeamLeads,
      description: 'Active departmental leadership',
      trend: 'Multi-Lead Support',
      trendColor: 'text-indigo-700 bg-indigo-50',
      icon: UserCheck,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      activeRing: 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20',
      caption: 'Filter departments with leads',
    },
    {
      id: 'depts-without-leads' as DepartmentCardFilterType,
      title: 'Without Team Leads',
      value: metrics.departmentsWithoutLeads,
      description:
        metrics.departmentsWithoutLeads === 0
          ? 'All divisions covered'
          : 'Requires lead assignment',
      trend: metrics.departmentsWithoutLeads === 0 ? 'Optimal (0)' : 'Action Required',
      trendColor:
        metrics.departmentsWithoutLeads === 0
          ? 'text-emerald-700 bg-emerald-50'
          : 'text-rose-700 bg-rose-50',
      icon: AlertCircle,
      iconBg:
        metrics.departmentsWithoutLeads === 0
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          : 'bg-rose-50 text-rose-600 border border-rose-100',
      activeRing: 'border-rose-600 ring-2 ring-rose-600/20 bg-rose-50/20',
      caption: 'Filter unassigned divisions',
    },
    {
      id: 'active-projects' as DepartmentCardFilterType,
      title: 'Active Projects',
      value: metrics.activeProjects,
      description: 'Sprints, campaigns & pipelines',
      trend: '18 Total Initiatives',
      trendColor: 'text-amber-700 bg-amber-50',
      icon: Briefcase,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      activeRing: 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/20',
      caption: 'Sort by project volume',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => {
        const IconComp = card.icon;
        const isActive = activeCard === card.id;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            onClick={() => onSelectCard?.(card.id)}
            className={`rounded-2xl p-5 border shadow-xs transition-all relative overflow-hidden group flex flex-col justify-between cursor-pointer select-none text-left ${
              isActive
                ? `${card.activeRing} shadow-sm`
                : 'bg-white border-[#E5E7EB] hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div>
              {/* Top row: Icon & Trend Tag */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.trendColor}`}
                >
                  {card.trend}
                </span>
              </div>

              {/* Title & Value */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-0.5">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-2xl font-extrabold text-[#111827] tracking-tight">
                    <AnimatedCounter value={card.value} />
                  </h3>
                  {isActive && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-1">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="group-hover:text-slate-600 transition truncate">
                {card.caption}
              </span>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 group-hover:translate-x-0.5'
                }`}
              />
            </div>

            {/* Decorative bottom subtle border */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-cyan-400 transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default DepartmentSummaryCards;
