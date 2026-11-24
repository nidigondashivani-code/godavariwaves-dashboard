import attendanceService from '../../Attendance/services/attendance.service';
import employeeService from '../../Employee/services/employee.service';
import leaveService from '../../LeaveManagement/services/leave.service';
import { workUpdateService } from '../../WorkUpdates/services/workUpdate.service';
import type { Birthday, DashboardMetrics } from '../types/dashboard.types';

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  upcomingBirthdays: Birthday[];
}

const getLocalDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getUpcomingBirthdays = (date: Date): Birthday[] => {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return employeeService
    .getEmployees()
    .filter((employee) => employee.status === 'Active')
    .flatMap((employee) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(employee.dateOfBirth);
      if (!match) return [];

      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      let birthday = new Date(today.getFullYear(), month, day);
      if (birthday.getTime() < today.getTime()) {
        birthday = new Date(today.getFullYear() + 1, month, day);
      }

      const daysUntil = Math.round(
        (Date.UTC(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()) - todayUtc) /
          86_400_000
      );
      if (daysUntil > 10) return [];

      return [{
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        initials: `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`,
        date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(birthday),
        daysUntil,
      }];
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
};

export const getAdminDashboardData = (): AdminDashboardData => {
  const now = new Date();
  const today = getLocalDateString(now);
  const employees = employeeService.getEmployees();
  const attendanceRows = attendanceService.getAttendanceForDate(today);
  const attendanceStatuses = attendanceRows.map((row) => row.status);
  const workUpdateRows = workUpdateService.getRowsForDate(today);

  return {
    metrics: {
      totalEmployees: employees.length,
      presentToday: attendanceStatuses.filter(
        (status) => status === 'Present' || status === 'Late' || status === 'Half Day'
      ).length,
      absentToday: attendanceStatuses.filter((status) => status === 'Absent').length,
      lateEmployees: attendanceStatuses.filter((status) => status === 'Late').length,
      employeesOnLeave: attendanceStatuses.filter((status) => status === 'On Leave').length,
      pendingLeaveRequests: leaveService.getMetrics().pendingApproval,
      pendingTaskUpdates: workUpdateRows.filter((row: { status: string }) => row.status === 'Pending').length,
    },
    upcomingBirthdays: getUpcomingBirthdays(now),
  };
};