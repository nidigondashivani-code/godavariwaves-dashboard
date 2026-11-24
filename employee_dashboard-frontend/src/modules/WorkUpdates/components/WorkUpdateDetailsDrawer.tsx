import { useState } from 'react';
import { Download, MessageSquareText, Paperclip, X } from 'lucide-react';
import type { WorkUpdateRow } from '../types/workUpdate.types';

interface WorkUpdateDetailsDrawerProps {
  row: WorkUpdateRow;
  focusRemark?: boolean;
  onClose: () => void;
  onSaveRemark: (updateId: string, remark: string) => boolean;
}

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

function WorkUpdateDetailsDrawer({
  row,
  focusRemark = false,
  onClose,
  onSaveRemark,
}: WorkUpdateDetailsDrawerProps) {
  const [remark, setRemark] = useState('');
  const { employee, update } = row;

  const saveRemark = () => {
    if (!update || !onSaveRemark(update.id, remark)) return;
    setRemark('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40 backdrop-blur-[2px]">
      <button
        aria-label="Close work update details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="work-update-drawer-title"
        aria-modal="true"
        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        role="dialog"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">
              Daily Work Update
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900" id="work-update-drawer-title">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{employee.employeeId} · {row.date}</p>
          </div>
          <button
            aria-label="Close details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <section className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            {employee.photoUrl ? (
              <img
                alt=""
                className="h-14 w-14 rounded-full object-cover"
                src={employee.photoUrl}
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
                {employee.firstName[0]}{employee.lastName[0]}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900">{employee.department}</p>
              <p className="text-xs text-slate-600">{employee.designation}</p>
              <p className="mt-1 truncate text-[11px] text-slate-500">{employee.companyEmail}</p>
            </div>
          </section>

          {update ? (
            <>
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily work report</h3>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{update.workSummary}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[10px] font-medium text-blue-700">Progress</p>
                    <p className="mt-1 text-lg font-bold text-blue-900">{update.progressPercentage}%</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${update.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-medium text-slate-500">Submitted</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">{formatDateTime(update.submittedAt)}</p>
                    <p className="mt-2 text-[10px] text-slate-500">Logout: {row.logoutTime ?? 'Not logged out'}</p>
                  </div>
                </div>
                {update.remainingWork && (
                  <div>
                    <h4 className="mb-1 text-[10px] font-bold uppercase text-slate-500">Remaining work</h4>
                    <p className="rounded-xl border border-slate-200 p-3 text-xs leading-5 text-slate-700">{update.remainingWork}</p>
                  </div>
                )}
                {update.challenges && (
                  <div>
                    <h4 className="mb-1 text-[10px] font-bold uppercase text-slate-500">Challenges / blockers</h4>
                    <p className="rounded-xl border border-slate-200 p-3 text-xs leading-5 text-slate-700">{update.challenges}</p>
                  </div>
                )}
                {update.comments && (
                  <div>
                    <h4 className="mb-1 text-[10px] font-bold uppercase text-slate-500">Employee comments</h4>
                    <p className="rounded-xl border border-slate-200 p-3 text-xs leading-5 text-slate-700">{update.comments}</p>
                  </div>
                )}
                {update.attachment && (
                  <a
                    className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-800"
                    download={update.attachment.name}
                    href={update.attachment.dataUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Paperclip aria-hidden="true" className="h-4 w-4" />
                    <span className="min-w-0 flex-1 truncate">{update.attachment.name}</span>
                    <Download aria-hidden="true" className="h-4 w-4" />
                  </a>
                )}
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <MessageSquareText aria-hidden="true" className="h-4 w-4 text-blue-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin remarks</h3>
                </div>
                {update.adminRemarks?.length ? (
                  <div className="space-y-2">
                    {update.adminRemarks.map((entry) => (
                      <div className="rounded-xl bg-amber-50 p-3" key={entry.id}>
                        <p className="whitespace-pre-wrap text-xs leading-5 text-slate-800">{entry.text}</p>
                        <p className="mt-2 text-[10px] text-slate-500">
                          {entry.addedBy} · {formatDateTime(entry.addedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No admin remarks have been added.</p>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">Add a remark</span>
                  <textarea
                    autoFocus={focusRemark}
                    className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    onChange={(event) => setRemark(event.target.value)}
                    placeholder="Add feedback for future reference..."
                    value={remark}
                  />
                </label>
                <button
                  className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!remark.trim()}
                  onClick={saveRemark}
                  type="button"
                >
                  Save Admin Remark
                </button>
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm font-bold text-slate-800">No update submitted</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {row.status === 'On Leave'
                  ? 'This employee has approved leave for the selected date.'
                  : 'This employee has not submitted a daily work update for the selected date.'}
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default WorkUpdateDetailsDrawer;
