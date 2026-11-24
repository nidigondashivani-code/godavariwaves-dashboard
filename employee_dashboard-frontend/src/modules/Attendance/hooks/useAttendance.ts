import { useCallback, useEffect, useState } from 'react';
import { OFFICE_POLICY } from '../constants/attendance.constants';
import { attendanceService } from '../services/attendance.service';
import { AttendanceCorrectionRequest, AttendanceRow } from '../types/attendance.types';

export const useAttendance = (date: string) => {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);

  const refresh = useCallback(() => {
    setRows(attendanceService.getAttendanceForDate(date));
    setCorrectionRequests(attendanceService.getCorrectionRequests());
  }, [date]);

  useEffect(() => {
    refresh();
    const unsubscribe = attendanceService.subscribe(refresh);
    const timer = window.setInterval(refresh, OFFICE_POLICY.liveRefreshMilliseconds);

    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [refresh]);

  return {
    rows,
    correctionRequests,
    refresh,
  };
};