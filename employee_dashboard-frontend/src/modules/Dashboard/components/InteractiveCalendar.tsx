import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Cake,
  Briefcase,
  Megaphone,
  Clock3,
  MapPin,
  CalendarX,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CalendarEventType = 'holiday' | 'birthday' | 'event' | 'announcement';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  time?: string;
  location?: string;
  description?: string;
}

interface CalendarDayCell {
  day: number;
  month: number;
  year: number;
  dateKey: string;
  isCurrentMonth: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES_DESKTOP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_NAMES_MOBILE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const eventTypeConfig: Record<
  CalendarEventType,
  {
    label: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    icon: LucideIcon;
    accentBar: string;
  }
> = {
  holiday: {
    label: 'Company Holiday',
    dotColor: 'bg-[#2563EB]',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    icon: PartyPopper,
    accentBar: 'bg-blue-500',
  },
  birthday: {
    label: 'Employee Birthday',
    dotColor: 'bg-[#16A34A]',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    icon: Cake,
    accentBar: 'bg-emerald-500',
  },
  event: {
    label: 'Company Event',
    dotColor: 'bg-[#9333EA]',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    icon: Briefcase,
    accentBar: 'bg-purple-500',
  },
  announcement: {
    label: 'Announcement',
    dotColor: 'bg-[#EA580C]',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
    icon: Megaphone,
    accentBar: 'bg-orange-500',
  },
};

const formatDateKey = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getRelativeDateKey = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
};

const initialEvents: CalendarEvent[] = [
  // Events relative to current date (dynamic across any day)
  {
    id: 'evt-rel-0-a',
    title: "David Miller's Birthday",
    date: getRelativeDateKey(0),
    type: 'birthday',
    time: 'All day',
    description: 'Senior Software Engineer · Engineering Team celebration.',
  },
  {
    id: 'evt-rel-0-b',
    title: 'Daily Standup & Sprint Sync',
    date: getRelativeDateKey(0),
    type: 'event',
    time: '11:00 AM - 11:30 AM',
    location: 'Meeting Room 3B / Google Meet',
    description: 'Engineering and Product alignment on weekly sprint targets.',
  },
  {
    id: 'evt-rel-1',
    title: 'Q4 Engineering All-Hands',
    date: getRelativeDateKey(1),
    type: 'event',
    time: '10:30 AM - 12:00 PM',
    location: 'Main Auditorium & Zoom',
    description: 'Quarterly review of platform architecture and product roadmap.',
  },
  {
    id: 'evt-rel-2',
    title: "Maya Chen's Birthday",
    date: getRelativeDateKey(2),
    type: 'birthday',
    time: 'All day',
    description: 'Lead Product Designer · UX Team celebration.',
  },
  {
    id: 'evt-rel-3',
    title: 'Thanksgiving / Fall Break',
    date: getRelativeDateKey(3),
    type: 'holiday',
    time: 'All day',
    location: 'Company-wide',
    description: 'Office closed. Paid company holiday for all departments.',
  },
  {
    id: 'evt-rel-5',
    title: "Jordan Lee's Birthday",
    date: getRelativeDateKey(5),
    type: 'birthday',
    time: 'All day',
    description: 'Staff QA Engineer · Testing Team celebration.',
  },
  {
    id: 'evt-rel-7',
    title: 'Design System Showcase & Review',
    date: getRelativeDateKey(7),
    type: 'event',
    time: '02:00 PM - 03:30 PM',
    location: 'Innovation Hub',
    description: 'Presenting the new HRMS UI components and interactive widgets.',
  },
  {
    id: 'evt-rel-9',
    title: "Samira Patel's Birthday",
    date: getRelativeDateKey(9),
    type: 'birthday',
    time: 'All day',
    description: 'HR Business Partner · People Operations celebration.',
  },
  {
    id: 'evt-rel-12',
    title: 'Annual Performance Appraisal Launch',
    date: getRelativeDateKey(12),
    type: 'announcement',
    time: '09:00 AM',
    description: 'Self-assessment window opens for all full-time employees.',
  },
  {
    id: 'evt-rel-15',
    title: 'Cybersecurity Awareness Training',
    date: getRelativeDateKey(15),
    type: 'event',
    time: '03:00 PM - 04:30 PM',
    location: 'Virtual Workshop',
    description: 'Mandatory annual refresher on information security and data privacy.',
  },
  {
    id: 'evt-rel-20',
    title: 'Annual Gala & Team Recognition',
    date: getRelativeDateKey(20),
    type: 'event',
    time: '06:30 PM - 10:00 PM',
    location: 'Grand Ballroom, Hotel Royal',
    description: 'Annual corporate celebration, dinner, and excellence awards.',
  },
  {
    id: 'evt-rel-31',
    title: 'Christmas Day',
    date: getRelativeDateKey(31),
    type: 'holiday',
    time: 'All day',
    location: 'Company-wide',
    description: 'Official company holiday. All offices closed.',
  },
  {
    id: 'evt-rel-38',
    title: "New Year's Day",
    date: getRelativeDateKey(38),
    type: 'holiday',
    time: 'All day',
    location: 'Company-wide',
    description: 'Welcoming the new year! All branch offices closed.',
  },
  {
    id: 'evt-rel-neg1',
    title: 'Town Hall Summary & Leadership Q&A',
    date: getRelativeDateKey(-1),
    type: 'announcement',
    time: 'Yesterday',
    description: 'Highlights and key takeaways from the Q4 leadership address.',
  },
  {
    id: 'evt-rel-neg3',
    title: 'Health Benefits Enrollment Opens',
    date: getRelativeDateKey(-3),
    type: 'announcement',
    time: '10:00 AM',
    description: 'Open enrollment period for medical, dental, and wellness plans.',
  },
];

