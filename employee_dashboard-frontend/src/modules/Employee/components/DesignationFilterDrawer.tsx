import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ChevronRight,
  Layers,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DEPARTMENTS } from '../constants/employee.constants';
import { DepartmentType, Employee } from '../types/employee.types';
import designationService from '../services/designation.service';

interface DesignationFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDesignation: (designation: string, department?: DepartmentType) => void;
  selectedDesignation: string;
  employees: Employee[];
  onEmployeesUpdated?: () => void;
  onAddToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const DesignationFilterDrawer: React.FC<DesignationFilterDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDesignation,
  selectedDesignation,
  employees,
  onEmployeesUpdated,
  onAddToast,
}) => {
  // Real-time designations state from service
  const [designationsByDept, setDesignationsByDept] = useState(() => designationService.getDesignations());
  const [searchQuery, setSearchQuery] = useState('');

  // Inline editing state: { department, oldTitle, currentTitle, error }
  const [editingTarget, setEditingTarget] = useState<{
    department: DepartmentType;
    oldTitle: string;
    currentTitle: string;
    error?: string;
  } | null>(null);

  // Add designation modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDept, setAddDept] = useState<DepartmentType>('Software Development');
  const [newTitle, setNewTitle] = useState('');
  const [addError, setAddError] = useState('');

  // Delete confirmation modal state
  const [deletingTarget, setDeletingTarget] = useState<{
    department: DepartmentType;
    title: string;
    assignedEmployees: Employee[];
    reassignTo: string;
  } | null>(null);

  // Subscribe to designation changes
  useEffect(() => {
    return designationService.subscribe((updated) => {
      setDesignationsByDept(updated);
    });
  }, []);

  // Filtered designations based on search query
  const filteredDepartments = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const allRoles = designationsByDept[dept] || [];
      const matchingRoles = searchQuery.trim()
        ? allRoles.filter((r) => r.toLowerCase().includes(searchQuery.toLowerCase().trim()))
        : allRoles;
      return {
        department: dept,
        roles: matchingRoles,
        totalRolesCount: allRoles.length,
      };
    });
  }, [designationsByDept, searchQuery]);

  if (!isOpen) return null;

  // Handle Add Designation
  const handleOpenAddModal = (dept?: DepartmentType) => {
    setAddDept(dept || 'Software Development');
    setNewTitle('');
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setAddError('Please enter a designation title.');
      return;
    }

    const res = designationService.addDesignation(addDept, newTitle.trim());
    if (!res.success) {
      setAddError(res.message || 'Failed to add designation.');
      return;
    }

    onAddToast?.(
      'success',
      'Designation Added',
      `"${newTitle.trim()}" has been created under ${addDept}.`
    );
    onEmployeesUpdated?.();
    setIsAddModalOpen(false);
    setNewTitle('');
    setAddError('');
  };

  // Handle Start Editing
  const handleStartEdit = (dept: DepartmentType, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTarget({
      department: dept,
      oldTitle: title,
      currentTitle: title,
    });
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingTarget) return;

    const trimmed = editingTarget.currentTitle.trim();
    if (!trimmed) {
      setEditingTarget({ ...editingTarget, error: 'Title cannot be empty' });
      return;
    }

    if (trimmed === editingTarget.oldTitle) {
      setEditingTarget(null);
      return;
    }

    const res = designationService.updateDesignation(
      editingTarget.department,
      editingTarget.oldTitle,
      trimmed
    );

    if (!res.success) {
      setEditingTarget({ ...editingTarget, error: res.message || 'Duplicate title' });
      return;
    }

    onAddToast?.(
      'success',
      'Designation Updated',
      `Renamed "${editingTarget.oldTitle}" to "${trimmed}".${
        res.affectedCount && res.affectedCount > 0
          ? ` Updated ${res.affectedCount} employee profile(s).`
          : ''
      }`
    );
    onEmployeesUpdated?.();
    setEditingTarget(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTarget(null);
  };

  // Handle Start Delete
  const handleStartDelete = (dept: DepartmentType, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const assigned = employees.filter((emp) => emp.department === dept && emp.designation === title);
    const otherRoles = (designationsByDept[dept] || []).filter((r) => r !== title);

    setDeletingTarget({
      department: dept,
      title,
      assignedEmployees: assigned,
      reassignTo: otherRoles[0] || '',
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingTarget) return;

    const res = designationService.deleteDesignation(
      deletingTarget.department,
      deletingTarget.title,
      deletingTarget.reassignTo
    );

    if (!res.success) {
      onAddToast?.('error', 'Action Failed', res.message || 'Cannot remove designation.');
      setDeletingTarget(null);
      return;
    }

    onAddToast?.(
      'info',
      'Designation Removed',
      `"${deletingTarget.title}" was removed from ${deletingTarget.department}.${
        res.affectedCount && res.affectedCount > 0
          ? ` Reassigned ${res.affectedCount} staff to ${deletingTarget.reassignTo}.`
          : ''
      }`
    );
    onEmployeesUpdated?.();
    setDeletingTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-end">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Designation</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search bar inside drawer */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job titles (e.g. Engineer, Executive, Lead)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Grouped Designations List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {filteredDepartments.map(({ department, roles, totalRolesCount }) => {
              return (
                <div key={department} className="space-y-2.5">
                  {/* Department Section Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      {department}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {totalRolesCount} {totalRolesCount === 1 ? 'Role' : 'Roles'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(department)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Designations in this department */}
                  <div className="space-y-1.5">
                    {roles.length === 0 ? (
                      <div className="text-center py-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                        No matching designations found
                      </div>
                    ) : (
                      roles.map((desig) => {
                        const count = employees.filter(
                          (e) => e.department === department && e.designation === desig
                        ).length;
                        const isSelected = selectedDesignation === desig;
                        const isEditingThis =
                          editingTarget?.department === department &&
                          editingTarget?.oldTitle === desig;

                        if (isEditingThis) {
                          return (
                            <div
                              key={desig}
                              className="p-2.5 rounded-xl border border-blue-400 bg-blue-50/40 space-y-2 animate-in fade-in"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingTarget.currentTitle}
                                  onChange={(e) =>
                                    setEditingTarget({
                                      ...editingTarget,
                                      currentTitle: e.target.value,
                                      error: undefined,
                                    })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(e as any);
                                    if (e.key === 'Escape') handleCancelEdit(e as any);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter designation title..."
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                                  title="Save Title"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {editingTarget.error && (
                                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {editingTarget.error}
                                </p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={desig}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition group ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            {/* Left: Indicator, Title & Count */}
                            <button
                              type="button"
                              onClick={() => {
                                onSelectDesignation(desig, department);
                                onClose();
                              }}
                              className="flex items-center gap-2 flex-1 text-left min-w-0 pr-2"
                              title={`Click to filter employees with ${desig}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isSelected ? 'bg-blue-600' : 'bg-slate-300 group-hover:bg-blue-500'
                                }`}
                              />
                              <span className="font-semibold truncate text-slate-900 group-hover:text-blue-600 transition">
                                {desig}
                              </span>
                            </button>

                            {/* Right: Badge, Edit, Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isSelected
                                    ? 'bg-blue-200/70 text-blue-900'
                                    : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800'
                                }`}
                              >
                                {count} {count === 1 ? 'Staff' : 'Staff'}
                              </span>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={(e) => handleStartEdit(department, desig, e)}
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Edit designation title"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={(e) => handleStartDelete(department, desig, e)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Remove designation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all designations back to system default configuration?')) {
                  designationService.resetToDefaults();
                  onAddToast?.('info', 'Restored Defaults', 'System designations restored.');
                  onEmployeesUpdated?.();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Add Designation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Add New Designation</h3>
                  <p className="text-xs text-slate-500">Create a job title within a department</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value as DepartmentType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Designation Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Lead QA Specialist, Campaign Strategist"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setAddError('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                {addError && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {addError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Designation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Delete / Remove Designation Confirmation */}
      {deletingTarget && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Remove Designation</h3>
                <p className="text-xs text-slate-500">
                  {deletingTarget.department} &bull; {deletingTarget.title}
                </p>
              </div>
            </div>

            {deletingTarget.assignedEmployees.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      {deletingTarget.assignedEmployees.length} staff currently assigned to this
                      role
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Before deleting "{deletingTarget.title}", select a replacement designation for
                    assigned employees.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reassign Employees To:
                  </label>
                  <select
                    value={deletingTarget.reassignTo}
                    onChange={(e) =>
                      setDeletingTarget({ ...deletingTarget, reassignTo: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {(designationsByDept[deletingTarget.department] || [])
                      .filter((r) => r !== deletingTarget.title)
                      .map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Are you sure you want to remove the designation{' '}
                <strong>"{deletingTarget.title}"</strong> from{' '}
                <strong>{deletingTarget.department}</strong>? No staff are currently assigned to this
                role.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Designation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignationFilterDrawer;
