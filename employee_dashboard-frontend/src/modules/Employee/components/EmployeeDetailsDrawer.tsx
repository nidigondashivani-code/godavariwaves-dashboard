import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  UserCheck,
  ShieldAlert,
  KeyRound,
  Edit2,
  Clock,
  MapPin,
  History,
  Activity,
} from 'lucide-react';
import { Employee } from '../types/employee.types';
import StatusBadge from './StatusBadge';
import DepartmentBadge from './DepartmentBadge';
import { getAssetUrl } from '../../../config/env.config';

interface EmployeeDetailsDrawerProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
  onResetPassword: (emp: Employee) => void;
  onToggleStatus: (emp: Employee) => void;
}

export const EmployeeDetailsDrawer: React.FC<EmployeeDetailsDrawerProps> = ({
  isOpen,
  employee,
  onClose,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'security'>('profile');
  const [imageFailed, setImageFailed] = useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [employee?.id, employee?.photoUrl]);

  if (!isOpen || !employee) return null;

  const initials = `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Employee Profile &middot; {employee.employeeId}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {employee.photoUrl && !imageFailed ? (
                <img
                  src={getAssetUrl(employee.photoUrl) || employee.photoUrl}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20 shadow-lg"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-700 text-white font-extrabold flex items-center justify-center text-xl ring-4 ring-white/20 shadow-lg">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-blue-200 text-xs mt-0.5">{employee.designation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {employee.department}
                  </span>
                  <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {employee.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={employee.status} />
              {employee.dashboardAccess ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                  <UserCheck className="w-3.5 h-3.5" /> Dashboard Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5" /> Access Disabled
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Information
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Employment History
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Access & Audit Log
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Personal Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Gender</span>
                    <span className="font-semibold text-slate-800">{employee.gender || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                    <span className="font-semibold text-slate-800">{employee.dateOfBirth || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Mobile Phone</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {employee.mobileNumber || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Personal Email</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {employee.personalEmail || '-'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Residential Address</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {employee.address || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Company & Role Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Company Email</span>
                    <span className="font-semibold text-slate-800 font-mono text-[11px]">
                      {employee.companyEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Department</span>
                    <div className="mt-0.5">
                      <DepartmentBadge department={employee.department} />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Designation</span>
                    <span className="font-semibold text-slate-800">{employee.designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Employment Type</span>
                    <span className="font-semibold text-slate-800">{employee.employmentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Reporting Manager</span>
                    <span className="font-semibold text-slate-800">
                      {employee.reportingManagerName || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Date of Joining</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {employee.joiningDate}
                    </span>
                  </div>
                  {employee.status === 'Inactive' && (
                    <div className="col-span-2 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-center justify-between text-xs mt-1">
                      <span className="text-rose-700 font-semibold flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        Inactivity Reason:
                      </span>
                      <span className="font-bold text-rose-800 bg-white px-2.5 py-0.5 rounded border border-rose-200">
                        {employee.inactivityReason || 'Deactivated'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Career Milestones & Organizational History
              </h4>
              {employee.employmentHistory && employee.employmentHistory.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-blue-200 space-y-6 my-4">
                  {employee.employmentHistory.map((entry) => (
                    <div key={entry.id} className="relative">
                      <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="text-xs font-bold text-slate-800">{entry.changeType}</div>
                      <div className="text-xs text-blue-700 font-medium mt-0.5">
                        {entry.designation} &middot; {entry.department}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" /> {entry.date}
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-2 border border-slate-200">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No promotional or department transfer history recorded yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-500 uppercase tracking-wider">
                  Audit Metadata & Login Session
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Last Login Timestamp</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {employee.lastLogin || 'Never logged in'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Created By</span>
                    <span className="font-semibold text-slate-800">{employee.createdBy || 'System'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Created At</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Last Profile Update</span>
                    <span className="font-semibold text-slate-800">
                      {employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : 'Initial state'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login history table */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Recent Authentication Events
                </h4>
                {employee.loginHistory && employee.loginHistory.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                        <tr>
                          <th className="p-2">Timestamp</th>
                          <th className="p-2">IP Address</th>
                          <th className="p-2">Device</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {employee.loginHistory.map((lh) => (
                          <tr key={lh.id}>
                            <td className="p-2">{lh.timestamp}</td>
                            <td className="p-2 font-mono">{lh.ipAddress}</td>
                            <td className="p-2">{lh.device}</td>
                            <td className="p-2">
                              <span className="text-emerald-700 font-semibold">{lh.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No historical login records on file.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => onResetPassword(employee)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <KeyRound className="w-3.5 h-3.5" /> Reset Password
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStatus(employee)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
                employee.status === 'Active'
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {employee.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
            </button>
            <button
              onClick={() => onEdit(employee)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsDrawer;
