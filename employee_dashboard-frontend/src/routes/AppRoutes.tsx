import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboardPage from '../modules/Dashboard/pages/AdminDashboardPage';
import CompanyCalendarPage from '../modules/Calendar/pages/CompanyCalendarPage';
import AdminProfileSettingsPage from '../modules/Profile/pages/AdminProfileSettingsPage';
import LoginPage from '../modules/Authentication/pages/LoginPage';
import ManageEmployeesPage from '../modules/Employee/pages/ManageEmployeesPage';
import RolePermissionsPage from '../modules/RolePermissions/pages/RolePermissionsPage';
import DepartmentsPage from '../modules/Departments/pages/DepartmentsPage';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import AttendanceLayout from '../modules/Attendance/layouts/AttendanceLayout';
import AdminAttendancePage from '../modules/Attendance/pages/AdminAttendancePage';
import LeaveLayout from '../modules/LeaveManagement/layouts/LeaveLayout';
import AdminLeaveManagementPage from '../modules/LeaveManagement/pages/AdminLeaveManagementPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/admin" />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<ProtectedRoute />}>
          {/* Admin Dashboard & Executive Suite */}
          <Route element={<AdminDashboardPage />} path="/admin" />
          <Route element={<CompanyCalendarPage />} path="/admin/calendar" />
          <Route element={<AdminProfileSettingsPage />} path="/admin/profile" />

          {/* Core HR Management Modules */}
          <Route
            element={
              <DashboardLayout activeNav="employees">
                <ManageEmployeesPage />
              </DashboardLayout>
            }
            path="/employees"
          />
          <Route
            element={
              <DashboardLayout activeNav="roles">
                <RolePermissionsPage />
              </DashboardLayout>
            }
            path="/roles"
          />
          <Route
            element={
              <DashboardLayout activeNav="departments">
                <DepartmentsPage />
              </DashboardLayout>
            }
            path="/departments"
          />

          {/* Dedicated Operations Modules */}
          <Route
            element={
              <AttendanceLayout>
                <AdminAttendancePage />
              </AttendanceLayout>
            }
            path="/attendance"
          />
          <Route
            element={
              <LeaveLayout>
                <AdminLeaveManagementPage />
              </LeaveLayout>
            }
            path="/leaves"
          />
          <Route element={<Navigate replace to="/leaves" />} path="/leave" />
        </Route>
        <Route element={<Navigate replace to="/admin" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
