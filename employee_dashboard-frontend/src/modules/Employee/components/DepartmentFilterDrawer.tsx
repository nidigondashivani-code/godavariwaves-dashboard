import React from 'react';
import {
  X,
  Building2,
  Users,
  ShieldCheck,
  FolderGit2,
  ChevronRight,
  Code2,
  Megaphone,
  TrendingUp,
  Landmark,
} from 'lucide-react';
import { DepartmentType, Employee } from '../types/employee.types';

interface DepartmentFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDepartment: (department: DepartmentType) => void;
  selectedDepartment: string;
  employees: Employee[];
}

interface DepartmentMetadata {
  name: DepartmentType;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  teamLeadCount: number;
  activeProjects: string;
  accentBorder: string;
}

const DEPARTMENTS_METADATA: DepartmentMetadata[] = [
  {
    name: 'Software Development',
    description:
      'Engineers core enterprise platforms, frontend & backend architecture, and cloud infrastructure.',
    icon: Code2,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    teamLeadCount: 3,
    activeProjects: '12 Active Projects',
    accentBorder: 'hover:border-blue-500',
  },
  {
    name: 'Digital Marketing',
    description:
      'Drives search engine optimization, corporate growth campaigns, content creation, and graphic design.',
    icon: Megaphone,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    teamLeadCount: 1,
    activeProjects: '8 Active Campaigns',
    accentBorder: 'hover:border-purple-500',
  },
  {
    name: 'Sales',
    description:
      'Manages enterprise client partnerships, product demonstrations, client onboarding, and revenue generation.',
    icon: TrendingUp,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    teamLeadCount: 1,
    activeProjects: '5 Revenue Pipelines',
    accentBorder: 'hover:border-amber-500',
  },
  {
    name: 'Administration',
    description:
      'Supervises corporate facilities, employee operations, logistics, organizational compliance, and executive office affairs.',
    icon: Landmark,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    teamLeadCount: 1,
    activeProjects: '3 Operational Workflows',
    accentBorder: 'hover:border-emerald-500',
  },
];

export const DepartmentFilterDrawer: React.FC<DepartmentFilterDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDepartment,
  selectedDepartment,
  employees,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Filter by Department</h2>
                <p className="text-xs text-slate-500">
                  Select a department to filter directory records
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Department List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span>Organization Divisions (4 Total)</span>
              <span className="font-semibold text-slate-700">All Active</span>
            </div>

            {DEPARTMENTS_METADATA.map((dept) => {
              const Icon = dept.icon;
              const deptEmployees = employees.filter((e) => e.department === dept.name);
              const isSelected = selectedDepartment === dept.name;

              return (
                <div
                  key={dept.name}
                  onClick={() => {
                    onSelectDepartment(dept.name);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-sm'
                      : `bg-white border-slate-200 ${dept.accentBorder} hover:shadow-md`
                  }`}
                >
                  {/* Title & Icon */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${dept.iconBg} ${dept.iconColor}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {dept.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                        isSelected ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {dept.description}
                  </p>

                  {/* Metrics Footer */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>Staff</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {deptEmployees.length}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" />
                        <span>Leads</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">
                        {dept.teamLeadCount}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                        <FolderGit2 className="w-3 h-3 text-emerald-500" />
                        <span>Work</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 truncate block">
                        {dept.activeProjects.split(' ')[0]} Active
                      </span>
                    </div>
                  </div>

                  {/* Filter action */}
                  <div className="mt-3 flex items-center justify-end">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Currently Selected' : 'Filter by this Department'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {selectedDepartment ? `Active: ${selectedDepartment}` : 'No department selected'}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentFilterDrawer;
