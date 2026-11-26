import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Purge all legacy and test mock data from localStorage across all modules
const SYSTEM_PURGE_KEY = 'ems_system_clean_v4_state';
try {
  if (localStorage.getItem(SYSTEM_PURGE_KEY) !== 'cleaned') {
    const legacyKeys = [
      'ems_employees_directory_live_v1',
      'ems_employees_directory_live_v2',
      'ems_employees_data_clean_v1',
      'ems_employees_data_v4',
      'ems_employees_data_v3',
      'ems_employees_data_v2',
      'ems_employees_data_v1',
      'ems_admin_attendance_records_v1',
      'ems_admin_attendance_records_v2',
      'ems_attendance_correction_requests_v1',
      'ems_attendance_correction_requests_v2',
      'ems_attendance_alerts_v1',
      'ems_attendance_alerts_v2',
      'ems_admin_leave_requests_v1',
      'ems_admin_leave_requests_v2',
      'ems_admin_leave_balances_v1',
      'ems_admin_leave_balances_v2',
      'ems_daily_work_updates_v1',
      'ems_daily_work_updates_v2',
      'ems_daily_work_update_audit_v1',
      'ems_daily_work_update_audit_v2',
      'ems_daily_work_update_notification_keys_v1',
      'ems_daily_work_update_notification_keys_v2',
      'ems_notifications_clean_v2',
      'ems_notifications_clean_v1',
      'ems_notifications_v1',
      'ems_notifications_simulated_v1',
      'ems_role_activities_v1',
      'ems_role_audits_v1',
      'ems_dept_activities_v1',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(SYSTEM_PURGE_KEY, 'cleaned');
  }
} catch {
  // Ignore localStorage access restrictions if any
}

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
