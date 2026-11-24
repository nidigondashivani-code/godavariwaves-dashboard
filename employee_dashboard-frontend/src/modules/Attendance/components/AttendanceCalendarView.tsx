import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceStatus } from '../types/attendance.types';

interface AttendanceCalendarViewProps {
  selectedDate: string;
  visibleMonth: string;
  statusesByDate: Record<string, AttendanceStatus[]>;
  onSelectDate: (date: string) => void;
  onVisibleMonthChange: (month: string) => void;
}

const dayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const STATUS_DOT: Partial<Record<AttendanceStatus, string>> = {
  Present: 'bg-emerald-500',
  Late: 'bg-orange-500',
  Absent: 'bg-rose-500',
  'On Leave': 'bg-purple-500',
  Holiday: 'bg-blue-500',
  Weekend: 'bg-slate-400',
  'Half Day': 'bg-amber-500',
};

export const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({
  selectedDate,
  visibleMonth,
  statusesByDate,
  onSelectDate,
  onVisibleMonthChange,
}) => {
  const month = new Date(`${visibleMonth}-01T12:00:00`);

  const days = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => dayKey(new Date(year, monthIndex, index + 1))),
    ];
  }, [month]);

  const shiftMonth = (amount: number) => {
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + amount, 1, 12);
    onVisibleMonthChange(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Monthly Attendance</h2>
          <p className="text-[11px] text-slate-500">Select a date to view daily attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-28 text-center text-xs font-semibold text-slate-800">
            {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-[10px] font-bold uppercase text-slate-400">{day}</div>
        ))}
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="min-h-10" />;
          const dateStatuses = statusesByDate[date] ?? [];
          const isSelected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex min-h-10 flex-col items-center justify-center rounded-lg border text-xs transition ${
                isSelected ? 'border-blue-600 bg-blue-50 font-bold text-blue-800' : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
              }`}
              aria-label={`Show attendance for ${date}`}
              aria-pressed={isSelected}
            >
              <span>{Number(date.slice(-2))}</span>
              <span className="mt-1 flex h-1.5 gap-0.5">
                {Array.from(new Set(dateStatuses))
                  .filter((status) => STATUS_DOT[status])
                  .slice(0, 3)
                  .map((status) => (
                    <span key={status} className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                  ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-slate-100 pt-3">
        {Object.entries({
          Present: 'bg-emerald-500',
          Late: 'bg-orange-500',
          Absent: 'bg-rose-500',
          Leave: 'bg-purple-500',
          Holiday: 'bg-blue-500',
          Weekend: 'bg-slate-400',
        }).map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1 text-[10px] text-slate-500">
            <span className={`h-2 w-2 rounded-full ${color}`} />{label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default AttendanceCalendarView;