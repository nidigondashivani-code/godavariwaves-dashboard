/**
 * DepartmentTeamLeadsDrawer Component
 * Dedicated right-side drawer opened when clicking "Team Leads" on a department card.
 * Displays all assigned Team Leads with Photo, ID, Name, Designation, Email, Phone,
 * Assigned Date, Status, Search, Filters, Pagination, and View Profile / Remove actions.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  UserCheck,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { DepartmentItem, TeamLeadMember } from '../types/department.types';

interface DepartmentTeamLeadsDrawerProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveLead: (departmentId: string, lead: TeamLeadMember) => void;
  onViewProfile: (lead: TeamLeadMember) => void;
  onOpenManage: (department: DepartmentItem) => void;
}

export const DepartmentTeamLeadsDrawer: React.FC<DepartmentTeamLeadsDrawerProps> = ({
  department,
  isOpen,
  onClose,
  onRemoveLead,
  onViewProfile,
  onOpenManage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredLeads = useMemo(() => {
    if (!department) return [];

    return department.teamLeads.filter((tl) => {
      const matchesSearch =
        tl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tl.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tl.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tl.companyEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || tl.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [department, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (!isOpen || !department) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md shrink-0"
                style={{ backgroundColor: department.accentColor }}
              >
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#111827]">
                    {department.name} Team Leads
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A]">
                    {department.teamLeadCount} Leads Assigned
                  </span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Designated departmental leaders with supervisory and sign-off authority.
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

          {/* Search, Filter & Quick Manage Action Bar */}
          <div className="p-4 border-b border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search team lead name, ID, designation..."
                className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive');
                  setCurrentPage(1);
                }}
                className="py-2 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManage(department);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
              >
                + Assign Lead
              </button>
            </div>
          </div>

          {/* Team Leads List Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {paginatedLeads.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-300">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Team Leads Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchTerm
                    ? 'No leads matching your current search terms.'
                    : 'This department currently does not have any active team leads assigned.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenManage(department);
                  }}
                  className="mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Assign a Team Lead
                </button>
              </div>
            ) : (
              paginatedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Avatar & Lead Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={lead.avatar}
                      alt={lead.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shadow-sm shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#111827]">
                          {lead.name}
                        </h4>
                        <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {lead.employeeId}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          {lead.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#2563EB]">
                        {lead.designation}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
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

                  {/* Right Actions: View Profile & Remove Team Lead */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onViewProfile(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      title="View Lead Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveLead(department.id, lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                      title="Remove from Team Lead assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Pagination */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
            <div>
              Showing {filteredLeads.length} of {department.teamLeadCount} Team Leads in {department.name}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentTeamLeadsDrawer;
