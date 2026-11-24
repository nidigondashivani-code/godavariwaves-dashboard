import { Eye, MessageSquareText, UserRound } from 'lucide-react';
import type { WorkUpdateRow, WorkUpdateStatus } from '../types/workUpdate.types';

interface WorkUpdateTableProps {
  rows: WorkUpdateRow[];
  onView: (row: WorkUpdateRow) => void;
  onAddRemark: (row: WorkUpdateRow) => void;
}

const statusClass: Record<WorkUpdateStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'On Leave': 'bg-violet-50 text-violet-700 ring-violet-200',
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

function EmployeeAvatar({ row }: { row: WorkUpdateRow }) {
  const { employee } = row;
  if (employee.photoUrl) {
    return (
      <img
        alt={`${employee.firstName} ${employee.lastName}`}
        className="h-9 w-9 rounded-full object-cover"
        src={employee.photoUrl}
      />
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
      {employee.firstName[0]}{employee.lastName[0]}
    </span>
  );
}

function ProgressBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-slate-400">—</span>;
  const tone = value === 100 ? 'bg-emerald-500' : 'bg-blue-600';
  return (
    <div className="min-w-[105px]">
      <div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-500">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <div
        aria-label={`${value}% complete`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
      >
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: WorkUpdateStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusClass[status]}`}>
      {status}
    </span>
  );
}

function WorkUpdateTable({ rows, onView, onAddRemark }: WorkUpdateTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <UserRound aria-hidden="true" className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-sm font-bold text-slate-900">No work updates match these filters</h3>
        <p className="mt-1 text-xs text-slate-500">Try another date or clear the current filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="max-h-[620px] overflow-auto">
          <table className="w-full min-w-[1250px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Work Summary</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Logout</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr className="align-top text-xs text-slate-700 hover:bg-slate-50/70" key={`${row.employee.id}-${row.date}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <EmployeeAvatar row={row} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{row.employee.firstName} {row.employee.lastName}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{row.employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold">{row.employee.department}</td>
                  <td className="px-4 py-4">{row.employee.designation}</td>
                  <td className="whitespace-nowrap px-4 py-4">{row.date}</td>
                  <td className="max-w-[240px] px-4 py-4">
                    <p className="line-clamp-2 leading-5">
                      {row.update?.workSummary ?? (row.status === 'On Leave' ? 'Approved leave' : 'No update submitted')}
                    </p>
                  </td>
                  <td className="px-4 py-4"><ProgressBar value={row.update?.progressPercentage ?? null} /></td>
                  <td className="whitespace-nowrap px-4 py-4">{formatDateTime(row.update?.submittedAt)}</td>
                  <td className="whitespace-nowrap px-4 py-4">{row.logoutTime ?? '—'}</td>
                  <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        aria-label={`View ${row.employee.firstName} ${row.employee.lastName} update`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => onView(row)}
                        type="button"
                      >
                        <Eye aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Add admin remark for ${row.employee.firstName} ${row.employee.lastName}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!row.update}
                        onClick={() => onAddRemark(row)}
                        type="button"
                      >
                        <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={`${row.employee.id}-${row.date}`}>
            <div className="flex items-start gap-3">
              <EmployeeAvatar row={row} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{row.employee.firstName} {row.employee.lastName}</h3>
                    <p className="mt-0.5 text-[10px] text-slate-500">{row.employee.employeeId} · {row.employee.department}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{row.employee.designation} · {row.date}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">
                  {row.update?.workSummary ?? (row.status === 'On Leave' ? 'Approved leave' : 'No update submitted')}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <ProgressBar value={row.update?.progressPercentage ?? null} />
                  <div className="text-[10px] text-slate-500">
                    <p>Submitted: {formatDateTime(row.update?.submittedAt)}</p>
                    <p className="mt-1">Logout: {row.logoutTime ?? '—'}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-700"
                    onClick={() => onView(row)}
                    type="button"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-700 disabled:opacity-40"
                    disabled={!row.update}
                    onClick={() => onAddRemark(row)}
                    type="button"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" /> Add Remark
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default WorkUpdateTable;
