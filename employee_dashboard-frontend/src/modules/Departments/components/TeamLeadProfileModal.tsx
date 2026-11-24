/**
 * TeamLeadProfileModal Component
 * Displays detailed information about a selected Team Lead.
 */

import React from 'react';
import { X, UserCheck, Mail, Phone, Calendar, Building2, Shield, CheckCircle2 } from 'lucide-react';
import { TeamLeadMember } from '../types/department.types';

interface TeamLeadProfileModalProps {
  lead: TeamLeadMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamLeadProfileModal: React.FC<TeamLeadProfileModalProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E5E7EB] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Banner */}
        <div className="h-20 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] relative p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-black/20 text-white hover:bg-black/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="p-6 pt-0 relative -mt-10">
          <div className="flex items-end justify-between mb-4">
            <img
              src={lead.avatar}
              alt={lead.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
            />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {lead.status} Lead
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{lead.name}</h3>
            <p className="text-xs font-bold text-[#2563EB]">{lead.designation}</p>
            <span className="inline-block font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Employee ID: {lead.employeeId}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Department: <strong className="text-slate-900">{lead.department}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Email: <strong className="text-slate-900">{lead.companyEmail}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Phone: <strong className="text-slate-900">{lead.phone}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Assigned Date: <strong className="text-slate-900">{lead.assignedDate}</strong>
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeadProfileModal;
