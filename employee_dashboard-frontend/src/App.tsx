import React, { useState, useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import ManageEmployeesPage from './modules/Employee/pages/ManageEmployeesPage';
import RolePermissionsPage from './modules/RolePermissions/pages/RolePermissionsPage';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<'employees' | 'roles'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#roles') return 'roles';
      return 'employees';
    }
    return 'employees';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#roles') {
        setActiveNav('roles');
      } else {
        setActiveNav('employees');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (nav: 'employees' | 'roles') => {
    setActiveNav(nav);
    if (nav === 'roles') {
      window.location.hash = '#roles';
    } else {
      window.location.hash = '#employees';
    }
  };

  return (
    <DashboardLayout activeNav={activeNav} onNavigate={handleNavigate}>
      {activeNav === 'roles' ? <RolePermissionsPage /> : <ManageEmployeesPage />}
    </DashboardLayout>
  );
};

export default App;
