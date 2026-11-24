import { useCallback, useEffect, useState } from 'react';
import { OFFICE_POLICY } from '../constants/attendance.constants';
import { attendanceService } from '../services/attendance.service';
import employeeService from '../../Employee/services/employee.service';
import leaveService from '../../LeaveManagement/services/leave.service';
import { AttendanceCorrectionRequest, AttendanceRow } from '../types/attendance.types';

export const useAttendance = (date: string) => {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);

  const refresh = useCallback(() => {
    setRows(attendanceService.getAttendanceForDate(date));
    setCorrectionRequests(attendanceService.getCorrectionRequests());
  }, [date]);

  useEffect(() => {
    // Initial sync from backend MySQL database
    void employeeService.syncFromBackend().catch(() => {});
    void leaveService.syncFromBackend().catch(() => {});
    void attendanceService.syncFromBackend(date).catch(() => {});

    refresh();
    const unsubscribe = attendanceService.subscribe(refresh);
    const timer = window.setInterval(() => {
      void attendanceService.syncFromBackend(date).catch(() => {});
      refresh();
    }, OFFICE_POLICY.liveRefreshMilliseconds);

    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [date, refresh]);

  return {
    rows,
    correctionRequests,
    refresh,
  };
};