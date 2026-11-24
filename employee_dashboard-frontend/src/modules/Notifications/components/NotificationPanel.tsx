import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Settings,
  Search,
  X,
  Filter,
  RotateCcw,
  BellOff,
  Sparkles,
} from 'lucide-react';
import {
  NotificationCategory,
  NotificationFilterOptions,
  NotificationItem,
  NotificationTab,
  NotificationTimeFilter,
} from '../types/notification.types';
import notificationService from '../services/notification.service';
import NotificationCard from './NotificationCard';
import NotificationDetailsModal from './NotificationDetailsModal';
import NotificationSettingsModal from './NotificationSettingsModal';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<NotificationTimeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | NotificationCategory>('all');
  const [showFilterPills, setShowFilterPills] = useState(false);

  // Modals inside panel
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time notification updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updated) => {
      setNotifications(updated);
    });
    return () => unsubscribe();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-notification-trigger="true"]')
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Counts
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const readCount = useMemo(() => notifications.filter((n) => n.isRead).length, [notifications]);

  // Filtering Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === 'unread' && n.isRead) return false;
      if (activeTab === 'read' && !n.isRead) return false;

      // Category filter
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesDesc = n.description.toLowerCase().includes(query);
        const matchesEmp = n.employeeName?.toLowerCase().includes(query);
        const matchesDept = n.department?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesEmp && !matchesDept) return false;
      }

      // Time filter
      if (timeFilter !== 'all') {
        const notifDate = new Date(n.timestamp);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - 7);

        if (timeFilter === 'today' && notifDate < startOfToday) return false;
        if (
          timeFilter === 'yesterday' &&
          (notifDate < startOfYesterday || notifDate >= startOfToday)
        )
          return false;
        if (timeFilter === 'week' && notifDate < startOfWeek) return false;
      }

      return true;
    });
  }, [notifications, activeTab, categoryFilter, searchQuery, timeFilter]);

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleSimulate = (cat: NotificationCategory) => {
    notificationService.simulateEvent(cat);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={panelRef}
        className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-14 z-50 w-[calc(100vw-1rem)] sm:w-[420px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* 1. Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Real-time enterprise activity alert stream</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="p-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 font-semibold"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Mark Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Tabs */}
        <div className="px-4 pt-2 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'unread'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('read')}
              className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'read'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Read</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {readCount}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFilterPills(!showFilterPills)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              showFilterPills || categoryFilter !== 'all' || timeFilter !== 'all'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
            title="Toggle Filters"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px]">Filter</span>
          </button>
        </div>

        {/* 3. Search & Quick Filters Bar */}
        <div className="p-3 border-b border-slate-100 bg-white space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by title, person, department..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Collapsible Filter Pills */}
          {showFilterPills && (
            <div className="pt-1.5 space-y-2 animate-in fade-in duration-100 text-[11px]">
              {/* Time filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Time:</span>
                {(['all', 'today', 'yesterday', 'week'] as NotificationTimeFilter[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeFilter(t)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition capitalize ${
                      timeFilter === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'all' ? 'All Time' : t}
                  </button>
                ))}
              </div>

              {/* Category filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Channel:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'employee', label: 'Employee' },
                  { id: 'attendance', label: 'Attendance' },
                  { id: 'leave', label: 'Leave' },
                  { id: 'task', label: 'Tasks' },
                  { id: 'department', label: 'Departments' },
                  { id: 'role', label: 'Roles' },
                  { id: 'announcement', label: 'Announcements' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryFilter(c.id as 'all' | NotificationCategory)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${
                      categoryFilter === c.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Notification List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 mb-3 shadow-xs">
                <BellOff className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">No new notifications.</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1 mb-4 leading-relaxed">
                You are all caught up! No alerts match your current tab and filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTimeFilter('all');
                  setCategoryFilter('all');
                  setActiveTab('all');
                  notificationService.resetToDefaultSeed();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Notifications</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={(id) => notificationService.markAsRead(id)}
                onMarkAsUnread={(id) => notificationService.markAsUnread(id)}
                onDelete={(id) => notificationService.deleteNotification(id)}
                onViewDetails={(notif) => setSelectedNotification(notif)}
              />
            ))
          )}
        </div>

        {/* 5. Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">
            Showing <strong>{filteredNotifications.length}</strong> alerts
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => notificationService.clearAll()}
              className="text-[11px] text-slate-400 hover:text-rose-600 transition font-semibold"
            >
              Clear All
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => handleSimulate('attendance')}
              className="text-[11px] text-blue-600 hover:text-blue-800 transition font-bold inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-purple-600" />
              Simulate Alert
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <NotificationDetailsModal
        notification={selectedNotification}
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        onMarkAsRead={(id) => notificationService.markAsRead(id)}
      />

      {/* Settings Modal */}
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSimulate={handleSimulate}
      />
    </>
  );
};

export default NotificationPanel;
