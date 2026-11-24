import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { EmployeeRoute } from './EmployeeRoute';
import { EmployeeLayout } from '../layouts/EmployeeLayout/EmployeeLayout';

// Friend's Admin Dashboard Pages (Preserved untouched)
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import AdminDashboardPage from '../modules/Dashboard/pages/AdminDashboardPage';
import CompanyCalendarPage from '../modules/Calendar/pages/CompanyCalendarPage';
import AdminProfileSettingsPage from '../modules/Profile/pages/AdminProfileSettingsPage';
import ManageEmployeesPage from '../modules/Employee/pages/ManageEmployeesPage';
import DepartmentsPage from '../modules/Departments/pages/DepartmentsPage';
import RolePermissionsPage from '../modules/RolePermissions/pages/RolePermissionsPage';
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
        {/* Root opens Employee Login; Admin Login preserved untouched at /admin/login and /login */}
        <Route element={<Navigate replace to="/employee/login" />} path="/" />
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

        {/* Role-Protected Admin Dashboard Routes (Preserved untouched from origin/main) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminDashboardPage />} path="/admin" />
          <Route element={<AdminLayout><ManageEmployeesPage /></AdminLayout>} path="/admin/employees" />
          <Route element={<AdminLayout><DepartmentsPage /></AdminLayout>} path="/admin/departments" />
          <Route element={<AdminLayout><RolePermissionsPage /></AdminLayout>} path="/admin/roles" />
          <Route element={<CompanyCalendarPage />} path="/admin/calendar" />
          <Route element={<AdminProfileSettingsPage />} path="/admin/profile" />
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
