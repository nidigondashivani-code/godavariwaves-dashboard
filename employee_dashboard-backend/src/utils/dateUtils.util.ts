export const getTodayDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseTimeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
};

export const getDateRange = (startDateStr: string, endDateStr: string): string[] => {
  const dates: string[] = [];
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return dates;
  }
  const current = new Date(start);
  while (current <= end) {
    dates.push(getTodayDateString(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const isWeekend = (dateStr: string, weekendDays: number[] = [0, 6]): boolean => {
  const d = new Date(`${dateStr}T00:00:00`);
  return weekendDays.includes(d.getDay());
};

export const formatTimeHHMM = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default {
  getTodayDateString,
  parseTimeToMinutes,
  getDateRange,
  isWeekend,
  formatTimeHHMM,
};
