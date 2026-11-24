import React from 'react';
import {
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeNav?: string;
  onNavigate?: (nav: 'employees' | 'roles' | 'leaves' | 'attendance') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  activeNav = 'roles',
  onNavigate,
}) => {
  const navigate = useNavigate();

  const handleNavClick = (
    dest: 'employees' | 'roles' | 'leaves' | 'attendance' | 'admin',
    path: string
  ) => {
    if (dest === 'admin') {
      navigate('/admin');
    } else if (onNavigate) {
      onNavigate(dest);
    } else {
      navigate(path);
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-[#1E3A8A] text-white shadow-xl select-none`}
      >
        {/* Company Brand Logo & Header */}
        <div className="h-18 flex items-center justify-between px-4 py-3 border-b border-blue-800/60 bg-[#172554]">
          <div
            className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
            onClick={() => navigate('/admin')}
            title="Go to Admin Dashboard"
          >
            {!collapsed ? (
              <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-md flex items-center justify-center border border-white/20">
                <img
                  src="/logo.png"
                  alt="Godavari Wave Technologies Pvt Ltd."
                  className="h-7 w-auto object-contain max-w-[170px]"
                />
              </div>
            ) : (
              <div className="bg-white p-1 rounded-xl shadow-md flex items-center justify-center border border-white/20 mx-auto">
                <img
                  src="/favicon.png"
                  alt="Godavari Wave Technologies"
                  className="w-8 h-8 object-contain"
                />
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-[#2563EB] transition ml-1 shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          {/* Main Dashboard Link */}
          <div>
            <button
              type="button"
              onClick={() => handleNavClick('admin', '/admin')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-100 hover:text-white hover:bg-[#2563EB] transition-all group"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-300 group-hover:text-white" />
              {!collapsed && <span className="truncate">Admin Dashboard</span>}
            </button>
          </div>

          {/* 1. Core HR Management */}
          <div>
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-blue-300/80 mb-2">
                Core HR Management
              </h4>
            )}

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleNavClick('employees', '/employees')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  activeNav === 'employees'
                    ? 'bg-[#DBEAFE] text-[#1E3A8A] shadow-xs'
                    : 'text-blue-100 hover:text-white hover:bg-[#2563EB]'
                }`}
              >
                <Users className={`w-4 h-4 shrink-0 ${activeNav === 'employees' ? 'text-[#1E3A8A]' : 'text-blue-300 group-hover:text-white'}`} />
                {!collapsed && <span className="truncate">Employee Directory</span>}
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('roles', '/roles')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  activeNav === 'roles'
                    ? 'bg-[#DBEAFE] text-[#1E3A8A] shadow-xs'
                    : 'text-blue-100 hover:text-white hover:bg-[#2563EB]'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 shrink-0 ${activeNav === 'roles' ? 'text-[#1E3A8A]' : 'text-blue-300 group-hover:text-white'}`} />
                {!collapsed && <span className="truncate">Role & Permissions</span>}
              </button>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
