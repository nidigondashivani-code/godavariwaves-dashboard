/**
 * RemoveTeamLeadConfirmationModal Component
 * Confirmation dialog before removing a Team Lead assignment.
 * Message: "Are you sure you want to remove this Team Lead?"
 * Buttons: Cancel, Remove
 */

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { TeamLeadMember } from '../types/department.types';

interface RemoveTeamLeadConfirmationModalProps {
  isOpen: boolean;
  lead: TeamLeadMember | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const RemoveTeamLeadConfirmationModal: React.FC<RemoveTeamLeadConfirmationModalProps> = ({
  isOpen,
  lead,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E5E7EB] z-10 p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2 flex-1">
            <h3 className="text-base font-bold text-[#111827]">
              Remove Team Lead Assignment
            </h3>
            <p className="text-sm font-semibold text-slate-800">
              Are you sure you want to remove this Team Lead?
            </p>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              This will remove <strong>{lead.name}</strong> ({lead.employeeId}) from supervisory team lead privileges in <strong>{lead.department}</strong>.
            </p>
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 font-medium">
              Note: Removing a Team Lead only removes their assignment. It does NOT delete or alter the employee record.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveTeamLeadConfirmationModal;
