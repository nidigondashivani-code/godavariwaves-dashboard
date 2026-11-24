import React, { useEffect, useState, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import {
  PageTransition,
  Card,
  StatusBadge,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '../../../components/common/UI';
import { CalendarUnifiedEvent } from '../../../types/user.types';

type ViewMode = 'month' | 'week' | 'day';

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const EmployeeCalendarPage: React.FC = () => {
  const { showToast } = useToast();
  const [view, setView] = useState<ViewMode>('month');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarUnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarUnifiedEvent | null>(null);

  const getRange = useCallback((): { startDate: string; endDate: string } => {
    const y = anchorDate.getFullYear();
    const m = anchorDate.getMonth();
    if (view === 'month') {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
    if (view === 'week') {
      const start = new Date(anchorDate);
      start.setDate(anchorDate.getDate() - anchorDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
    const iso = toISODate(anchorDate);
    return { startDate: iso, endDate: iso };
  }, [anchorDate, view]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getRange();
      const res = await apiClient.get(
        `/calendar/events?startDate=${startDate}&endDate=${endDate}`
      );
      setEvents(res.data.data || []);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [getRange, showToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const navigatePeriod = (delta: number) => {
    const next = new Date(anchorDate);
    if (view === 'month') next.setMonth(next.getMonth() + delta);
    else if (view === 'week') next.setDate(next.getDate() + delta * 7);
    else next.setDate(next.getDate() + delta);
    setAnchorDate(next);
  };

  const getEventsForDate = (dateStr: string) =>
    events.filter((ev) => ev.startDate <= dateStr && ev.endDate >= dateStr);

  const eventChipColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('holiday')) return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
    if (c.includes('birthday')) return 'bg-[#FFF7ED] text-[#D97706] border-[#FDE68A]';
    if (c.includes('leave')) return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
    return 'bg-[#DBEAFE] text-[#1E3A8A] border-[#BFDBFE]';
  };

  const headerTitle =
    view === 'month'
      ? anchorDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : view === 'week'
      ? `Week of ${getRange().startDate}`
      : anchorDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekStart = new Date(anchorDate);
  weekStart.setDate(anchorDate.getDate() - anchorDate.getDay());
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">Company Calendar</h1>
          <p className="text-[14px] text-[#6B7280]">
            Holidays, meetings, birthdays, approved leaves, and company events.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-[14px] border border-[#E5E7EB]">
          {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold capitalize transition ${
                view === v ? 'bg-[#2563EB] text-white' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {v}ly
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigatePeriod(-1)}
            className="p-2 rounded-[10px] border border-[#E5E7EB] hover:bg-[#F8FAFC]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAnchorDate(new Date())}
            className="px-3.5 py-1.5 rounded-[10px] border border-[#E5E7EB] text-[13px] font-semibold text-[#374151] hover:bg-[#F8FAFC]"
          >
            Today
          </button>
          <button
            onClick={() => navigatePeriod(1)}
            className="p-2 rounded-[10px] border border-[#E5E7EB] hover:bg-[#F8FAFC]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="text-[18px] font-semibold text-[#111827] ml-2">{headerTitle}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Holidays
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Meetings & Events
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Birthdays
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Approved Leaves
          </span>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner label="Loading calendar events..." />
      ) : view === 'month' ? (
        <Card className="p-4 sm:p-6 overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-[12px] font-semibold text-[#6B7280] py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`e-${i}`} className="min-h-[104px] rounded-[12px] bg-[#F8FAFC]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = getEventsForDate(dateStr);
                const isToday = dateStr === toISODate(new Date());

                return (
                  <div
                    key={dateStr}
                    className={`min-h-[104px] p-2 rounded-[12px] border flex flex-col gap-1 ${
                      isToday
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#F1F5F9] bg-white hover:border-[#BFDBFE]'
                    }`}
                  >
                    <span
                      className={`text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-[#2563EB] text-white' : 'text-[#374151]'
                      }`}
                    >
                      {day}
                    </span>
                    <div className="space-y-1 overflow-y-auto max-h-[72px]">
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`w-full text-left px-1.5 py-0.5 rounded-[6px] border text-[11px] font-semibold truncate transition hover:opacity-90 ${eventChipColor(
                            ev.category
                          )}`}
                        >
                          {ev.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : view === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((d) => {
            const iso = toISODate(d);
            const dayEvents = getEventsForDate(iso);
            return (
              <Card key={iso} className="p-4 space-y-3">
                <div className="border-b border-[#F1F5F9] pb-2">
                  <p className="text-[12px] font-semibold text-[#6B7280]">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-[18px] font-bold text-[#111827]">{d.getDate()}</p>
                </div>
                {dayEvents.length === 0 ? (
                  <p className="text-[12px] text-[#9CA3AF]">No events</p>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left p-2 rounded-[10px] border text-[12px] font-semibold ${eventChipColor(
                          ev.category
                        )}`}
                      >
                        <p className="truncate">{ev.title}</p>
                        {ev.startTime && <p className="text-[11px] opacity-80">{ev.startTime}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6">
          {events.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="w-7 h-7" />}
              title="No Events Today"
              description="There are no scheduled events, holidays, or birthdays on this date."
            />
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-4 rounded-[14px] border border-[#E5E7EB] hover:border-[#BFDBFE] cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-[16px] font-semibold text-[#111827]">{ev.title}</p>
                    <p className="text-[13px] text-[#6B7280] mt-0.5">{ev.description}</p>
                  </div>
                  <StatusBadge status={ev.category} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Event Detail Modal */}
      <Modal
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        subtitle={selectedEvent ? `${selectedEvent.startDate}${selectedEvent.endDate !== selectedEvent.startDate ? ` to ${selectedEvent.endDate}` : ''}` : ''}
        maxWidth="max-w-md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <StatusBadge status={selectedEvent.category} />
            {selectedEvent.startTime && (
              <p className="text-[13px] text-[#374151] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                {selectedEvent.startTime} {selectedEvent.endTime ? `– ${selectedEvent.endTime}` : ''}
              </p>
            )}
            {selectedEvent.location && (
              <p className="text-[13px] text-[#374151] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB]" />
                {selectedEvent.location}
              </p>
            )}
            <p className="text-[14px] text-[#374151] leading-relaxed">
              {selectedEvent.description || 'No additional details available.'}
            </p>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
};

export default EmployeeCalendarPage;
