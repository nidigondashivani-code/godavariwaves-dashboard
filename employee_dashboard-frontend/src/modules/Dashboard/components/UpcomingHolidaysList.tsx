import { CalendarDays, PartyPopper, Sparkles } from 'lucide-react';
import type { Holiday } from '../types/dashboard.types';

interface UpcomingHolidaysListProps {
  holiday: Holiday | null;
}

function UpcomingHolidaysList({ holiday }: UpcomingHolidaysListProps) {
  return (
    <section className="scroll-mt-24 h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" id="todays-holidays">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Today&apos;s Holidays</p>
          <p className="mt-1 text-xs text-slate-500">Company calendar</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <CalendarDays aria-hidden="true" className="h-[19px] w-[19px]" />
        </span>
      </div>

      {holiday ? (
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <PartyPopper aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{holiday.name}</p>
              <p className="mt-1 text-xs text-slate-600">{holiday.date}</p>
              {holiday.description && <p className="mt-2 text-xs leading-5 text-slate-500">{holiday.description}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex min-h-[155px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <Sparkles aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-700">No holidays today</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">There are no company holidays scheduled for today.</p>
        </div>
      )}
    </section>
  );
}

export default UpcomingHolidaysList;