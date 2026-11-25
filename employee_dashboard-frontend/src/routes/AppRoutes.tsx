import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { EmployeeRoute } from './EmployeeRoute';
import { EmployeeLayout } from '../layouts/EmployeeLayout/EmployeeLayout';

// Layouts kept eager to prevent full layout flashes
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import AttendanceLayout from '../modules/Attendance/layouts/AttendanceLayout';
import LeaveLayout from '../modules/LeaveManagement/layouts/LeaveLayout';
import { LoadingSpinner } from '../components/common/UI';

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('../modules/Dashboard/pages/AdminDashboardPage'));
const AdminWorkUpdatesPage = lazy(() => import('../modules/WorkUpdates/pages/AdminWorkUpdatesPage'));
const AdminProfileSettingsPage = lazy(() => import('../modules/Profile/pages/AdminProfileSettingsPage'));
const AdminProfileRequestsPage = lazy(() => import('../modules/Profile/pages/AdminProfileRequestsPage'));
const ManageEmployeesPage = lazy(() => import('../modules/Employee/pages/ManageEmployeesPage'));
const DepartmentsPage = lazy(() => import('../modules/Departments/pages/DepartmentsPage'));
const RolePermissionsPage = lazy(() => import('../modules/RolePermissions/pages/RolePermissionsPage'));
const AdminAttendancePage = lazy(() => import('../modules/Attendance/pages/AdminAttendancePage'));
const AdminLeaveManagementPage = lazy(() => import('../modules/LeaveManagement/pages/AdminLeaveManagementPage'));

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('../modules/Authentication/pages/LoginPage'));
const EmployeeLoginPage = lazy(() => import('../modules/Authentication/pages/EmployeeLoginPage'));

// Lazy-loaded Employee Pages
const EmployeeDashboardPage = lazy(() =>
  import('../modules/Dashboard/pages/EmployeeDashboardPage').then((m) => ({ default: m.EmployeeDashboardPage }))
);
const EmployeeAttendancePage = lazy(() =>
  import('../modules/Attendance/pages/EmployeeAttendancePage').then((m) => ({ default: m.EmployeeAttendancePage }))
);
const EmployeeLeavePage = lazy(() =>
  import('../modules/LeaveManagement/pages/EmployeeLeavePage').then((m) => ({ default: m.EmployeeLeavePage }))
);
const EmployeeWorkUpdatesPage = lazy(() =>
  import('../modules/WorkUpdates/pages/EmployeeWorkUpdatesPage').then((m) => ({ default: m.EmployeeWorkUpdatesPage }))
);
const EmployeeTasksPage = lazy(() =>
  import('../modules/TaskManagement/pages/EmployeeTasksPage').then((m) => ({ default: m.EmployeeTasksPage }))
);
const EmployeeNotificationsPage = lazy(() =>
  import('../modules/Notifications/pages/EmployeeNotificationsPage').then((m) => ({ default: m.EmployeeNotificationsPage }))
);
const EmployeeProfilePage = lazy(() =>
  import('../modules/Profile/pages/EmployeeProfilePage').then((m) => ({ default: m.EmployeeProfilePage }))
);

const ForbiddenPage = lazy(() =>
  import('../pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage }))
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoadingFallback = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center p-8">
    <LoadingSpinner label="Loading module..." />
  </div>
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
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
              <Route element={<Navigate replace to="/employee/dashboard" />} path="attendance-correction" />
              <Route element={<EmployeeLeavePage />} path="leaves" />
              <Route element={<Navigate replace to="/employee/leaves" />} path="leave" />
              <Route element={<EmployeeWorkUpdatesPage />} path="work-updates" />
              <Route element={<Navigate replace to="/employee/work-updates" />} path="work-update" />
              <Route element={<EmployeeTasksPage />} path="tasks" />
              <Route element={<Navigate replace to="/employee/tasks" />} path="task" />
              <Route element={<Navigate replace to="/employee/dashboard" />} path="calendar" />
              <Route element={<Navigate replace to="/employee/dashboard" />} path="announcements" />
              <Route element={<EmployeeNotificationsPage />} path="notifications" />
              <Route element={<Navigate replace to="/employee/dashboard" />} path="history" />
              <Route element={<EmployeeProfilePage />} path="profile" />
            </Route>
          </Route>

          {/* Role-Protected Admin Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminDashboardPage />} path="/admin" />
            <Route element={<AdminWorkUpdatesPage />} path="/admin/work-updates" />
            <Route element={<AdminProfileSettingsPage />} path="/admin/profile" />
            <Route element={<AdminProfileRequestsPage />} path="/admin/profile-requests" />
            <Route element={<Navigate replace to="/admin/profile-requests" />} path="/profile-requests" />

            {/* Core HR Management Modules inside Unified Admin Layout */}
            <Route element={<AdminLayout><ManageEmployeesPage /></AdminLayout>} path="/employees" />
            <Route element={<AdminLayout><ManageEmployeesPage /></AdminLayout>} path="/admin/employees" />
            <Route element={<AdminLayout><RolePermissionsPage /></AdminLayout>} path="/roles" />
            <Route element={<AdminLayout><RolePermissionsPage /></AdminLayout>} path="/admin/roles" />
            <Route element={<AdminLayout><DepartmentsPage /></AdminLayout>} path="/departments" />
            <Route element={<AdminLayout><DepartmentsPage /></AdminLayout>} path="/admin/departments" />

            {/* Dedicated Admin Operations Modules */}
            <Route element={<AttendanceLayout><AdminAttendancePage /></AttendanceLayout>} path="/attendance" />
            <Route element={<Navigate replace to="/attendance" />} path="/admin/attendance" />
            <Route element={<Navigate replace to="/attendance" />} path="/admin/attendance-corrections" />
            <Route element={<LeaveLayout><AdminLeaveManagementPage /></LeaveLayout>} path="/leaves" />
            <Route element={<Navigate replace to="/leaves" />} path="/leave" />
            <Route element={<Navigate replace to="/leaves" />} path="/admin/leaves" />
            <Route element={<Navigate replace to="/admin/work-updates" />} path="/admin/tasks" />
            <Route element={<Navigate replace to="/admin/work-updates" />} path="/tasks" />
          </Route>

          <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
