export const OFFICE_POLICY = {
  officeStart: '09:30',
  lateAfter: '09:45',
  autoAbsentAfter: '11:00',
  officeEnd: '18:30',
  halfDayMinimumMinutes: 240,
  liveRefreshMilliseconds: 5000,
} as const;

export const ATTENDANCE_DEPARTMENTS = [
  'Software Development',
  'Digital Marketing',
  'Sales',
  'Administration',
] as const;

export const ATTENDANCE_STATUSES = [
  'Present',
  'Late',
  'Half Day',
  'On Leave',
  'Absent',
  'Work From Home',
  'Holiday',
  'Weekend',
  'Not Logged In',
] as const;

export const ATTENDANCE_STATUS_STYLES: Record<string, string> = {
  Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Late: 'bg-orange-50 text-orange-700 border-orange-200',
  'Half Day': 'bg-amber-50 text-amber-700 border-amber-200',
  'On Leave': 'bg-purple-50 text-purple-700 border-purple-200',
  Absent: 'bg-rose-50 text-rose-700 border-rose-200',
  'Work From Home': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Holiday: 'bg-blue-50 text-blue-700 border-blue-200',
  Weekend: 'bg-slate-100 text-slate-600 border-slate-200',
  'Not Logged In': 'bg-slate-50 text-slate-600 border-slate-200',
};