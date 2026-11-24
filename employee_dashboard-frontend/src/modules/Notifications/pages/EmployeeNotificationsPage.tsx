import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Check } from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import {
  PageTransition,
  Card,
  Button,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
} from '../../../components/common/UI';
import { NotificationItem } from '../../../types/user.types';

export const EmployeeNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterRead, setFilterRead] = useState<'all' | 'unread'>('all');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filterRead === 'unread') params.set('isRead', 'false');
      if (category !== 'All') params.set('category', category);
      const res = await apiClient.get(`/notifications?${params.toString()}`);
      setItems(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
      window.dispatchEvent(new Event('gw:notifications-updated'));
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [filterRead, category, showToast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (id: number) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      showToast('All notifications marked as read.', 'success');
      await loadNotifications();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading notification center..." />;

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">
            Notification Center
          </h1>
          <p className="text-[14px] text-[#6B7280]">
            Real-time alerts for leave decisions, task assignments, work update feedback, and announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-[12px] border border-[#E5E7EB]">
          <button
            onClick={() => setFilterRead('all')}
            className={`px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold ${
              filterRead === 'all' ? 'bg-[#2563EB] text-white' : 'text-[#6B7280]'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilterRead('unread')}
            className={`px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold ${
              filterRead === 'unread' ? 'bg-[#2563EB] text-white' : 'text-[#6B7280]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="gw-input w-auto min-w-[180px]"
        >
          <option value="All">All Categories</option>
          <option value="Attendance">Attendance</option>
          <option value="AttendanceCorrection">Attendance Correction</option>
          <option value="Leave">Leave</option>
          <option value="Task">Tasks</option>
          <option value="WorkUpdate">Work Updates</option>
          <option value="Announcement">Announcements</option>
          <option value="Profile">Profile</option>
        </select>
      </Card>

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-7 h-7" />}
            title="No Notifications"
            description="You're completely up to date."
          />
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {items.map((n) => (
              <div
                key={n.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  n.is_read ? 'bg-white' : 'bg-[#EFF6FF]'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                    <StatusBadge status={n.category} />
                    <span className="text-[12px] text-[#9CA3AF]">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">{n.title}</h3>
                  <p className="text-[13px] text-[#374151]">{n.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.link_url && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (!n.is_read) markRead(n.id);
                        navigate(n.link_url!);
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </Button>
                  )}
                  {!n.is_read && (
                    <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                      <Check className="w-4 h-4" /> Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageTransition>
  );
};

export default EmployeeNotificationsPage;
