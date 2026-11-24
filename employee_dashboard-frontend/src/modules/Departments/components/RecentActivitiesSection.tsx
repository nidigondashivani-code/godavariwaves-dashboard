/**
 * RecentActivitiesSection Component
 * Displays latest department operational events and milestones.
 * Examples: Employee transferred to Software Development, New employee joined Digital Marketing,
 * Sales reached monthly target, Administration updated office policies.
 */

import React, { useState } from 'react';
import { Activity, Clock, Search, CheckCircle2, Building2 } from 'lucide-react';
import { DepartmentActivity } from '../types/department.types';

interface RecentActivitiesSectionProps {
  activities: DepartmentActivity[];
}

export const RecentActivitiesSection: React.FC<RecentActivitiesSectionProps> = ({ activities }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = activities.filter(
    (act) =>
      act.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mb-8">
      {/* Header */}
      <div className="p-5 border-b border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Recent Department Activities</h3>
            <p className="text-xs text-[#6B7280]">
              Operational milestones, personnel movements, and status updates across departments.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider select-none">
              <th className="py-3 px-6">Date & Time</th>
              <th className="py-3 px-4">Activity Description</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No department activities matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-6 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.activity}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                      {item.department}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivitiesSection;
