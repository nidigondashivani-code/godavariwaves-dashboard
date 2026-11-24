/**
 * ManageTeamLeadsDrawer Component
 * Triggered by the "Manage" button on Department Cards.
 * Sections:
 * 1. Current Team Leads (with Remove button & confirmation dialog)
 * 2. Add Team Lead:
 *    - Shows ONLY employees from the selected department (excludes other departments)
 *    - Only Active employees can be assigned
 *    - Prevents duplicates (excludes already assigned team leads)
 *    - Displays Employee Name, Employee ID, Designation, Status, and "Assign Team Lead" button.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Settings,
  UserCheck,
  UserPlus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { DepartmentEmployee, DepartmentItem, TeamLeadMember } from '../types/department.types';
import { departmentService } from '../services/department.service';
import RemoveTeamLeadConfirmationModal from './RemoveTeamLeadConfirmationModal';

interface ManageTeamLeadsDrawerProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignLead: (departmentId: string, employeeId: string) => void;
  onRemoveLead: (departmentId: string, teamLeadId: string) => void;
}

export const ManageTeamLeadsDrawer: React.FC<ManageTeamLeadsDrawerProps> = ({
  department,
  isOpen,
  onClose,
  onAssignLead,
  onRemoveLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leadToRemove, setLeadToRemove] = useState<TeamLeadMember | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Get department employees (STRICT: only from this department!)
  const departmentEmployees = useMemo(() => {
    if (!department) return [];
    return departmentService.getEmployeesByDepartment(department.name);
  }, [department]);

  // Filter available candidate employees to assign as team lead:
  // 1. Only from this department
  // 2. Only Active employees
  // 3. Not already a Team Lead
  const assignableCandidates = useMemo(() => {
    if (!department) return [];

    const existingLeadIds = new Set(
      department.teamLeads.map((tl) => tl.employeeId)
    );

    return departmentEmployees.filter((emp) => {
      // Must be Active
      if (emp.status !== 'Active') return false;
      // Must not already be assigned
      if (existingLeadIds.has(emp.employeeId)) return false;

      // Search match
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        return (
          emp.name.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query) ||
          emp.designation.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [department, departmentEmployees, searchTerm]);

  if (!isOpen || !department) return null;

  const handleInitiateRemove = (lead: TeamLeadMember) => {
    setLeadToRemove(lead);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (leadToRemove && department) {
      onRemoveLead(department.id, leadToRemove.id);
      setIsConfirmModalOpen(false);
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
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md shrink-0"
                style={{ backgroundColor: department.accentColor }}
              >
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#111827]">
                    Manage {department.name} Leadership
                  </h2>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Assign new team leads from departmental staff or remove existing appointments.
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* SECTION 1: Current Assigned Team Leads */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Current Assigned Team Leads ({department.teamLeadCount})
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {department.teamLeadCount === 0 ? 'No leads assigned' : 'Active Appointments'}
                </span>
              </div>

              {department.teamLeads.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    No Team Leads currently assigned to this department. Use the section below to assign a qualified active employee.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {department.teamLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] flex items-center justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={lead.avatar}
                          alt={lead.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {lead.name}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {lead.employeeId}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#2563EB] font-medium">
                            {lead.designation}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Assigned on {lead.assignedDate}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button with Confirmation */}
                      <button
                        type="button"
                        onClick={() => handleInitiateRemove(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-xs transition"
                        title="Remove Team Lead assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: Add Team Lead */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Add Team Lead (From {department.name} Only)
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  Active Department Staff
                </span>
              </div>

              {/* Department Guard Note */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
                <span className="font-bold block mb-0.5">Department Integrity Check:</span>
                Only active employees belonging exclusively to <strong>{department.name}</strong> are eligible for appointment. Staff from other departments cannot be assigned here.
              </div>

              {/* Search candidate input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search active ${department.name} employees...`}
                  className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Candidate Employees List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {assignableCandidates.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    {searchTerm
                      ? 'No employees match your search criteria.'
                      : `All active employees in ${department.name} are already assigned as Team Leads.`}
                  </div>
                ) : (
                  assignableCandidates.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {emp.name}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {emp.employeeId}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {emp.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            {emp.designation}
                          </p>
                        </div>
                      </div>

                      {/* Button: Assign Team Lead */}
                      <button
                        type="button"
                        onClick={() => onAssignLead(department.id, emp.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Assign Team Lead
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">
              Appointments update the department card and system records instantly.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Removal */}
      <RemoveTeamLeadConfirmationModal
        isOpen={isConfirmModalOpen}
        lead={leadToRemove}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setLeadToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
};

export default ManageTeamLeadsDrawer;
