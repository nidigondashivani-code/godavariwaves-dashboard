import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import NotificationBellButton from '../../modules/Notifications/components/NotificationBellButton';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu button */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          {/* Mobile brand logo */}
          <div className="flex lg:hidden items-center bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            <img src="/logo.png" alt="Godavari Wave Technologies" className="h-6 w-auto object-contain" />
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-500">
            <img src="/favicon.png" alt="Godavari Wave Technologies" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-slate-700">Godavari Wave Technologies Pvt Ltd.</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Admin indicator badge */}
        <div className="hidden md:flex items-center gap-2 bg-blue-50 text-[#1E3A8A] px-3 py-1 rounded-lg border border-blue-100 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <span>Admin Workspace</span>
        </div>

        {/* Notifications Icon Button with Real-Time Notification Center */}
        <NotificationBellButton />
      </div>
    </header>
  );
};

export default Header;
