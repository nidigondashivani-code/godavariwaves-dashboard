import employeeService from '../../Employee/services/employee.service';
import leaveService from '../../LeaveManagement/services/leave.service';
import notificationService from '../../Notifications/services/notification.service';
import { Employee } from '../../Employee/types/employee.types';
import {
  AttendanceCorrectionRequest,
  AttendanceRecord,
  AttendanceRow,
  AttendanceStatus,
} from '../types/attendance.types';
import { OFFICE_POLICY } from '../constants/attendance.constants';
import { apiClient } from '../../../api/apiClient';

const RECORDS_STORAGE_KEY = 'ems_admin_attendance_records_v1';
const CORRECTIONS_STORAGE_KEY = 'ems_attendance_correction_requests_v1';
const ALERTS_STORAGE_KEY = 'ems_attendance_alerts_v1';

const localDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const calculateAttendance = (
  loginTime: string | null,
  logoutTime: string | null
): Pick<AttendanceRecord, 'status' | 'lateMinutes' | 'workingMinutes'> => {
  if (!loginTime) {
    return { status: 'Absent', lateMinutes: 0, workingMinutes: 0 };
  }

  const loginMinutes = timeToMinutes(loginTime);
  const lateMinutes = Math.max(0, loginMinutes - timeToMinutes(OFFICE_POLICY.lateAfter));
  const workingMinutes = logoutTime
    ? Math.max(0, timeToMinutes(logoutTime) - loginMinutes)
    : 0;

  return {
    status:
      logoutTime && workingMinutes < OFFICE_POLICY.halfDayMinimumMinutes
        ? 'Half Day'
        : lateMinutes > 0
        ? 'Late'
        : 'Present',
    lateMinutes,
    workingMinutes,
  };
};

class AttendanceService {
  private listeners = new Set<() => void>();

  private readArray<T>(key: string): T[] {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (error) {
      console.error(`Unable to read attendance data from ${key}`, error);
      return [];
    }
  }

