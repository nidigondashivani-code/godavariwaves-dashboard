/**
 * DepartmentCardGrid Component
 * Enhanced with:
 * - Total Employees
 * - Team Lead Count (e.g. 3 Team Leads)
 * - Active Projects / Campaigns (e.g. 12 Active Projects)
 * - Department Status (Status: Active)
 * - Three action buttons at the bottom of every card:
 *   1. View Details
 *   2. Team Leads
 *   3. Manage
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Megaphone,
  TrendingUp,
  Building2,
  Users,
  Eye,
  UserCheck,
  Settings,
  Target,
  Search,
  Share2,
  FileText,
  Palette,
  Briefcase,
} from 'lucide-react';
import { DepartmentItem } from '../types/department.types';

interface DepartmentCardGridProps {
  departments: DepartmentItem[];
  onViewDetails: (department: DepartmentItem) => void;
  onViewTeamLeads: (department: DepartmentItem) => void;
  onManageTeamLeads: (department: DepartmentItem) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Code2,
  Megaphone,
  TrendingUp,
  Building2,
};

export const DepartmentCardGrid: React.FC<DepartmentCardGridProps> = ({
  departments,
  onViewDetails,
  onViewTeamLeads,
  onManageTeamLeads,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {departments.map((dept, index) => {
        const IconComponent = ICON_MAP[dept.iconName] || Building2;
        const isMarketing = dept.name === 'Digital Marketing';

        return (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Top row: Icon, Department Name, Status */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                    style={{ backgroundColor: dept.accentColor }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Status : <span className="font-semibold text-emerald-600">{dept.status}</span>
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {dept.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed mb-4">
                {dept.description}
              </p>

              {/* Metric Highlights Pill: Total Employees | Team Leads | Active Projects */}
              <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5 mb-5 text-center">
                <div>
                  <span className="text-[10px] font-semibold text-[#6B7280] block mb-0.5">
                    Employees
                  </span>
                  <span className="text-base font-extrabold text-[#111827] block">
                    {dept.totalEmployees}
                  </span>
                  <span className="text-[9px] text-slate-400">Total Staff</span>
                </div>

                <div className="border-x border-slate-200">
                  <span className="text-[10px] font-semibold text-[#6B7280] block mb-0.5">
                    Team Leads
                  </span>
                  <span className="text-base font-extrabold text-[#2563EB] block">
                    {dept.teamLeadCount}
                  </span>
                  <span className="text-[9px] text-blue-500 font-semibold">
                    {dept.teamLeadCount === 1 ? '1 Team Lead' : `${dept.teamLeadCount} Team Leads`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#6B7280] block mb-0.5">
                    Active Projects
                  </span>
                  <span className="text-base font-extrabold text-[#111827] block">
                    {dept.activeProjectsCount}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate block">
                    {dept.activeProjectsLabel}
                  </span>
                </div>
              </div>

              {/* Team Lead Avatars Preview */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {dept.teamLeads.map((tl) => (
                      <img
                        key={tl.id}
                        src={tl.avatar}
                        alt={tl.name}
                        title={`${tl.name} (${tl.designation})`}
                        className="inline-block w-7 h-7 rounded-full ring-2 ring-white object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {dept.teamLeads.map((tl) => tl.name.split(' ')[0]).join(', ')}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {dept.performanceScore}% Score
                </span>
              </div>

              {/* Digital Marketing Specific Designations Preview */}
              {isMarketing && (
                <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 mb-4">
                  <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block mb-1.5">
                    Creative Roster Designations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-slate-700 font-medium border border-sky-100">
                      SEO Executive
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-slate-700 font-medium border border-sky-100">
                      Social Media Executive
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-slate-700 font-medium border border-sky-100">
                      Content Writer
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-bold border border-purple-200">
                      Graphic Designer ⭐
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* THREE ACTION BUTTONS: View Details | Team Leads | Manage */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onViewDetails(dept)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition text-center"
                title="View full department details & metrics"
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </button>

              <button
                type="button"
                onClick={() => onViewTeamLeads(dept)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition text-center"
                title="View all Team Leads in this department"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                Team Leads ({dept.teamLeadCount})
              </button>

              <button
                type="button"
                onClick={() => onManageTeamLeads(dept)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition text-center"
                title="Assign or remove Team Leads"
              >
                <Settings className="w-3.5 h-3.5" />
                Manage
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DepartmentCardGrid;
