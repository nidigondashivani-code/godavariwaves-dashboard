import { parseTimeToMinutes } from '../utils/dateUtils.util';

export interface AttendanceCalculation {
  workingMinutes: number;
  workingHours: number;
  lateMinutes: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
}

export const calculateLateMinutes = (
  clockIn: Date,
  officeStartTime = '09:30',
  gracePeriodMinutes = 15
): number => {
  const clockInMinutes = clockIn.getHours() * 60 + clockIn.getMinutes();
  const startMinutes = parseTimeToMinutes(officeStartTime);
  const threshold = startMinutes + gracePeriodMinutes;
  if (clockInMinutes > threshold) {
    return clockInMinutes - startMinutes;
  }
  return 0;
};

export const calculateWorkingDuration = (
  clockIn: Date,
  clockOut: Date
): { workingMinutes: number; workingHours: number } => {
  const diffMs = Math.max(0, clockOut.getTime() - clockIn.getTime());
  const workingMinutes = Math.round(diffMs / 60000);
  const workingHours = Number((workingMinutes / 60).toFixed(2));
  return { workingMinutes, workingHours };
};

export const determineAttendanceStatus = (
  lateMinutes: number,
  workingHours: number | null,
  halfDayThresholdHours = 4
): 'Present' | 'Late' | 'Half Day' => {
  if (workingHours !== null && workingHours > 0 && workingHours < halfDayThresholdHours) {
    return 'Half Day';
  }
  if (lateMinutes > 0) {
    return 'Late';
  }
  return 'Present';
};

export default {
  calculateLateMinutes,
  calculateWorkingDuration,
  determineAttendanceStatus,
};
