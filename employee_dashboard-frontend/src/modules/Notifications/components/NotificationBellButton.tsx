import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '../services/notification.service';
import NotificationPanel from './NotificationPanel';

export const NotificationBellButton: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(() =>
    notificationService.getUnreadCount()
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let previousCount = notificationService.getUnreadCount();

    const unsubscribe = notificationService.subscribe((notifications) => {
      const newCount = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(newCount);

      // Trigger animation if count increased
      if (newCount > previousCount) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 1200);
        return () => clearTimeout(timer);
      }
      previousCount = newCount;
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        data-notification-trigger="true"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 select-none ${
          isOpen ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-600/20' : ''
        }`}
        title={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell
          className={`w-5 h-5 transition-transform duration-200 ${
            isAnimating ? 'animate-bounce text-blue-600' : ''
          }`}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black leading-none text-white bg-rose-600 rounded-full border-2 border-white shadow-sm transition-transform duration-200 ${
              isAnimating ? 'scale-125' : 'scale-100'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default NotificationBellButton;