export function InteractiveCalendar() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(
    () => formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    [today],
  );

  // Current view month & year
  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  // Currently selected date
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  // Filter for upcoming events list
  const [activeFilter, setActiveFilter] = useState<'all' | CalendarEventType>('all');

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
  };

  // Build calendar matrix (days cells)
  const calendarCells = useMemo<CalendarDayCell[]>(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();

    const cells: CalendarDayCell[] = [];

    // Trailing days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDaysCount - i;
      const prevDate = new Date(viewYear, viewMonth - 1, day);
      cells.push({
        day,
        month: prevDate.getMonth(),
        year: prevDate.getFullYear(),
        dateKey: formatDateKey(prevDate.getFullYear(), prevDate.getMonth(), day),
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        day,
        month: viewMonth,
        year: viewYear,
        dateKey: formatDateKey(viewYear, viewMonth, day),
        isCurrentMonth: true,
      });
    }

    // Leading days from next month to fill complete grid rows (35 or 42 cells)
    const targetLength = cells.length <= 35 ? 35 : 42;
    const remaining = targetLength - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(viewYear, viewMonth + 1, day);
      cells.push({
        day,
        month: nextDate.getMonth(),
        year: nextDate.getFullYear(),
        dateKey: formatDateKey(nextDate.getFullYear(), nextDate.getMonth(), day),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Group events by dateKey for fast lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const evt of initialEvents) {
      const existing = map.get(evt.date) ?? [];
      existing.push(evt);
      map.set(evt.date, existing);
    }
    return map;
  }, []);

  // Events on the selected date
  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDateKey) ?? [];
  }, [eventsByDate, selectedDateKey]);

  // Formatted string for selected date
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj);
  }, [selectedDateKey]);

  const isSelectedDateToday = selectedDateKey === todayKey;

  // Upcoming events sorted chronologically from today onwards
  const upcomingEvents = useMemo(() => {
    return initialEvents
      .filter((evt) => {
        if (activeFilter !== 'all' && evt.type !== activeFilter) return false;
        return evt.date >= todayKey;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [activeFilter, todayKey]);

  // Calculate relative days text for upcoming event item
  const getRelativeDaysLabel = (dateStr: string): string => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const [ty, tm, td] = todayKey.split('-').map(Number);
    const todayDate = new Date(ty, tm - 1, td);

    const diffTime = targetDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return dateStr;
  };

  return (
    <section
      aria-labelledby="calendar-section-heading"
      className="scroll-mt-24 space-y-4"
      id="company-calendar"
    >
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CalendarIcon aria-hidden="true" className="h-[20px] w-[20px]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-base font-bold tracking-tight text-slate-900 sm:text-lg"
                id="calendar-section-heading"
              >
                Company Calendar & Schedule
              </h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                Interactive
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Company holidays, birthdays, corporate events, and announcements
            </p>
          </div>
        </div>

        {/* Global Today Shortcut & View Status */}
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-[0.98]"
            onClick={handleGoToToday}
            type="button"
          >
            <CalendarCheck aria-hidden="true" className="h-4 w-4 text-blue-600" />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* LEFT COLUMN: Calendar Grid Card (7 cols on desktop) */}
        <div className="min-w-0 rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] sm:p-6 lg:col-span-7 xl:col-span-8">
          {/* Calendar Month Navigation Bar */}
          <div className="flex items-center justify-between gap-2 pb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900 sm:text-xl">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h4>
              <p className="text-xs text-slate-500">
                {eventsByDate.size} total events scheduled this year
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                aria-label="Previous month"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                onClick={handlePrevMonth}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>

              <button
                className="hidden rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:inline-flex"
                onClick={handleGoToToday}
                type="button"
              >
                Return to Today
              </button>

              <button
                aria-label="Next month"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                onClick={handleNextMonth}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header Row */}
          <div className="grid grid-cols-7 gap-1 border-b border-slate-100 pb-2.5 text-center">
            {WEEKDAY_NAMES_DESKTOP.map((name, i) => (
              <div
                className="text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs"
                key={name}
              >
                <span className="hidden sm:inline">{name}</span>
                <span className="sm:hidden">{WEEKDAY_NAMES_MOBILE[i]}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="mt-2.5 grid grid-cols-7 gap-1 sm:gap-1.5" role="grid">
            {calendarCells.map((cell) => {
              const isSelected = cell.dateKey === selectedDateKey;
              const isCellToday = cell.dateKey === todayKey;
              const cellEvents = eventsByDate.get(cell.dateKey) ?? [];
              const hasEvents = cellEvents.length > 0;

              return (
                <button
                  aria-label={`${cell.day} ${MONTH_NAMES[cell.month]} ${cell.year}${
                    hasEvents ? `, ${cellEvents.length} events` : ''
                  }`}
                  aria-selected={isSelected}
                  className={`group relative flex min-h-[46px] flex-col items-center justify-between rounded-xl p-1.5 text-center transition duration-150 sm:min-h-[54px] sm:p-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600 ring-offset-2 ring-offset-white'
                      : isCellToday
                      ? 'border border-blue-300 bg-blue-50/70 font-bold text-blue-700 ring-2 ring-blue-400/40 hover:bg-blue-100/70'
                      : cell.isCurrentMonth
                      ? 'border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                      : 'border border-transparent text-slate-300 hover:bg-slate-50/50'
                  }`}
                  key={cell.dateKey}
                  onClick={() => {
                    setSelectedDateKey(cell.dateKey);
                    // If clicked outside current view month, auto-navigate to that month
                    if (!cell.isCurrentMonth) {
                      setViewDate(new Date(cell.year, cell.month, 1));
                    }
                  }}
                  type="button"
                >
                  {/* Day Number */}
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:text-sm ${
                      isSelected
                        ? 'text-white'
                        : isCellToday
                        ? 'font-bold text-blue-700'
                        : 'text-inherit'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {/* Event Dots Container */}
                  <div className="flex h-2 items-center justify-center gap-1">
                    {cellEvents.slice(0, 3).map((evt) => {
                      const cfg = eventTypeConfig[evt.type];
                      return (
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-transform ${
                            isSelected ? 'bg-white' : cfg.dotColor
                          }`}
                          key={evt.id}
                          title={`${cfg.label}: ${evt.title}`}
                        />
                      );
                    })}
                    {cellEvents.length > 3 && (
                      <span
                        className={`text-[9px] font-bold ${
                          isSelected ? 'text-white/90' : 'text-slate-400'
                        }`}
                      >
                        +
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Legend (Requirement 9) */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Event Legend
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                {(Object.entries(eventTypeConfig) as [CalendarEventType, (typeof eventTypeConfig)[CalendarEventType]][]).map(
                  ([typeKey, cfg]) => (
                    <div className="flex items-center gap-1.5" key={typeKey}>
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dotColor}`} />
                      <span className="text-xs font-medium text-slate-600">{cfg.label}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Date Details & Upcoming Events (5 cols on desktop) */}
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-5 xl:col-span-4">
          {/* Selected Date Details Card (Requirement 7) */}
          <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Selected Date Details
                </p>
                <h4 className="mt-0.5 text-sm font-bold text-slate-900 sm:text-base">
                  {formattedSelectedDate}
                </h4>
              </div>

              {isSelectedDateToday ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  <Sparkles aria-hidden="true" className="h-3 w-3" />
                  Today
                </span>
              ) : (
                <button
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                  onClick={handleGoToToday}
                  type="button"
                >
                  Go to Today
                </button>
              )}
            </div>

            {/* Selected Date Content */}
            <div className="mt-3.5 space-y-2.5">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => {
                  const cfg = eventTypeConfig[event.type];
                  const Icon = cfg.icon;

                  return (
                    <div
                      className={`relative overflow-hidden rounded-xl border ${cfg.badgeBorder} ${cfg.badgeBg} p-3.5 transition`}
                      key={event.id}
                    >
                      <div
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 w-1 ${cfg.accentBar}`}
                      />
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                          <Icon aria-hidden="true" className={`h-4 w-4 ${cfg.badgeText}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${cfg.badgeText}`}
                            >
                              {cfg.label}
                            </span>
                            {event.time && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                <Clock3 aria-hidden="true" className="h-3 w-3 text-slate-400" />
                                {event.time}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{event.title}</p>
                          {event.location && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                              <MapPin aria-hidden="true" className="h-3 w-3 text-slate-400" />
                              {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    <CalendarX aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700">No events on this day</p>
                  <p className="mt-1 max-w-[240px] text-xs text-slate-500">
                    No holidays, birthdays, or corporate events are scheduled for this date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events Card (Requirement 10) */}
          <div className="flex-1 rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Upcoming Events</h4>
                <p className="text-xs text-slate-500">Next 30 days schedule</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {upcomingEvents.length} items
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <button
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setActiveFilter('all')}
                type="button"
              >
                All
              </button>
              {(Object.entries(eventTypeConfig) as [CalendarEventType, (typeof eventTypeConfig)[CalendarEventType]][]).map(
                ([typeKey, cfg]) => {
                  const isActive = activeFilter === typeKey;
                  return (
                    <button
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                        isActive
                          ? `${cfg.badgeBg} ${cfg.badgeText} ring-1 ${cfg.badgeBorder}`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      key={typeKey}
                      onClick={() => setActiveFilter(typeKey)}
                      type="button"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                      <span>{cfg.label.replace('Company ', '').replace('Employee ', '')}</span>
                    </button>
                  );
                },
              )}
            </div>

            {/* Upcoming List */}
            <div className="mt-3.5 space-y-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((evt) => {
                  const cfg = eventTypeConfig[evt.type];
                  const Icon = cfg.icon;
                  const relativeBadge = getRelativeDaysLabel(evt.date);
                  const isSelected = evt.date === selectedDateKey;

                  return (
                    <button
                      aria-label={`Select ${evt.title} on ${evt.date}`}
                      className={`group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition duration-150 ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50/70 ring-1 ring-blue-500'
                          : 'border-slate-100 bg-[#fbfcfe] hover:border-slate-200 hover:bg-slate-50'
                      }`}
                      key={evt.id}
                      onClick={() => {
                        setSelectedDateKey(evt.date);
                        const [y, m] = evt.date.split('-').map(Number);
                        setViewDate(new Date(y, m - 1, 1));
                      }}
                      type="button"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.badgeBg} ${cfg.badgeText}`}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-bold text-slate-800 group-hover:text-blue-600">
                            {evt.title}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              relativeBadge === 'Today'
                                ? 'bg-blue-100 text-blue-700'
                                : relativeBadge === 'Tomorrow'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {relativeBadge}
                          </span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span>{evt.date}</span>
                          {evt.time && (
                            <>
                              <span>·</span>
                              <span>{evt.time}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                      />
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
                  <Filter aria-hidden="true" className="mx-auto h-5 w-5 text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-600">No events found</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Try selecting &quot;All&quot; to see upcoming items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveCalendar;
