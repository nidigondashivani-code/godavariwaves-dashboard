/**
 * DepartmentDetailsDrawer Component
 * Enhanced with the dedicated "Team Leads" section displaying:
 * - Profile Photo, Name, Designation, Email, Mobile Number, Assigned Date, Status
 * - Actions: View Profile, Remove Team Lead
 */

import React, { useState } from 'react';
import {
  X,
  Building2,
  Users,
  Target,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  Eye,
  Trash2,
  Shield,
} from 'lucide-react';
import { DepartmentItem, TeamLeadMember } from '../types/department.types';
import RemoveTeamLeadConfirmationModal from './RemoveTeamLeadConfirmationModal';

interface DepartmentDetailsDrawerProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onViewTeam: (dept: DepartmentItem) => void;
  onRemoveLead?: (departmentId: string, lead: TeamLeadMember) => void;
  onViewLeadProfile?: (lead: TeamLeadMember) => void;
}

export const DepartmentDetailsDrawer: React.FC<DepartmentDetailsDrawerProps> = ({
  department,
  isOpen,
  onClose,
  onViewTeam,
  onRemoveLead,
  onViewLeadProfile,
}) => {
  const [leadToRemove, setLeadToRemove] = useState<TeamLeadMember | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!isOpen || !department) return null;

  const isMarketing = department.name === 'Digital Marketing';

  const handleInitiateRemove = (lead: TeamLeadMember) => {
    setLeadToRemove(lead);
    setIsConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (leadToRemove && onRemoveLead) {
      onRemoveLead(department.id, leadToRemove);
      setIsConfirmOpen(false);
      setLeadToRemove(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md"
                style={{ backgroundColor: department.accentColor }}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#111827]">
                    {department.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {department.status}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Core Operational Division Overview
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Overview & Description */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Department Mission & Scope
              </h4>
              <p className="text-sm text-[#111827] leading-relaxed">
                {department.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-[#6B7280] block mb-0.5">
                    Total Workforce
                  </span>
                  <span className="text-lg font-bold text-[#111827]">
                    {department.totalEmployees} Employees
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-[#6B7280] block mb-0.5">
                    Performance Score
                  </span>
                  <span className="text-lg font-bold text-[#2563EB]">
                    {department.performanceScore}% Optimal
                  </span>
                </div>
              </div>
            </div>

            {/* NEW SECTION: TEAM LEADS */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                    Team Leads ({department.teamLeadCount})
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                  Active Departmental Leadership
                </span>
              </div>

              {department.teamLeads.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200">
                  No Team Leads assigned to this department currently.
                </div>
              ) : (
                <div className="space-y-3">
                  {department.teamLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Lead Profile Info */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={lead.avatar}
                          alt={lead.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-[#111827]">
                              {lead.name}
                            </h5>
                            <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                              {lead.employeeId}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                              {lead.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#2563EB] font-semibold">
                            {lead.designation}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {lead.companyEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {lead.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Assigned: {lead.assignedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {onViewLeadProfile && (
                          <button
                            type="button"
                            onClick={() => onViewLeadProfile(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition"
                          >
                            <Eye className="w-3 h-3" />
                            View Profile
                          </button>
                        )}
                        {onRemoveLead && (
                          <button
                            type="button"
                            onClick={() => handleInitiateRemove(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Designations Hierarchy Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Approved Department Designations
                </h4>
                <span className="text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                  {department.designations.length} Roles
                </span>
              </div>

              {isMarketing && (
                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-900 mb-2">
                  <span className="font-bold block mb-1">Creative Team Architecture:</span>
                  Graphic Designer functions directly as a vital creative designation under Digital Marketing, rather than a standalone silo.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {department.designations.map((designation) => {
                  const isGraphicDesigner = designation === 'Graphic Designer';

                  return (
                    <div
                      key={designation}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                        isGraphicDesigner
                          ? 'bg-purple-50 border-purple-200 text-purple-900 shadow-xs'
                          : 'bg-[#F8FAFC] border-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="truncate">{designation}</span>
                      {isGraphicDesigner && (
                        <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                          Designation
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Summary & Monthly Target */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Monthly Operational Objectives
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Target Objective:</span>
                  <span className="font-bold text-slate-900">{department.monthlyTarget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Status Assessment:</span>
                  <span className="font-bold text-emerald-600">{department.performanceStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Established Date:</span>
                  <span className="font-semibold text-slate-800">{department.createdDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E5E7EB] bg-white flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewTeam(department);
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition"
            >
              <Users className="w-4 h-4" />
              View Department Team ({department.totalEmployees})
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Removal */}
      <RemoveTeamLeadConfirmationModal
        isOpen={isConfirmOpen}
        lead={leadToRemove}
        onClose={() => {
          setIsConfirmOpen(false);
          setLeadToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
};

export default DepartmentDetailsDrawer;
