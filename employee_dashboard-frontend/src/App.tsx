import React, { useState, useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import AttendanceLayout from './modules/Attendance/layouts/AttendanceLayout';
import LeaveLayout from './modules/LeaveManagement/layouts/LeaveLayout';
import ManageEmployeesPage from './modules/Employee/pages/ManageEmployeesPage';
import RolePermissionsPage from './modules/RolePermissions/pages/RolePermissionsPage';
import AdminLeaveManagementPage from './modules/LeaveManagement/pages/AdminLeaveManagementPage';
import AdminAttendancePage from './modules/Attendance/pages/AdminAttendancePage';

type ActiveNav = 'employees' | 'roles';

const isAttendanceRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.replace(/\/+$/, '') === '/attendance' ||
    window.location.hash === '#attendance'
  );
};

const isLeaveRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.replace(/\/+$/, '') === '/leaves' ||
    window.location.pathname.replace(/\/+$/, '') === '/leave' ||
    window.location.hash === '#leaves' ||
    window.location.hash === '#leave'
  );
};

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<ActiveNav>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#roles') return 'roles';
      return 'employees';
    }
    return 'employees';
  });

  const [attendanceRoute, setAttendanceRoute] = useState(() => isAttendanceRoute());
  const [leaveRoute, setLeaveRoute] = useState(() => isLeaveRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      const isAtt = isAttendanceRoute();
      const isLev = isLeaveRoute();
      setAttendanceRoute(isAtt);
      setLeaveRoute(isLev);

      if (window.location.hash === '#attendance') {
        window.history.replaceState(null, '', '/attendance');
      } else if (window.location.hash === '#leaves' || window.location.hash === '#leave') {
        window.history.replaceState(null, '', '/leaves');
      }

      if (window.location.hash === '#roles') {
        setActiveNav('roles');
      } else if (window.location.hash === '#employees') {
        setActiveNav('employees');
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleNavigate = (nav: 'employees' | 'roles' | 'leaves' | 'attendance') => {
    if (nav === 'attendance') {
      setAttendanceRoute(true);
      setLeaveRoute(false);
      window.history.pushState(null, '', '/attendance');
      return;
    }
    if (nav === 'leaves') {
      setLeaveRoute(true);
      setAttendanceRoute(false);
      window.history.pushState(null, '', '/leaves');
      return;
    }

    setAttendanceRoute(false);
    setLeaveRoute(false);
    setActiveNav(nav);
    window.location.hash = nav === 'employees' ? '#employees' : `#${nav}`;
  };

  // 1. Dedicated Standalone Leave Management Page
  if (leaveRoute) {
    return (
      <LeaveLayout>
        <AdminLeaveManagementPage />
      </LeaveLayout>
    );
  }

  // 2. Dedicated Standalone Attendance Management Page
  if (attendanceRoute) {
    return (
      <AttendanceLayout>
        <AdminAttendancePage />
      </AttendanceLayout>
    );
  }

  // 3. Core HR Dashboard Layout (Employee Directory & Role Permissions)
  return (
    <DashboardLayout activeNav={activeNav} onNavigate={handleNavigate}>
      {activeNav === 'roles' ? <RolePermissionsPage /> : <ManageEmployeesPage />}
    </DashboardLayout>
  );
};

export default App;
