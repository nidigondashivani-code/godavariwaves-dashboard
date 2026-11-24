import React from 'react';
import { Eye, History, Pencil } from 'lucide-react';
import { ATTENDANCE_STATUS_STYLES } from '../constants/attendance.constants';
import { AttendanceRow } from '../types/attendance.types';

interface AttendanceTableProps {
  rows: AttendanceRow[];
  onViewDetails: (row: AttendanceRow) => void;
  onCorrect: (row: AttendanceRow) => void;
  onViewHistory: (row: AttendanceRow) => void;
}

const StatusBadge: React.FC<{ status: AttendanceRow['status'] }> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
      ATTENDANCE_STATUS_STYLES[status]
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);

const EmployeeAvatar: React.FC<{ row: AttendanceRow; className?: string }> = ({
  row,
  className = 'h-9 w-9',
}) => {
  const initials = `${row.employee.firstName[0] ?? ''}${row.employee.lastName[0] ?? ''}`.toUpperCase();
  return row.employee.photoUrl ? (
    <img
      src={row.employee.photoUrl}
      alt={`${row.employee.firstName} ${row.employee.lastName}`}
      className={`${className} shrink-0 rounded-full object-cover ring-1 ring-slate-200`}
    />
  ) : (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800`}
    >
      {initials}
    </span>
  );
};

const AttendanceActions: React.FC<{
  row: AttendanceRow;
  onViewDetails: (row: AttendanceRow) => void;
  onCorrect: (row: AttendanceRow) => void;
  onViewHistory: (row: AttendanceRow) => void;
}> = ({ row, onViewDetails, onCorrect, onViewHistory }) => {
  const name = `${row.employee.firstName} ${row.employee.lastName}`;
  const protectedDay = row.status === 'On Leave' || row.status === 'Weekend' || row.status === 'Holiday';
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onViewDetails(row)}
        aria-label={`View details for ${name}`}
        title="View Details"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onCorrect(row)}
        disabled={protectedDay}
        aria-label={`Correct attendance for ${name}`}
        title={protectedDay ? 'Attendance is protected for this day' : 'Correct Attendance'}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewHistory(row)}
        aria-label={`View attendance history for ${name}`}
        title="View History"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <History className="h-4 w-4" />
      </button>
    </div>
  );
};

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  rows,
  onViewDetails,
  onCorrect,
  onViewHistory,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Login</th>
            <th className="px-4 py-3">Logout</th>
            <th className="px-4 py-3">Working Hours</th>
            <th className="px-4 py-3">Late Minutes</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={`${row.employee.id}-${row.date}`} className="transition hover:bg-slate-50/70">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <EmployeeAvatar row={row} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {row.employee.firstName} {row.employee.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500">{row.employee.employeeId}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{row.employee.department}</p>
                <p className="text-[11px] text-slate-500">{row.employee.designation}</p>
              </td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.loginTime ?? '—'}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.logoutTime ?? '—'}</td>
              <td className="px-4 py-3 font-medium text-slate-700">
                {row.workingMinutes > 0
                  ? `${Math.floor(row.workingMinutes / 60)}h ${String(row.workingMinutes % 60).padStart(2, '0')}m`
                  : '—'}
              </td>
              <td className="px-4 py-3">
                {row.lateMinutes > 0 ? (
                  <span className="font-semibold text-orange-700">{row.lateMinutes} min</span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <AttendanceActions
                    row={row}
                    onViewDetails={onViewDetails}
                    onCorrect={onCorrect}
                    onViewHistory={onViewHistory}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="p-12 text-center text-sm text-slate-500">
          No employee attendance matches these filters.
        </div>
      )}
    </div>

    <div className="space-y-3 p-3 md:hidden">
      {rows.map((row) => (
        <article key={`${row.employee.id}-${row.date}`} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <EmployeeAvatar row={row} className="h-10 w-10" />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900">
                  {row.employee.firstName} {row.employee.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  {row.employee.employeeId} · {row.employee.department}
                </p>
              </div>
            </div>
            <StatusBadge status={row.status} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-slate-500">Login</span><p className="mt-0.5 font-semibold">{row.loginTime ?? '—'}</p></div>
            <div><span className="text-slate-500">Logout</span><p className="mt-0.5 font-semibold">{row.logoutTime ?? '—'}</p></div>
            <div><span className="text-slate-500">Working</span><p className="mt-0.5 font-semibold">{row.workingMinutes > 0 ? `${Math.floor(row.workingMinutes / 60)}h ${row.workingMinutes % 60}m` : '—'}</p></div>
            <div><span className="text-slate-500">Late</span><p className="mt-0.5 font-semibold">{row.lateMinutes > 0 ? `${row.lateMinutes} min` : '—'}</p></div>
          </div>
          <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
            <AttendanceActions
              row={row}
              onViewDetails={onViewDetails}
              onCorrect={onCorrect}
              onViewHistory={onViewHistory}
            />
          </div>
        </article>
      ))}
      {rows.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">
          No employee attendance matches these filters.
        </div>
      )}
    </div>
  </div>
);

export default AttendanceTable;