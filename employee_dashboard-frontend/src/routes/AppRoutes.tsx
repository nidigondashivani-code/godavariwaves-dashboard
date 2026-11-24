import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { EmployeeRoute } from './EmployeeRoute';
import { EmployeeLayout } from '../layouts/EmployeeLayout/EmployeeLayout';

// Admin Dashboard Pages & Layouts (Preserved from main / PR #7)
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import AdminDashboardPage from '../modules/Dashboard/pages/AdminDashboardPage';
import AdminWorkUpdatesPage from '../modules/WorkUpdates/pages/AdminWorkUpdatesPage';
import AdminProfileSettingsPage from '../modules/Profile/pages/AdminProfileSettingsPage';
import ManageEmployeesPage from '../modules/Employee/pages/ManageEmployeesPage';
import DepartmentsPage from '../modules/Departments/pages/DepartmentsPage';
import RolePermissionsPage from '../modules/RolePermissions/pages/RolePermissionsPage';
import AttendanceLayout from '../modules/Attendance/layouts/AttendanceLayout';
import AdminAttendancePage from '../modules/Attendance/pages/AdminAttendancePage';
import LeaveLayout from '../modules/LeaveManagement/layouts/LeaveLayout';
import AdminLeaveManagementPage from '../modules/LeaveManagement/pages/AdminLeaveManagementPage';

// Auth Pages (Untouched Admin LoginPage + EmployeeLoginPage)
import LoginPage from '../modules/Authentication/pages/LoginPage';
import EmployeeLoginPage from '../modules/Authentication/pages/EmployeeLoginPage';

// Employee Dashboard Pages
import { EmployeeDashboardPage } from '../modules/Dashboard/pages/EmployeeDashboardPage';
import { EmployeeAttendancePage } from '../modules/Attendance/pages/EmployeeAttendancePage';
import { EmployeeAttendanceCorrectionPage } from '../modules/AttendanceCorrection/pages/EmployeeAttendanceCorrectionPage';
import { EmployeeLeavePage } from '../modules/LeaveManagement/pages/EmployeeLeavePage';
import { EmployeeWorkUpdatesPage } from '../modules/WorkUpdates/pages/EmployeeWorkUpdatesPage';
import { EmployeeTasksPage } from '../modules/TaskManagement/pages/EmployeeTasksPage';
import { EmployeeCalendarPage } from '../modules/Calendar/pages/EmployeeCalendarPage';
import { EmployeeAnnouncementsPage } from '../modules/Announcements/pages/EmployeeAnnouncementsPage';
import { EmployeeNotificationsPage } from '../modules/Notifications/pages/EmployeeNotificationsPage';
import { EmployeeHistoryPage } from '../modules/Employee/pages/EmployeeHistoryPage';
import { EmployeeProfilePage } from '../modules/Profile/pages/EmployeeProfilePage';

import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root routes to Admin Dashboard; Admin Login at /admin/login and /login, Employee Login at /employee/login */}
        <Route element={<Navigate replace to="/admin" />} path="/" />
        <Route element={<EmployeeLoginPage />} path="/employee/login" />
        <Route element={<LoginPage />} path="/admin/login" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<ForbiddenPage />} path="/forbidden" />

        {/* Role-Protected Employee Dashboard Routes */}
        <Route element={<EmployeeRoute />}>
          <Route element={<EmployeeLayout />} path="/employee">
            <Route index element={<Navigate replace to="/employee/dashboard" />} />
            <Route element={<EmployeeDashboardPage />} path="dashboard" />
            <Route element={<EmployeeAttendancePage />} path="attendance" />
            <Route element={<EmployeeAttendanceCorrectionPage />} path="attendance-correction" />
            <Route element={<EmployeeLeavePage />} path="leaves" />
            <Route element={<EmployeeWorkUpdatesPage />} path="work-updates" />
            <Route element={<EmployeeTasksPage />} path="tasks" />
            <Route element={<EmployeeCalendarPage />} path="calendar" />
            <Route element={<EmployeeAnnouncementsPage />} path="announcements" />
            <Route element={<EmployeeNotificationsPage />} path="notifications" />
            <Route element={<EmployeeHistoryPage />} path="history" />
            <Route element={<EmployeeProfilePage />} path="profile" />
          </Route>
        </Route>

        {/* Role-Protected Admin Dashboard Routes (Preserved from main / PR #7 + /admin/* aliases) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminDashboardPage />} path="/admin" />
          <Route element={<AdminWorkUpdatesPage />} path="/admin/work-updates" />
          <Route element={<AdminProfileSettingsPage />} path="/admin/profile" />

          {/* Core HR Management Modules inside Unified Admin Layout */}
          <Route element={<AdminLayout><ManageEmployeesPage /></AdminLayout>} path="/employees" />
          <Route element={<AdminLayout><ManageEmployeesPage /></AdminLayout>} path="/admin/employees" />
          <Route element={<AdminLayout><RolePermissionsPage /></AdminLayout>} path="/roles" />
          <Route element={<AdminLayout><RolePermissionsPage /></AdminLayout>} path="/admin/roles" />
          <Route element={<AdminLayout><DepartmentsPage /></AdminLayout>} path="/departments" />
          <Route element={<AdminLayout><DepartmentsPage /></AdminLayout>} path="/admin/departments" />

          {/* Dedicated Admin Operations Modules */}
          <Route element={<AttendanceLayout><AdminAttendancePage /></AttendanceLayout>} path="/attendance" />
          <Route element={<LeaveLayout><AdminLeaveManagementPage /></LeaveLayout>} path="/leaves" />
          <Route element={<Navigate replace to="/leaves" />} path="/leave" />
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
