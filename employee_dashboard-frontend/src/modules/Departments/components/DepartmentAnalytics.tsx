/**
 * DepartmentAnalytics Component
 * Visual representations of Employee Distribution (Software: 48, Digital Marketing: 32,
 * Sales: 30, Administration: 15) and clean enterprise charts for growth, projects, and performance.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Users, TrendingUp, Briefcase, Award, Layers } from 'lucide-react';
import { DEPARTMENT_ANALYTICS_DATA } from '../constants/department.constants';

export const DepartmentAnalytics: React.FC = () => {
  const { distribution, monthlyGrowth, projectBreakdown } = DEPARTMENT_ANALYTICS_DATA;

  return (
    <div className="space-y-6 mb-8">
      {/* 1. Employee Distribution Section (Visual Representation with Progress Bars & KPI Cards) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">
                Workforce Distribution by Department
              </h3>
              <p className="text-xs text-[#6B7280]">
                Proportional headcount allocation across 125 total enterprise staff.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            125 Employees Active
          </span>
        </div>

        {/* Horizontal Stacked Proportional Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex mb-6 bg-slate-100">
          {distribution.map((item) => (
            <div
              key={item.name}
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              className="h-full transition-all duration-500 hover:opacity-90 relative group"
              title={`${item.name}: ${item.employees} Employees (${item.percentage}%)`}
            />
          ))}
        </div>

        {/* Detailed Horizontal Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {distribution.map((item) => (
            <div
              key={item.name}
              className="bg-[#F8FAFC] border border-[#E5E7EB] p-4 rounded-2xl space-y-2 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {item.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#111827]">
                  {item.employees}{' '}
                  <span className="text-xs font-medium text-[#6B7280]">Staff</span>
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: item.color }}
                >
                  {item.percentage}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Charts Grid: Growth Trends & Project Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Growth Trend Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2563EB]" />
              <h4 className="text-sm font-bold text-[#111827]">
                Department Headcount Growth (Last 6 Months)
              </h4>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="software"
                  name="Software"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="marketing"
                  name="Marketing"
                  stroke="#0EA5E9"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="admin"
                  name="Admin"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project & Campaign Workload Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
              <h4 className="text-sm font-bold text-[#111827]">
                Operational Volume & Project Breakdown
              </h4>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="active" name="Active Initiatives" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed Deliverables" fill="#93C5FD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnalytics;
