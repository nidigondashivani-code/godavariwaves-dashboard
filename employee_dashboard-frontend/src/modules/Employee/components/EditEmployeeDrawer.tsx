import React, { useState, useEffect } from 'react';
import { X, Edit2, Building, ShieldCheck } from 'lucide-react';
import {
  DEPARTMENTS,
  ROLES,
  EMPLOYMENT_TYPES,
  GENDERS,
} from '../constants/employee.constants';
import designationService from '../services/designation.service';
import { Employee, DepartmentType, RoleType, EmploymentType, GenderType, EmployeeStatusType } from '../types/employee.types';
import DashboardAccessToggle from './DashboardAccessToggle';

interface EditEmployeeDrawerProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Employee>) => void;
  existingEmployees: Employee[];
}

export const EditEmployeeDrawer: React.FC<EditEmployeeDrawerProps> = ({
  isOpen,
  employee,
  onClose,
  onSave,
  existingEmployees,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<GenderType>('Male');
  const [mobileNumber, setMobileNumber] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [address, setAddress] = useState('');

  // Company Information
  const [department, setDepartment] = useState<DepartmentType>('Software Development');
  const [designation, setDesignation] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [role, setRole] = useState<RoleType>('Employee');
  const [status, setStatus] = useState<EmployeeStatusType>('Active');
  const [dashboardAccess, setDashboardAccess] = useState(true);

  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setGender(employee.gender || 'Male');
      setMobileNumber(employee.mobileNumber || '');
      setPersonalEmail(employee.personalEmail || '');
      setAddress(employee.address || '');

      setDepartment(
        (DEPARTMENTS.includes(employee.department as DepartmentType)
          ? employee.department
          : 'Software Development') as DepartmentType
      );
      setDesignation(employee.designation || '');
      setReportingManagerId(employee.reportingManagerId || '');
      setEmploymentType(employee.employmentType || 'Full-time');
      setRole(employee.role || 'Employee');
      setStatus(employee.status || 'Active');
      setDashboardAccess(employee.dashboardAccess);
    }
  }, [employee]);

  // Dynamic designations from designationService
  const [designationsByDept, setDesignationsByDept] = useState(() => designationService.getDesignations());

  useEffect(() => {
    return designationService.subscribe(setDesignationsByDept);
  }, []);

  const designationsList = designationsByDept[department] || [];

  const handleDepartmentChange = (newDept: DepartmentType) => {
    setDepartment(newDept);
    const list = designationsByDept[newDept] || [];
    if (list.length > 0) {
      setDesignation(list[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    const reportingManager = existingEmployees.find((e) => e.id === reportingManagerId);

    onSave(employee.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      mobileNumber: mobileNumber.trim(),
      personalEmail: personalEmail.trim(),
      address: address.trim(),
      department,
      designation,
      reportingManagerId: reportingManagerId || undefined,
      reportingManagerName: reportingManager
        ? `${reportingManager.firstName} ${reportingManager.lastName}`
        : undefined,
      employmentType,
      role,
      status,
      dashboardAccess: status === 'Inactive' ? false : dashboardAccess,
      updatedBy: 'Admin',
    });

    onClose();
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" /> Edit Employee
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.firstName} {employee.lastName} &middot;{' '}
              <span className="font-mono font-semibold">{employee.employeeId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Read-only system notice */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <p>
              Administrative privileges active. Employees cannot edit their own company credentials or department information directly.
            </p>
          </div>

          {/* Section: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Email</label>
                <input
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section: Organization Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Organization & Role Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value as DepartmentType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {designationsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
                <select
                  value={reportingManagerId}
                  onChange={(e) => setReportingManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">None / Direct to Leadership</option>
                  {existingEmployees
                    .filter((e) => e.id !== employee.id)
                    .map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.firstName} {mgr.lastName} ({mgr.designation})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatusType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dashboard Access
              </label>
              <DashboardAccessToggle
                enabled={dashboardAccess}
                disabled={status === 'Inactive'}
                onChange={setDashboardAccess}
                label={dashboardAccess ? 'Access Enabled' : 'Access Disabled'}
              />
              {status === 'Inactive' && (
                <p className="text-[11px] text-amber-700 mt-1">
                  Access is automatically disabled while employee status is Inactive.
                </p>
              )}
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeDrawer;
