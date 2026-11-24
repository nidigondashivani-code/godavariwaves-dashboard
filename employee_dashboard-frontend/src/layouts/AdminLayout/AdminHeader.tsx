import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';
import {
  Bell,
  CalendarDays,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  Check,
  X,
  UsersRound,
  UserCheck,
  UserX,
  Clock3,
  CalendarOff,
  ClipboardList,
  ListTodo,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { adminNavigationItems } from './adminNavigation';
import {
  getAdminInitials,
  readAdminProfile,
  type AdminProfile,
} from '../../modules/Profile/services/adminProfile.service';
import notificationService from '../../modules/Notifications/services/notification.service';
import type { NotificationItem } from '../../modules/Notifications/types/notification.types';

interface AdminHeaderProps {
  onMenuClick: () => void;
  onNavigate: (label: string) => void;
}

interface DashboardSearchResult {
  label: string;
  icon: LucideIcon;
  activeNavigation: string;
  sectionId?: string;
}

const dashboardSearchResults: DashboardSearchResult[] = [
  ...adminNavigationItems.flatMap((item) => {
    const parent: DashboardSearchResult = {
      label: item.label,
      icon: item.icon,
      activeNavigation: item.label,
      ...(item.label === 'Dashboard Overview' ? { sectionId: 'dashboard-overview' } : {}),
      ...(item.label === 'Employee Management' || item.label === 'Attendance' ? { sectionId: 'workforce-overview' } : {}),
      ...(item.label === 'Leave Requests' ? { sectionId: 'pending-requests' } : {}),
    };
    if (item.subItems) {
      const subs: DashboardSearchResult[] = item.subItems.map((sub) => ({
        label: sub.label,
        icon: sub.icon,
        activeNavigation: sub.label,
      }));
      return [parent, ...subs];
    }
    return [parent];
  }),
  { label: 'Total Employees', icon: UsersRound, activeNavigation: 'Employee Management', sectionId: 'module-total-employees' },
  { label: 'Present Today', icon: UserCheck, activeNavigation: 'Attendance', sectionId: 'module-present-today' },
  { label: 'Absent Today', icon: UserX, activeNavigation: 'Attendance', sectionId: 'module-absent-today' },
  { label: 'Late Employees', icon: Clock3, activeNavigation: 'Attendance', sectionId: 'module-late-employees' },
  { label: 'Employees On Leave', icon: CalendarOff, activeNavigation: 'Attendance', sectionId: 'module-employees-on-leave' },
  { label: 'Pending Leave Requests', icon: ClipboardList, activeNavigation: 'Leave Requests', sectionId: 'module-pending-leave-requests' },
  { label: 'Pending Task Updates', icon: ListTodo, activeNavigation: 'Task Updates' },
  { label: 'Upcoming Birthdays', icon: UserRound, activeNavigation: 'Dashboard Overview', sectionId: 'upcoming-birthdays' },
];

const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

function AdminHeader({ onMenuClick, onNavigate }: AdminHeaderProps) {
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(readAdminProfile);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => notificationService.getNotifications());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchMatches = searchQuery.trim()
    ? dashboardSearchResults.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const formattedDate = new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    const handleProfileUpdated = () => setAdminProfile(readAdminProfile());
    window.addEventListener('ems_profile_updated', handleProfileUpdated);
    return () => window.removeEventListener('ems_profile_updated', handleProfileUpdated);
  }, []);

  useEffect(() => notificationService.subscribe(setNotifications), []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !notificationRef.current?.contains(target)) setNotificationsOpen(false);
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

  const selectSearchResult = (result: DashboardSearchResult) => {
    onNavigate(result.activeNavigation);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileSearchOpen(false);

    if (result.sectionId) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const { sectionId } = result;
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      selectSearchResult(searchMatches[activeSearchIndex]);
    } else if (event.key === 'Escape') {
      setSearchOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const renderSearchSuggestions = (variant: 'desktop' | 'mobile') => {
    if (!searchOpen || !searchQuery.trim()) return null;
    const optionId = (index: number) => `dashboard-search-${variant}-option-${index}`;

    return (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-[60] max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.28)]"
        id={`dashboard-search-${variant}-results`}
        role="listbox"
      >
        {searchMatches.length > 0 ? (
          searchMatches.map((result, index) => {
            const Icon = result.icon;
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
                key={result.label}
                onClick={() => selectSearchResult(result)}
                onMouseEnter={() => setActiveSearchIndex(index)}
                role="option"
                type="button"
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="min-w-0 flex-1 truncate">{result.label}</span>
                <span className="text-[10px] text-slate-400">
                  {result.sectionId ? 'Section' : 'Navigation'}
                </span>
              </button>
            );
          })
        ) : (
          <p className="px-3 py-3 text-sm text-slate-500" role="status">
            No results found for “{searchQuery.trim()}”.
          </p>
        )}
      </div>
    );
  };

  const renderSearchInput = (variant: 'desktop' | 'mobile', inputRef?: RefObject<HTMLInputElement | null>) => (
    <>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        aria-activedescendant={searchOpen && searchMatches.length > 0 ? `dashboard-search-${variant}-option-${activeSearchIndex}` : undefined}
        aria-autocomplete="list"
        aria-controls={`dashboard-search-${variant}-results`}
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
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-colors duration-200">
      <div className="flex min-h-[76px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-xl">
              <span className="sm:hidden">Dashboard</span>
              <span className="hidden sm:inline">Admin Dashboard</span>
            </h1>
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">Welcome back, Admin</p>
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
            {mobileSearchOpen ? <X aria-hidden="true" className="h-[18px] w-[18px]" /> : <Search aria-hidden="true" className="h-[18px] w-[18px]" />}
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 lg:flex">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-slate-400" />
            <time>{formattedDate}</time>
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              aria-expanded={notificationsOpen}
              aria-label={`Notifications (${unreadCount} unread)`}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                notificationsOpen
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              onClick={() => {
                setNotificationsOpen((open) => !open);
              }}
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
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        className="rounded-lg px-2 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => notificationService.clearAll()}
                        type="button"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => setNotificationsOpen(false)}
                      type="button"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {notifications.length > 0 ? notifications.slice(0, 6).map((notification) => (
                    <button
                      className={`flex w-full gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 ${
                        notification.isRead ? 'bg-white' : 'bg-blue-50/40'
                      }`}
                      key={notification.id}
                      onClick={() => {
                        notificationService.markAsRead(notification.id);
                        if (notification.actionUrl === '/admin/work-updates') onNavigate('Task Updates');
                        setNotificationsOpen(false);
                      }}
                      type="button"
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        notification.category === 'leave'
                          ? 'bg-amber-50 text-amber-600'
                          : notification.category === 'task'
                            ? 'bg-violet-50 text-violet-600'
                            : 'bg-blue-50 text-blue-600'
                      }`}>
                        <Bell aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-800">{notification.title}</span>
                        <span className="mt-1 block text-[11px] leading-4 text-slate-500">{notification.description}</span>
                        <span className="mt-1 block text-[10px] text-slate-400">{formatNotificationTime(notification.timestamp)}</span>
                      </span>
                    </button>
                  )) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs font-medium text-slate-600">No notifications</p>
                      <p className="mt-1 text-[11px] text-slate-400">You are all caught up.</p>
                    </div>
                  )}
                </div>
                <button
                  className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-blue-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={unreadCount === 0}
                  onClick={() => notificationService.markAllAsRead()}
                  type="button"
                >
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <button
            aria-label={`Open profile settings for ${adminProfile.fullName}`}
            className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:gap-2.5 sm:pr-2"
            onClick={() => onNavigate('Profile & Settings')}
            type="button"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm">
              {adminProfile.avatarUrl ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={adminProfile.avatarUrl}
                />
              ) : (
                getAdminInitials(adminProfile.fullName)
              )}
            </span>
            <span className="hidden sm:block">
              <span className="block text-xs font-semibold text-slate-800">{adminProfile.fullName}</span>
              <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                <ShieldCheck aria-hidden="true" className="h-3 w-3 text-emerald-600" />
                Administrator
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
        <span>Welcome back, Admin</span>
        <span className="mx-1 h-1 w-1 rounded-full bg-slate-300" />
        <time>{formattedDate}</time>
      </div>
    </header>
  );
}

export default AdminHeader;