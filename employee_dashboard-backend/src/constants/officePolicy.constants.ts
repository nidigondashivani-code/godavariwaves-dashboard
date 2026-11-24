export const OFFICE_POLICY = {
  START_TIME: '09:30',
  GRACE_PERIOD_MINUTES: 15,
  LATE_THRESHOLD_TIME: '09:45',
  AUTO_ABSENT_TIME: '11:00',
  END_TIME: '18:30',
  FULL_DAY_HOURS: 8,
  HALF_DAY_HOURS: 4,
  WEEKEND_DAYS: [0, 6] as number[], // Sunday = 0, Saturday = 6
};

export default OFFICE_POLICY;
