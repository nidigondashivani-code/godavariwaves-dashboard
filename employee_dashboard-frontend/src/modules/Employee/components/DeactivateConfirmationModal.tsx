import React, { useState } from 'react';
import { UserX, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Employee, InactivityReasonType } from '../types/employee.types';
import { INACTIVITY_REASONS } from '../constants/employee.constants';

interface DeactivateConfirmationModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isActivating?: boolean;
}

export const DeactivateConfirmationModal: React.FC<DeactivateConfirmationModalProps> = ({
  isOpen,
  employee,
  onClose,
  onConfirm,
  isActivating = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Deactivated');

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isActivating ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              {isActivating ? <CheckCircle className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isActivating ? 'Activate Employee' : 'Deactivate Employee'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-sm text-slate-600 space-y-3">
          <p className="font-semibold text-slate-800">
            {isActivating
              ? `Are you sure you want to activate ${employee.firstName} ${employee.lastName}?`
              : `Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`}
          </p>

          {!isActivating ? (
            <>
              {/* Reason selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Reason for Inactivity:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INACTIVITY_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition ${
                        selectedReason === reason
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  After deactivation:
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  <li>Company dashboard login will be blocked immediately.</li>
                  <li>Dashboard access will be automatically revoked.</li>
                  <li>Inactivity reason will be archived across system logs.</li>
                </ul>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800">
              Employee login will be restored and dashboard access will be re-enabled.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(isActivating ? undefined : selectedReason);
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition ${
              isActivating
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isActivating ? 'Activate Employee' : 'Confirm Deactivation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateConfirmationModal;
