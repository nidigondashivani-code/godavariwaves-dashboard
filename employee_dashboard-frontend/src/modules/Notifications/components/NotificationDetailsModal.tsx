import React from 'react';
import {
  X,
  Calendar,
  Building2,
  User,
  Shield,
  Clock,
  ExternalLink,
  Check,
} from 'lucide-react';
import { NotificationItem } from '../types/notification.types';

interface NotificationDetailsModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
}) => {
  if (!isOpen || !notification) return null;

  const formattedDate = new Date(notification.timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {notification.category}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  notification.priority === 'critical'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : notification.priority === 'high'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : notification.priority === 'medium'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {notification.priority} Priority
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">{notification.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4 text-xs text-slate-600">
          <p className="text-sm text-slate-800 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {notification.description}
          </p>

          {/* Context Details Grid */}
          <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Reported At</span>
                <span className="font-semibold text-slate-800">{formattedDate}</span>
              </div>
            </div>

            {notification.department && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Department</span>
                  <span className="font-semibold text-slate-800">{notification.department}</span>
                </div>
              </div>
            )}

            {notification.employeeName && (
              <div className="flex items-center gap-2 col-span-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Related Employee</span>
                  <span className="font-semibold text-slate-800">
                    {notification.employeeName}{' '}
                    {notification.employeeId ? `(${notification.employeeId})` : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {!notification.isRead && (
              <button
                type="button"
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark as Read</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
              >
                <span>{notification.actionLabel || 'View Related Module'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;
