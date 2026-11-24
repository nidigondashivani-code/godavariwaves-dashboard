/**
 * PermissionConfirmationModal Component
 * Enterprise confirmation dialog before committing permission modifications to Employee role.
 */

import React from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

interface PermissionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  diffCount: number;
}

export const PermissionConfirmationModal: React.FC<PermissionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  diffCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2 flex-1">
            <h3 className="text-base font-bold text-[#111827]">
              Confirm Permission Changes
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              You are about to modify{' '}
              <strong className="text-slate-900 font-bold">
                {diffCount} permission{diffCount > 1 ? 's' : ''}
              </strong>{' '}
              for the <span className="text-[#2563EB] font-bold">Employee</span> role.
            </p>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-800">
              <span className="font-bold block mb-0.5">Security Notice:</span>
              Updated functional privileges will take effect immediately for all active employees assigned this role.
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
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            Apply & Commit Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionConfirmationModal;
