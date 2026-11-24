import { Cake, ChevronRight } from 'lucide-react';
import type { Birthday } from '../types/dashboard.types';

interface UpcomingBirthdaysProps {
  birthdays: Birthday[];
}

const avatarStyles = ['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700'];

function UpcomingBirthdays({ birthdays }: UpcomingBirthdaysProps) {
  return (
    <section className="scroll-mt-24 h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" id="upcoming-birthdays">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Upcoming Birthdays</p>
          <p className="mt-1 text-xs text-slate-500">Coming up in the next 10 days</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
          <Cake aria-hidden="true" className="h-[19px] w-[19px]" />
        </span>
      </div>

      {birthdays.length > 0 ? (
        <ul className="mt-5 divide-y divide-slate-100">
          {birthdays.map((birthday, index) => (
            <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={birthday.id}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarStyles[index % avatarStyles.length]}`}>
                {birthday.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{birthday.name}</p>
                <p className="mt-1 text-[11px] text-slate-500">Birthday · {birthday.date}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                {birthday.daysUntil === 0 ? 'Today' : `In ${birthday.daysUntil} days`}
              </span>
              <ChevronRight aria-hidden="true" className="hidden h-4 w-4 text-slate-300 sm:block" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 flex min-h-[155px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
          <Cake aria-hidden="true" className="h-6 w-6 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-600">No upcoming birthdays</p>
          <p className="mt-1 text-xs text-slate-400">Check back later for celebrations.</p>
        </div>
      )}
    </section>
  );
}

export default UpcomingBirthdays;
