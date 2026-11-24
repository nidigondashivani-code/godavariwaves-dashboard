export const LEAVE_DEPARTMENTS = [
  'All Departments',
  'Software Development',
  'Digital Marketing',
  'Sales',
  'Administration',
] as const;

export const LEAVE_TYPES = [
  'All Leave Types',
  'Casual Leave',
  'Sick Leave',
  'Emergency Leave',
] as const;

export const LEAVE_STATUSES = [
  'All Statuses',
  'Pending',
  'Approved',
  'Rejected',
] as const;

export const getTodayString = (): string => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};
