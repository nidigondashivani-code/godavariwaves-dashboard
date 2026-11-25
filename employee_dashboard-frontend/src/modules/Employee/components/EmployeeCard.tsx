import React from 'react';
import { Eye, Edit2, Mail, Phone, Calendar, ShieldAlert, AlertCircle } from 'lucide-react';
import { Employee } from '../types/employee.types';
import StatusBadge from './StatusBadge';
import DepartmentBadge from './DepartmentBadge';
import DashboardAccessToggle from './DashboardAccessToggle';
import { getAssetUrl } from '../../../config/env.config';

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onViewProfile: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onToggleDashboardAccess: (newVal: boolean) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  isSelected,
  onSelect,
  onViewProfile,
  onEdit,
  onToggleDashboardAccess,
}) => {
  const initials = `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase();

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-200 relative flex flex-col justify-between ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/10'
          : 'border-slate-200 hover:shadow-md'
      } ${employee.status === 'Inactive' ? 'bg-rose-50/20' : ''}`}
    >
      <div>
        {/* Top row with checkbox, ID, and Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-slate-500">{employee.employeeId}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={employee.status} />
            {employee.status === 'Inactive' && employee.inactivityReason && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                {employee.inactivityReason}
              </span>
            )}
          </div>
        </div>

        {/* Avatar & Name */}
        <div className="flex items-start gap-3.5 mb-4">
          {employee.photoUrl ? (
            <img
              src={getAssetUrl(employee.photoUrl) || employee.photoUrl}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h4
              onClick={onViewProfile}
              className="font-bold text-slate-900 text-sm truncate hover:text-blue-600 cursor-pointer transition"
            >
              {employee.firstName} {employee.lastName}
            </h4>
            <p className="text-xs text-slate-500 truncate">{employee.designation}</p>
            <div className="mt-1">
              <DepartmentBadge department={employee.department} />
            </div>
          </div>
        </div>

        {/* Contact info snippets */}
        <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3 my-3">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{employee.companyEmail}</span>
          </div>
          {employee.mobileNumber && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{employee.mobileNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Joined: {employee.joiningDate}</span>
          </div>
          {employee.reportingManagerName && (
            <div className="text-[11px] text-slate-400">
              Reporting: {employee.reportingManagerName}
            </div>
          )}
        </div>
      </div>

      {/* Access toggle & Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <DashboardAccessToggle
            size="sm"
            enabled={employee.dashboardAccess}
            disabled={employee.status === 'Inactive'}
            onChange={onToggleDashboardAccess}
          />
          <span className="text-[11px] text-slate-400">
            {employee.dashboardAccess ? 'Access On' : 'Revoked'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onViewProfile}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit Employee"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
