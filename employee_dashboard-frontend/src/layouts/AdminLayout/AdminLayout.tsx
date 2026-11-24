import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearDemoAdminSession } from '../../modules/Authentication/services/auth.service';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const locationState = location.state as { activeNavigation?: string } | null;
  const [dashboardNavigation, setDashboardNavigation] = useState(
    () => locationState?.activeNavigation ?? 'Dashboard Overview',
  );
  useEffect(() => {
    if (location.pathname === '/admin' && locationState?.activeNavigation) {
      setDashboardNavigation(locationState.activeNavigation);
    }
  }, [location.pathname, locationState?.activeNavigation]);

  const activeNavigation = location.pathname === '/admin/work-updates'
    ? 'Task Updates'
    : location.pathname === '/admin/calendar'
      ? 'Calendar'
      : location.pathname === '/admin/profile'
        ? 'Profile & Settings'
        : dashboardNavigation;
  const navigate = useNavigate();

  const handleLogout = () => {
    clearDemoAdminSession();
    navigate('/login', { replace: true });
  };

  const handleSelectNavigation = (label: string) => {
    if (label === 'Employee Management') {
      navigate('/employees');
      return;
    }

    if (label === 'Attendance') {
      navigate('/attendance');
      return;
    }

    if (label === 'Leave Requests') {
      navigate('/leaves');
      return;
    }

    if (label === 'Task Updates') {
      navigate('/admin/work-updates');
      return;
    }

    if (label === 'Calendar') {
      navigate('/admin/calendar');
      return;
    }

    if (label === 'Profile & Settings') {
      navigate('/admin/profile');
      return;
    }

    if (label === 'Dashboard Overview') {
      if (location.pathname !== '/admin') {
        navigate('/admin');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (location.pathname !== '/admin') {
      setDashboardNavigation(label);
      navigate('/admin', { state: { activeNavigation: label } });
    } else {
      setDashboardNavigation(label);
    }

    const navSectionMap: Record<string, string> = {
      'Dashboard Overview': 'dashboard-overview',
      'Employee Management': 'workforce-overview',
      'Attendance': 'workforce-overview',
      'Leave Requests': 'pending-requests',
      'Attendance Corrections': 'pending-requests',
      'Profile Requests': 'pending-requests',
      'Announcements': 'announcements',
    };
    const sectionId = navSectionMap[label];
    if (sectionId) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {mobileSidebarOpen && (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          type="button"
        />
      )}

      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)}
        onLogout={handleLogout}
        activeItem={activeNavigation}
        onSelectNavigation={handleSelectNavigation}
      />

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarCollapsed ? 'lg:pl-[5.5rem]' : 'lg:pl-[17rem]'
        }`}
      >
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
          onNavigate={handleSelectNavigation}
        />
        <main className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;