  private writeArray<T>(key: string, value: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save attendance data to ${key}`, error);
      throw error;
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Sync attendance records from live backend MySQL database (via Express /api/v1/attendance/admin/all)
   */
  public async syncFromBackend(date?: string): Promise<void> {
    try {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      const res = await apiClient.get('/attendance/admin/all', { params });
      const records = res.data?.data?.records;
      if (Array.isArray(records)) {
        const mappedRecords: AttendanceRecord[] = records.map((r: any) => {
          return {
            id: String(r.id),
            employeeKey: String(r.employee_id),
            date: r.date,
            loginTime: r.clock_in
              ? new Date(r.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : null,
            logoutTime: r.clock_out
              ? new Date(r.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : null,
            status: (r.status === 'Half-Day' ? 'Half Day' : r.status) as AttendanceStatus,
            lateMinutes: Number(r.late_minutes || 0),
            workingMinutes: Math.round(Number(r.working_hours || 0) * 60),
            updatedAt: r.updatedAt || new Date().toISOString(),
          };
        });

        const currentRecords = this.readArray<AttendanceRecord>(RECORDS_STORAGE_KEY);
        const filteredCurrent = currentRecords.filter(
          (cr) => !mappedRecords.some((mr) => mr.employeeKey === cr.employeeKey && mr.date === cr.date)
        );
        this.writeArray(RECORDS_STORAGE_KEY, [...mappedRecords, ...filteredCurrent]);
        this.notifyListeners();
      }
    } catch (err) {
      console.warn('Backend attendance sync error:', err);
    }
  }

  public getCorrectionRequests(): AttendanceCorrectionRequest[] {
    return this.readArray<AttendanceCorrectionRequest>(CORRECTIONS_STORAGE_KEY).sort(
      (a, b) => b.submittedAt.localeCompare(a.submittedAt)
    );
  }

  public getPendingCorrectionCount(): number {
    return this.getCorrectionRequests().filter((request) => request.status === 'Pending').length;
  }

  public getAttendanceForDate(date: string): AttendanceRow[] {
    const today = localDateString(new Date());
    const employees = employeeService
      .getEmployees()
      .filter(
        (employee) =>
          employee.joiningDate <= date &&
          (date < today || employee.status === 'Active')
      );
    const records = this.readArray<AttendanceRecord>(RECORDS_STORAGE_KEY);
    const approvedLeaves = leaveService
      .getLeaveRequests()
      .filter(
        (request) =>
          request.status === 'Approved' &&
          request.startDate <= date &&
          date <= request.endDate
      );
    const selectedDate = new Date(`${date}T12:00:00`);
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

    const rows = employees.map((employee) => {
      const record = records.find(
        (entry) => entry.employeeKey === employee.id && entry.date === date
      );
      const onLeave = approvedLeaves.some(
        (request) => request.employeeId === employee.employeeId
      );
      const calculated = calculateAttendance(record?.loginTime ?? null, record?.logoutTime ?? null);
      let status: AttendanceStatus;

      if (onLeave) {
        status = 'On Leave';
      } else if (isWeekend) {
        status = 'Weekend';
      } else if (record) {
        status = record.status;
      } else if (date > today || (date === today && localDateString(new Date()) === date && new Date().toTimeString().slice(0, 5) < OFFICE_POLICY.autoAbsentAfter)) {
        status = 'Not Logged In';
      } else {
        status = 'Absent';
      }

      return {
        employee,
        date,
        loginTime: record?.loginTime ?? null,
        logoutTime: record?.logoutTime ?? null,
        workingMinutes: record?.workingMinutes ?? calculated.workingMinutes,
        lateMinutes: record?.lateMinutes ?? calculated.lateMinutes,
        status,
        isOnline: Boolean(record?.loginTime && !record.logoutTime && date === today),
      };
    });

    if (date === today) this.emitDailyAlerts(rows);
    return rows;
  }

  private emitDailyAlerts(rows: AttendanceRow[]): void {
    const alertedKeys = new Set(this.readArray<string>(ALERTS_STORAGE_KEY));
    const today = localDateString(new Date());
    let updated = false;

    rows.forEach((row) => {
      if (row.status !== 'Late' && row.status !== 'Absent') return;
      const key = `${today}:${row.employee.id}:${row.status}`;
      if (alertedKeys.has(key)) return;

      const lateAfter11 = row.status === 'Late' &&
        row.loginTime !== null &&
        timeToMinutes(row.loginTime) >= timeToMinutes(OFFICE_POLICY.autoAbsentAfter);
      notificationService.addNotification({
        title: lateAfter11
          ? 'Employee Logged In After 11 AM'
          : row.status === 'Late'
          ? 'Employee Logged In Late'
          : 'Employee Marked Absent',
        description: `${row.employee.firstName} ${row.employee.lastName} is ${lateAfter11 ? 'logged in after 11:00 AM' : row.status === 'Late' ? `late by ${row.lateMinutes} minutes` : 'absent'} on ${today}.`,
        category: 'attendance',
        priority: row.status === 'Absent' ? 'high' : 'medium',
        employeeName: `${row.employee.firstName} ${row.employee.lastName}`,
        employeeId: row.employee.employeeId,
        department: row.employee.department,
        actionUrl: '#attendance',
        actionLabel: 'View Attendance',
      });
      alertedKeys.add(key);
      updated = true;
    });

    if (updated) this.writeArray(ALERTS_STORAGE_KEY, Array.from(alertedKeys));
  }

  public recordLogin(employeeKey: string, date = localDateString(new Date()), loginTime = new Date().toTimeString().slice(0, 5)): AttendanceRecord | null {
    const employee = employeeService.getEmployeeById(employeeKey);
    if (!employee || employee.status !== 'Active') return null;

    return this.saveRecord(employee, date, loginTime, null);
  }

  public recordLogout(employeeKey: string, date = localDateString(new Date()), logoutTime = new Date().toTimeString().slice(0, 5)): AttendanceRecord | null {
    const employee = employeeService.getEmployeeById(employeeKey);
    if (!employee || employee.status !== 'Active') return null;

    const existing = this.readArray<AttendanceRecord>(RECORDS_STORAGE_KEY).find(
      (entry) => entry.employeeKey === employeeKey && entry.date === date
    );
    if (!existing?.loginTime) return null;
    return this.saveRecord(employee, date, existing.loginTime, logoutTime);
  }

  private saveRecord(
    employee: Employee,
    date: string,
    loginTime: string | null,
    logoutTime: string | null
  ): AttendanceRecord {
    const protectedStatus = this.getProtectedStatus(employee, date);
    const calculated = calculateAttendance(loginTime, logoutTime);
    const record: AttendanceRecord = {
      id: `${employee.id}-${date}`,
      employeeKey: employee.id,
      date,
      loginTime,
      logoutTime,
      workingMinutes: calculated.workingMinutes,
      lateMinutes: calculated.lateMinutes,
      status: protectedStatus || calculated.status,
      updatedAt: new Date().toISOString(),
    };
    const records = this.readArray<AttendanceRecord>(RECORDS_STORAGE_KEY).filter(
      (entry) => !(entry.employeeKey === employee.id && entry.date === date)
    );
    records.push(record);
    this.writeArray(RECORDS_STORAGE_KEY, records);
    this.notifyListeners();
    return record;
  }

  private getProtectedStatus(employee: Employee, date: string): AttendanceStatus | null {
    const approvedLeave = leaveService.getLeaveRequests().some(
      (request) =>
        request.employeeId === employee.employeeId &&
        request.status === 'Approved' &&
        request.startDate <= date &&
        date <= request.endDate
    );
    if (approvedLeave) return 'On Leave';
    const selectedDate = new Date(`${date}T12:00:00`);
    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) return 'Weekend';
    return null;
  }

  public correctAttendance(
    employeeKey: string,
    date: string,
    loginTime: string,
    logoutTime: string | null,
    reason: string
  ): AttendanceRecord | null {
    const employee = employeeService.getEmployeeById(employeeKey);
    if (!employee) return null;

    const record = this.saveRecord(employee, date, loginTime || null, logoutTime || null);
    const corrections = this.getCorrectionRequests();
    corrections.unshift({
      id: `correction-${Date.now()}`,
      employeeKey,
      date,
      loginTime: loginTime || null,
      logoutTime: logoutTime || null,
      reason,
      status: 'Approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
    });
    this.writeArray(CORRECTIONS_STORAGE_KEY, corrections);

    notificationService.addNotification({
      title: 'Attendance Correction Approved',
      description: `${employee.firstName} ${employee.lastName}'s attendance for ${date} was corrected. ${reason}`,
      category: 'attendance',
      priority: 'medium',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      department: employee.department,
      actionUrl: '#attendance',
      actionLabel: 'View Attendance',
    });
    this.notifyListeners();
    return record;
  }

  public approveCorrection(id: string): boolean {
    const corrections = this.getCorrectionRequests();
    const request = corrections.find((entry) => entry.id === id);
    if (!request || request.status !== 'Pending') return false;
    const employee = employeeService.getEmployeeById(request.employeeKey);
    if (!employee) return false;

    this.saveRecord(employee, request.date, request.loginTime, request.logoutTime);
    request.status = 'Approved';
    request.reviewedAt = new Date().toISOString();
    this.writeArray(CORRECTIONS_STORAGE_KEY, corrections);
    notificationService.addNotification({
      title: 'Attendance Correction Approved',
      description: `${employee.firstName} ${employee.lastName}'s attendance correction was approved.`,
      category: 'attendance',
      priority: 'medium',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      department: employee.department,
      actionUrl: '#attendance',
    });
    this.notifyListeners();
    return true;
  }

  public rejectCorrection(id: string): boolean {
    const corrections = this.getCorrectionRequests();
    const request = corrections.find((entry) => entry.id === id);
    if (!request || request.status !== 'Pending') return false;
    const employee = employeeService.getEmployeeById(request.employeeKey);
    request.status = 'Rejected';
    request.reviewedAt = new Date().toISOString();
    this.writeArray(CORRECTIONS_STORAGE_KEY, corrections);
    if (employee) {
      notificationService.addNotification({
        title: 'Attendance Correction Rejected',
        description: `${employee.firstName} ${employee.lastName}'s attendance correction was rejected.`,
        category: 'attendance',
        priority: 'medium',
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        department: employee.department,
        actionUrl: '#attendance',
      });
    }
    this.notifyListeners();
    return true;
  }

  public submitCorrectionRequest(
    employeeKey: string,
    date: string,
    loginTime: string | null,
    logoutTime: string | null,
    reason: string
  ): AttendanceCorrectionRequest | null {
    const employee = employeeService.getEmployeeById(employeeKey);
    if (!employee) return null;
    const request: AttendanceCorrectionRequest = {
      id: `correction-${Date.now()}`,
      employeeKey,
      date,
      loginTime,
      logoutTime,
      reason,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    const corrections = this.getCorrectionRequests();
    corrections.unshift(request);
    this.writeArray(CORRECTIONS_STORAGE_KEY, corrections);
    notificationService.addNotification({
      title: 'Attendance Correction Submitted',
      description: `${employee.firstName} ${employee.lastName} submitted an attendance correction for ${date}.`,
      category: 'attendance',
      priority: 'medium',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      department: employee.department,
      actionUrl: '#attendance',
    });
    this.notifyListeners();
    return request;
  }

  public getWeeklyTrend(anchorDate: string): Array<{ date: string; present: number; late: number }> {
    const anchor = new Date(`${anchorDate}T12:00:00`);
    const mondayOffset = (anchor.getDay() + 6) % 7;
    anchor.setDate(anchor.getDate() - mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(anchor);
      date.setDate(anchor.getDate() + index);
      const dateString = localDateString(date);
      const rows = this.getAttendanceForDate(dateString);
      return {
        date: dateString,
        present: rows.filter((row) => row.status === 'Present' || row.status === 'Half Day').length,
        late: rows.filter((row) => row.status === 'Late').length,
      };
    });
  }

  public getRecordForEmployee(employeeKey: string, date: string): AttendanceRecord | undefined {
    return this.readArray<AttendanceRecord>(RECORDS_STORAGE_KEY).find(
      (entry) => entry.employeeKey === employeeKey && entry.date === date
    );
  }

  public formatWorkingHours(minutes: number): string {
    if (minutes <= 0) return '—';
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
  }

  public formatMinutesAsTime(minutes: number): string {
    return minutesToTime(minutes);
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;