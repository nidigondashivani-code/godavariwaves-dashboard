import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Employee } from '../types/employee.types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: () => void;
  isBulk?: boolean;
  bulkCount?: number;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  employee,
  onClose,
  onConfirm,
  isBulk = false,
  bulkCount = 1,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 bg-rose-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-sm text-slate-600 space-y-2">
          {isBulk ? (
            <p className="font-semibold text-slate-800">
              Are you sure you want to delete <span className="text-rose-600">{bulkCount} selected employees</span>?
            </p>
          ) : (
            <p className="font-semibold text-slate-800">
              Are you sure you want to delete employee{' '}
              <span className="text-rose-600">
                {employee?.firstName} {employee?.lastName} ({employee?.employeeId})
              </span>
              ?
            </p>
          )}
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            Note: Records will be <strong>soft-deleted</strong> and archived for compliance and historical audit logs. Login will be revoked immediately.
          </p>
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
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
