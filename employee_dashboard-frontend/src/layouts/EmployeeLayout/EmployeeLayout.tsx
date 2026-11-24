import React, { useState, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  FileText,
  CheckSquare,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Briefcase,
  Check,
} from 'lucide-react';
import CompanyLogo from '../../components/common/CompanyLogo';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import { getAssetUrl } from '../../config/env.config';
import type { NotificationItem } from '../../types/user.types';

const EMPLOYEE_NAV = [
  { label: 'Dashboard', to: '/employee/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', to: '/employee/attendance', icon: Clock },
  { label: 'Leave Management', to: '/employee/leaves', icon: CalendarDays },
  { label: 'Work Updates', to: '/employee/work-updates', icon: FileText },
  { label: 'My Tasks', to: '/employee/tasks', icon: CheckSquare },
  { label: 'Notifications', to: '/employee/notifications', icon: Bell },
  { label: 'Profile', to: '/employee/profile', icon: UserCircle },
];

export const EmployeeLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);

  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/notifications?limit=4');
      setUnreadCount(res.data?.data?.unreadCount || 0);
      setRecentNotifications(res.data?.data?.notifications || []);
    } catch {
      // Silent background refresh
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30000);
    const onRefresh = () => fetchUnreadCount();
    window.addEventListener('gw:notifications-updated', onRefresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('gw:notifications-updated', onRefresh);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !notificationRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }
      if (!(target instanceof Element) || !target.closest('[data-dashboard-search]')) {
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentNav =
    EMPLOYEE_NAV.find((item) => location.pathname.startsWith(item.to)) || EMPLOYEE_NAV[0];

  const searchMatches = searchQuery.trim()
    ? EMPLOYEE_NAV.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  const selectSearchResult = (to: string) => {
    navigate(to);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setActiveSearchIndex(0);
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && searchMatches.length > 0) {
      event.preventDefault();
      setActiveSearchIndex((index) => (index + 1) % searchMatches.length);
    } else if (event.key === 'ArrowUp' && searchMatches.length > 0) {
      event.preventDefault();
      setActiveSearchIndex((index) => (index - 1 + searchMatches.length) % searchMatches.length);
    } else if (event.key === 'Enter' && searchOpen && searchMatches[activeSearchIndex]) {
      event.preventDefault();
      selectSearchResult(searchMatches[activeSearchIndex].to);
    } else if (event.key === 'Escape') {
      setSearchOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event('gw:notifications-updated'));
    } catch {
      // Silent error handling
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/employee/login', { replace: true });
  };

  const emp = user?.employee;
  const displayName = emp?.fullName || user?.email || 'Employee';
  const designation = emp?.designationTitle || emp?.employeeCode || 'Employee';
  const avatarUrl = getAssetUrl(emp?.profilePicture);
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const renderSearchSuggestions = (variant: 'desktop' | 'mobile') => {
    if (!searchOpen || !searchQuery.trim()) return null;
    const optionId = (index: number) => `employee-search-${variant}-option-${index}`;

    return (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-[60] max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.28)]"
        id={`employee-search-${variant}-results`}
        role="listbox"
      >
        {searchMatches.length > 0 ? (
          searchMatches.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeSearchIndex;

            return (
              <button
                aria-selected={isActive}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                id={optionId(index)}
                key={item.to}
                onClick={() => selectSearchResult(item.to)}
                onMouseEnter={() => setActiveSearchIndex(index)}
                role="option"
                type="button"
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="text-[10px] text-slate-400">Navigation</span>
              </button>
            );
          })
        ) : (
          <p className="px-3 py-3 text-sm text-slate-500" role="status">
            No results found for &ldquo;{searchQuery.trim()}&rdquo;.
          </p>
        )}
      </div>
    );
  };

  const renderSearchInput = (variant: 'desktop' | 'mobile', inputRef?: RefObject<HTMLInputElement | null>) => (
    <>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        aria-activedescendant={
          searchOpen && searchMatches.length > 0 ? `employee-search-${variant}-option-${activeSearchIndex}` : undefined
        }
        aria-autocomplete="list"
        aria-controls={`employee-search-${variant}-results`}
        aria-expanded={searchOpen && searchQuery.trim().length > 0}
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
        onChange={(event) => {
          setSearchQuery(event.target.value);
          setActiveSearchIndex(0);
          setSearchOpen(true);
        }}
        onFocus={() => setSearchOpen(true)}
        onKeyDown={handleSearchKeyDown}
        placeholder="Search anything..."
        ref={inputRef}
        role="combobox"
        type="search"
        value={searchQuery}
      />
      {searchQuery && (
        <button
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          onClick={() => {
            setSearchQuery('');
            setSearchOpen(false);
            setActiveSearchIndex(0);
          }}
          type="button"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Mobile Backdrop — exact AdminLayout match */}
      {mobileOpen && (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      {/* Sidebar — exact 1:1 AdminSidebar styling, dimensions, colors, and collapse behavior */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-blue-950/20 bg-[#1E3A8A] text-white transition-all duration-300 lg:translate-x-0 ${
          collapsed ? 'lg:w-[5.5rem]' : 'lg:w-[17rem]'
        } ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div
          className={`flex min-h-[76px] items-center justify-between gap-2 border-b border-white/10 px-3.5 py-3 ${
            collapsed ? 'lg:min-h-[76px] lg:justify-center lg:gap-1 lg:px-2' : ''
          }`}
        >
          <div className={`flex min-w-0 flex-1 items-center ${collapsed ? 'lg:flex-none' : ''}`}>
            <div
              className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 ${
                collapsed ? 'h-10 w-10 p-1.5' : 'h-[50px] w-full max-w-[195px] px-2.5 py-1.5'
              }`}
            >
              <CompanyLogo className="h-full w-full object-contain" />
            </div>
          </div>

          <button
            aria-label="Close navigation menu"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>

          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white lg:flex ${
              collapsed ? 'lg:hidden' : ''
            }`}
            onClick={() => setCollapsed((c) => !c)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="h-[18px] w-[18px]" />
          </button>

          {collapsed && (
            <button
              aria-label="Expand sidebar"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white lg:flex"
              onClick={() => setCollapsed(false)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        <nav aria-label="Employee navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          <p
            className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/70 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            Workspace
          </p>

          {EMPLOYEE_NAV.map(({ label, to, icon: Icon }) => {
            const isNotification = to === '/employee/notifications';
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition duration-150 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm shadow-blue-950/20 ring-1 ring-inset ring-white/10'
                      : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      aria-hidden="true"
                      className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                      }`}
                      strokeWidth={1.9}
                    />
                    <span className={collapsed ? 'lg:hidden' : 'truncate'}>{label}</span>
                    {!collapsed && isNotification && unreadCount > 0 ? (
                      <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    ) : isActive && !collapsed ? (
                      <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={`border-t border-white/10 p-3 ${collapsed ? 'lg:px-2' : ''}`}>
          <button
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-blue-100/80 transition hover:bg-rose-500/15 hover:text-rose-100 ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            title={collapsed ? 'Logout' : undefined}
            type="button"
          >
            <LogOut
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 text-blue-200 group-hover:text-rose-200"
            />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell — exact AdminLayout padding & transition */}
      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? 'lg:pl-[5.5rem]' : 'lg:pl-[17rem]'
        }`}
      >
        {/* Top Header — exact 1:1 AdminHeader surface, height, controls, search & notifications popover */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-colors duration-200">
          <div className="flex min-h-[76px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Open navigation menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                onClick={() => setMobileOpen(true)}
                type="button"
              >
                <Menu aria-hidden="true" className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                  {currentNav.label === 'Dashboard' ? (
                    <>
                      <span className="sm:hidden">Dashboard</span>
                      <span className="hidden sm:inline">Employee Dashboard</span>
                    </>
                  ) : (
                    currentNav.label
                  )}
                </h1>
                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                  Welcome back, {displayName}
                </p>
              </div>
            </div>

            <div className="hidden min-w-[150px] max-w-[360px] flex-1 px-2 lg:block lg:px-5" data-dashboard-search>
              <div className="relative">
                {renderSearchInput('desktop')}
                {renderSearchSuggestions('desktop')}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <button
                aria-expanded={mobileSearchOpen}
                aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 lg:hidden"
                data-dashboard-search
                onClick={() => {
                  const nextOpen = !mobileSearchOpen;
                  setMobileSearchOpen(nextOpen);
                  setSearchOpen(nextOpen);
                  if (nextOpen) window.setTimeout(() => mobileSearchInputRef.current?.focus(), 0);
                }}
                type="button"
              >
                {mobileSearchOpen ? (
                  <X aria-hidden="true" className="h-[18px] w-[18px]" />
                ) : (
                  <Search aria-hidden="true" className="h-[18px] w-[18px]" />
                )}
              </button>

              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 lg:flex">
                <CalendarDays aria-hidden="true" className="h-4 w-4 text-slate-400" />
                <time>{formattedDate}</time>
              </div>

              <div className="relative" ref={notificationRef}>
                <button
                  aria-expanded={notificationsOpen}
                  aria-label="Notifications"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    notificationsOpen
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  onClick={() => setNotificationsOpen((open) => !open)}
                  type="button"
                >
                  <Bell aria-hidden="true" className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_-20px_rgba(15,23,42,0.28)]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Notifications</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">Recent activity</p>
                      </div>
                      <button
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        onClick={() => setNotificationsOpen(false)}
                        type="button"
                      >
                        <X aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.slice(0, 4).map((notification, idx) => (
                          <button
                            className="flex w-full gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
                            key={notification.id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate(notification.link_url || '/employee/notifications');
                            }}
                            type="button"
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                idx % 3 === 0
                                  ? 'bg-blue-50 text-blue-600'
                                  : idx % 3 === 1
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-violet-50 text-violet-600'
                              }`}
                            >
                              <Bell aria-hidden="true" className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800">{notification.title}</p>
                              <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{notification.message}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-6 text-center text-xs text-slate-500">
                          No recent notifications.
                        </p>
                      )}
                    </div>
                    <div className="flex border-t border-slate-100">
                      <button
                        className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-blue-600 transition hover:bg-slate-50"
                        onClick={handleMarkAllRead}
                        type="button"
                      >
                        <Check aria-hidden="true" className="h-3.5 w-3.5" />
                        Mark all as read
                      </button>
                      <button
                        className="border-l border-slate-100 px-4 py-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/employee/notifications');
                        }}
                        type="button"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <button
                aria-label={`Open profile for ${displayName}`}
                className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:gap-2.5 sm:pr-2"
                onClick={() => navigate('/employee/profile')}
                type="button"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm">
                  {avatarUrl ? (
                    <img alt={displayName} className="h-full w-full object-cover" src={avatarUrl} />
                  ) : (
                    initials
                  )}
                </span>
                <span className="hidden sm:block">
                  <span className="block text-xs font-semibold text-slate-800">{displayName}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                    <Briefcase aria-hidden="true" className="h-3 w-3 text-blue-600" />
                    {designation}
                  </span>
                </span>
              </button>
            </div>
          </div>

          {mobileSearchOpen && (
            <div className="relative border-t border-slate-100 px-3 py-3 lg:hidden" data-dashboard-search>
              <div className="relative">
                {renderSearchInput('mobile', mobileSearchInputRef)}
                {renderSearchSuggestions('mobile')}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 sm:hidden">
            <span>Welcome back, {displayName}</span>
            <span className="mx-1 h-1 w-1 rounded-full bg-slate-300" />
            <time>{formattedDate}</time>
          </div>
        </header>

        {/* Page Container — exact AdminLayout max-width & padding */}
        <main className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
