import React from 'react';
import { ArrowLeft, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBellButton from '../../Notifications/components/NotificationBellButton';

interface AttendanceLayoutProps {
  children: React.ReactNode;
}

export const AttendanceLayout: React.FC<AttendanceLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      {/* Standalone Attendance Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 shadow-sm sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/logo.png"
            alt="Godavari Wave Technologies Pvt Ltd."
            className="h-7 w-auto max-w-[170px] object-contain cursor-pointer"
            onClick={() => navigate('/admin')}
          />
          <span className="hidden h-7 border-l border-slate-200 sm:block" />
          <span className="truncate text-sm font-bold text-slate-800">
            Attendance Management
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Admin Indicator */}
          <div className="hidden items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A] md:flex">
            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
            Admin Workspace
          </div>

          {/* Real-time Notification Center */}
          <NotificationBellButton />

          {/* Navigation back to Admin Dashboard */}
          <button
            type="button"
            onClick={() => navigate('/admin')}
            aria-label="Back to Admin Dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Dashboard</span>
          </button>

          {/* Navigation to Employee Management */}
          <button
            type="button"
            onClick={() => navigate('/employees')}
            aria-label="Back to Employee Management"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Employees</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AttendanceLayout;
