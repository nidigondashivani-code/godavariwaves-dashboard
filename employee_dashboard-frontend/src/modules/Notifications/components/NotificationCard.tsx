import React from 'react';
import {
  UserPlus,
  Clock,
  Calendar,
  CheckSquare,
  Building2,
  Shield,
  Megaphone,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { NotificationItem, NotificationPriority } from '../types/notification.types';

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (notif: NotificationItem) => void;
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; iconColor: string; iconBg: string; label: string }
> = {
  employee: {
    icon: UserPlus,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    label: 'Employee',
  },
  attendance: {
    icon: Clock,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    label: 'Attendance',
  },
  leave: {
    icon: Calendar,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    label: 'Leave',
  },
  task: {
    icon: CheckSquare,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    label: 'Tasks',
  },
  department: {
    icon: Building2,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    label: 'Departments',
  },
  role: {
    icon: Shield,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    label: 'Role & Perms',
  },
  announcement: {
    icon: Megaphone,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50',
    label: 'Announcement',
  },
};

const PRIORITY_BADGE_STYLE: Record<NotificationPriority, string> = {
  critical: 'bg-red-50 text-red-700 border-red-200 font-bold',
  high: 'bg-orange-50 text-orange-700 border-orange-200 font-bold',
  medium: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
  low: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
};

const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const mins = Math.floor(diffInSeconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onViewDetails,
}) => {
  const categoryConfig = CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG.announcement;
  const Icon = categoryConfig.icon;

  return (
    <div
      className={`p-3.5 transition-all duration-150 border-b border-slate-100 relative group text-left ${
        !notification.isRead
          ? 'bg-blue-50/35 border-l-4 border-l-blue-600'
          : 'bg-white hover:bg-slate-50/70 border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${categoryConfig.iconBg} ${categoryConfig.iconColor}`}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Header Row: Title & Priority */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <h4
              onClick={() => onViewDetails(notification)}
              className={`text-xs truncate cursor-pointer transition ${
                !notification.isRead
                  ? 'font-bold text-slate-900 hover:text-blue-600'
                  : 'font-semibold text-slate-700 hover:text-blue-600'
              }`}
            >
              {notification.title}
            </h4>

            {/* Priority Badge */}
            <span
              className={`text-[9px] uppercase px-1.5 py-0.5 rounded border tracking-wider shrink-0 ${
                PRIORITY_BADGE_STYLE[notification.priority]
              }`}
            >
              {notification.priority}
            </span>
          </div>

          {/* Description */}
          <p
            onClick={() => onViewDetails(notification)}
            className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed cursor-pointer mb-2"
          >
            {notification.description}
          </p>

          {/* Metadata Row: Employee, Dept, Time */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap">
            {notification.employeeName && (
              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                {notification.employeeName}
              </span>
            )}

            {notification.department && (
              <span className="font-medium text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                {notification.department}
              </span>
            )}

            <span>&bull;</span>
            <span className="font-medium text-slate-400">
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>
        </div>

        {/* Actions Tooling */}
        <div className="flex flex-col items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
          {/* Toggle Read/Unread */}
          {!notification.isRead ? (
            <button
              type="button"
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 rounded-md text-blue-600 hover:bg-blue-100/80 transition"
              title="Mark as Read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMarkAsUnread(notification.id)}
              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
              title="Mark as Unread"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          {/* View Details */}
          <button
            type="button"
            onClick={() => onViewDetails(notification)}
            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title="View Details"
          >
            <Eye className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(notification.id)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete notification"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
