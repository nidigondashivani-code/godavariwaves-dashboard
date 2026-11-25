import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import CompanyLogo from '../../components/common/CompanyLogo';
import { adminNavigationItems } from './adminNavigation';

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
  onLogout: () => void;
  activeItem: string;
  onSelectNavigation: (label: string) => void;
}

function AdminSidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
  onLogout,
  activeItem,
  onSelectNavigation,
}: AdminSidebarProps) {
  const isEmployeeManagementActive =
    activeItem === 'Employee Management' ||
    activeItem === 'Employee Directory' ||
    activeItem === 'Role & Permissions' ||
    activeItem === 'Profile Requests';

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Employee Management': isEmployeeManagementActive,
  });

  useEffect(() => {
    if (isEmployeeManagementActive) {
      setExpandedMenus((prev) => ({ ...prev, 'Employee Management': true }));
    }
  }, [isEmployeeManagementActive]);

  const toggleSubMenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-blue-950/20 bg-[#1E3A8A] text-white transition-all duration-300 lg:translate-x-0 ${
        collapsed ? 'lg:w-[5.5rem]' : 'lg:w-[17rem]'
      } ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
    >
      <div className={`flex min-h-[76px] items-center justify-between gap-2 border-b border-white/10 px-3.5 py-3 ${collapsed ? 'lg:min-h-[76px] lg:justify-center lg:gap-1 lg:px-2' : ''}`}>
        <div className={`flex min-w-0 flex-1 items-center ${collapsed ? 'lg:flex-none' : ''}`}>
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 ${
              collapsed
                ? 'h-10 w-10 p-1.5'
                : 'h-[50px] w-full max-w-[195px] px-2.5 py-1.5'
            }`}
          >
            <CompanyLogo className="h-full w-full object-contain" />
          </div>
        </div>
        <button
          aria-label="Close navigation menu"
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white lg:hidden"
          onClick={onCloseMobile}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white lg:flex ${
            collapsed ? 'lg:hidden' : ''
          }`}
          onClick={onToggleCollapsed}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="h-[18px] w-[18px]" />
        </button>
        {collapsed && (
          <button
            aria-label="Expand sidebar"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white lg:flex"
            onClick={onToggleCollapsed}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
        <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/70 ${collapsed ? 'lg:hidden' : ''}`}>
          Workspace
        </p>
        {adminNavigationItems.map((item) => {
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
          const isItemActive =
            activeItem === item.label ||
            (hasSubItems && item.subItems?.some((sub) => sub.label === activeItem));
          const isExpanded = Boolean(expandedMenus[item.label]);

          if (hasSubItems) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  aria-expanded={isExpanded}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition duration-150 ${
                    isItemActive
                      ? 'bg-white/15 text-white shadow-sm shadow-blue-950/20 ring-1 ring-inset ring-white/10'
                      : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                  onClick={() => {
                    if (collapsed) {
                      onSelectNavigation(item.subItems![0].label);
                      onCloseMobile();
                    } else {
                      if (!isEmployeeManagementActive) {
                        onSelectNavigation(item.subItems![0].label);
                        setExpandedMenus((prev) => ({ ...prev, [item.label]: true }));
                        onCloseMobile();
                      } else {
                        toggleSubMenu(item.label);
                      }
                    }
                  }}
                  title={collapsed ? item.label : undefined}
                  type="button"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon
                      aria-hidden="true"
                      className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                        isItemActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                      }`}
                      strokeWidth={1.9}
                    />
                    <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                  </div>

                  {!collapsed && (
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-blue-300 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-white' : 'group-hover:text-white'
                      }`}
                    />
                  )}
                </button>

                {/* Sub-modules for Employee Management (Employee Directory & Role & Permissions) */}
                {isExpanded && !collapsed && (
                  <div className="ml-4 space-y-1 border-l-2 border-white/20 pl-2.5 pt-1 animate-fadeIn">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = activeItem === subItem.label;
                      return (
                        <button
                          key={subItem.label}
                          aria-current={isSubActive ? 'page' : undefined}
                          className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition duration-150 ${
                            isSubActive
                              ? 'bg-white/25 text-white font-semibold shadow-xs ring-1 ring-inset ring-white/20'
                              : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                          }`}
                          onClick={() => {
                            onSelectNavigation(subItem.label);
                            onCloseMobile();
                          }}
                          type="button"
                        >
                          <subItem.icon
                            aria-hidden="true"
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isSubActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                            }`}
                            strokeWidth={2}
                          />
                          <span className="truncate">{subItem.label}</span>
                          {isSubActive && (
                            <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single regular navigation item
          const isActive = activeItem === item.label;
          return (
            <button
              key={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition duration-150 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm shadow-blue-950/20 ring-1 ring-inset ring-white/10'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
              onClick={() => {
                onSelectNavigation(item.label);
                onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              type="button"
            >
              <item.icon
                aria-hidden="true"
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                }`}
                strokeWidth={1.9}
              />
              <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
              {isActive && !collapsed && (
                <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 p-3 ${collapsed ? 'lg:px-2' : ''}`}>
        <button
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-blue-100/80 transition hover:bg-rose-500/15 hover:text-rose-100 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
          onClick={() => {
            onLogout();
            onCloseMobile();
          }}
          title={collapsed ? 'Logout' : undefined}
          type="button"
        >
          <LogOut aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-blue-200 group-hover:text-rose-200" />
          <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
