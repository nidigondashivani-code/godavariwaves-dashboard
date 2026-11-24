import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboardPage from '../modules/Dashboard/pages/AdminDashboardPage';
import CompanyCalendarPage from '../modules/Calendar/pages/CompanyCalendarPage';
import AdminProfileSettingsPage from '../modules/Profile/pages/AdminProfileSettingsPage';
import LoginPage from '../modules/Authentication/pages/LoginPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/login" />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminDashboardPage />} path="/admin" />
          <Route element={<CompanyCalendarPage />} path="/admin/calendar" />
          <Route element={<AdminProfileSettingsPage />} path="/admin/profile" />
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;