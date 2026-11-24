import React from 'react';
import { Building2 } from 'lucide-react';
import { ATTENDANCE_DEPARTMENTS } from '../constants/attendance.constants';
import { AttendanceRow } from '../types/attendance.types';

interface AttendanceMetricWidgetProps {
  rows: AttendanceRow[];
  activeDepartment: string;
  onSelectDepartment: (department: string) => void;
}

export const AttendanceMetricWidget: React.FC<AttendanceMetricWidgetProps> = ({
  rows,
  activeDepartment,
  onSelectDepartment,
}) => {
  const departments = ATTENDANCE_DEPARTMENTS.map((department) => {
    const departmentRows = rows.filter((row) => row.employee.department === department);
    return {
      department,
      total: departmentRows.length,
      present: departmentRows.filter((row) => row.status === 'Present').length,
      late: departmentRows.filter((row) => row.status === 'Late').length,
      absent: departmentRows.filter((row) => row.status === 'Absent').length,
      leave: departmentRows.filter((row) => row.status === 'On Leave').length,
      halfDay: departmentRows.filter((row) => row.status === 'Half Day').length,
    };
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Building2 className="h-4 w-4 text-blue-600" /> Department Attendance
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">Select a department to filter the employee list.</p>
        </div>
        {activeDepartment && (
          <button
            type="button"
            onClick={() => onSelectDepartment('')}
            className="text-[11px] font-semibold text-blue-700 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {departments.map((item) => (
          <button
            key={item.department}
            type="button"
            onClick={() => onSelectDepartment(activeDepartment === item.department ? '' : item.department)}
            className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
              activeDepartment === item.department
                ? 'border-blue-500 bg-blue-50/60'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            aria-pressed={activeDepartment === item.department}
          >
            <div className="flex items-center justify-between">
              <span className="truncate text-xs font-bold text-slate-800">{item.department}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {item.total}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1 text-center">
              {[
                ['Present', item.present, 'text-emerald-700'],
                ['Late', item.late, 'text-orange-700'],
                ['Absent', item.absent, 'text-rose-700'],
                ['Leave', item.leave, 'text-purple-700'],
                ['Half', item.halfDay, 'text-amber-700'],
              ].map(([label, count, color]) => (
                <span key={String(label)} className="min-w-0">
                  <span className={`block text-xs font-bold ${color}`}>{count}</span>
                  <span className="block truncate text-[9px] text-slate-400">{label}</span>
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default AttendanceMetricWidget;
