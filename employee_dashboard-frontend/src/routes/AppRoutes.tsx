import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboardPage from '../modules/Dashboard/pages/AdminDashboardPage';
import AdminWorkUpdatesPage from '../modules/WorkUpdates/pages/AdminWorkUpdatesPage';
import AdminProfileSettingsPage from '../modules/Profile/pages/AdminProfileSettingsPage';
import LoginPage from '../modules/Authentication/pages/LoginPage';
import ManageEmployeesPage from '../modules/Employee/pages/ManageEmployeesPage';
import RolePermissionsPage from '../modules/RolePermissions/pages/RolePermissionsPage';
import DepartmentsPage from '../modules/Departments/pages/DepartmentsPage';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
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
          <Route element={<AdminWorkUpdatesPage />} path="/admin/work-updates" />
          <Route element={<AdminProfileSettingsPage />} path="/admin/profile" />

          {/* Core HR Management Modules inside Unified Admin Layout */}
          <Route
            element={
              <AdminLayout>
                <ManageEmployeesPage />
              </AdminLayout>
            }
            path="/employees"
          />
          <Route
            element={
              <AdminLayout>
                <RolePermissionsPage />
              </AdminLayout>
            }
            path="/roles"
          />
          <Route
            element={
              <AdminLayout>
                <DepartmentsPage />
              </AdminLayout>
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
