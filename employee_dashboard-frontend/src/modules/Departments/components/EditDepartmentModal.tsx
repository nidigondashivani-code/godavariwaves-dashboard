/**
 * EditDepartmentModal Component
 * Modal dialog for Admin to modify department details: Team Lead, Status, Monthly Target, and Description.
 */

import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { DepartmentItem, DepartmentStatus } from '../types/department.types';

interface EditDepartmentModalProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<DepartmentItem>) => void;
}

export const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  department,
  isOpen,
  onClose,
  onSave,
}) => {
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadDesignation, setLeadDesignation] = useState('');
  const [status, setStatus] = useState<DepartmentStatus>('Active');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (department) {
      setLeadName(department.teamLead.name);
      setLeadEmail(department.teamLead.email);
      setLeadPhone(department.teamLead.phone);
      setLeadDesignation(department.teamLead.designation);
      setStatus(department.status);
      setMonthlyTarget(department.monthlyTarget || '');
      setDescription(department.description);
    }
  }, [department, isOpen]);

  if (!isOpen || !department) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(department.id, {
      teamLead: {
        ...department.teamLead,
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        designation: leadDesignation,
      },
      status,
      monthlyTarget,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E5E7EB] z-10 p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
              style={{ backgroundColor: department.accentColor }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">
                Edit {department.name}
              </h3>
              <p className="text-xs text-[#6B7280]">
                Update leadership and operational targets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Team Lead Name
            </label>
            <input
              type="text"
              required
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lead Email
              </label>
              <input
                type="email"
                required
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lead Phone
              </label>
              <input
                type="text"
                required
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lead Designation
              </label>
              <input
                type="text"
                required
                value={leadDesignation}
                onChange={(e) => setLeadDesignation(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Department Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DepartmentStatus)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Restructuring">Restructuring</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Monthly Operational Target
            </label>
            <input
              type="text"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Department Scope & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal;
