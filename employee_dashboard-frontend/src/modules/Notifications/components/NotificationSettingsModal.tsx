import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Bell,
  UserPlus,
  Clock,
  Calendar,
  CheckSquare,
  Building2,
  Shield,
  Megaphone,
} from 'lucide-react';
import { NotificationCategory, NotificationSettings } from '../types/notification.types';
import notificationService from '../services/notification.service';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    notificationService.getSettings()
  );

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    notificationService.updateSettings(updated);
  };

  const handleToggleCategory = (category: NotificationCategory) => {
    const updated = {
      ...settings,
      categories: {
        ...settings.categories,
        [category]: !settings.categories[category],
      },
    };
    setSettings(updated);
    notificationService.updateSettings(updated);
  };

  const categories: Array<{ id: NotificationCategory; label: string; icon: React.ElementType }> = [
    { id: 'employee', label: 'Employee Management', icon: UserPlus },
    { id: 'attendance', label: 'Attendance & Time Tracking', icon: Clock },
    { id: 'leave', label: 'Leave & Absences', icon: Calendar },
    { id: 'task', label: 'Tasks & Projects', icon: CheckSquare },
    { id: 'department', label: 'Departments & Hierarchy', icon: Building2 },
    { id: 'role', label: 'Roles & Security Policies', icon: Shield },
    { id: 'announcement', label: 'Corporate Announcements', icon: Megaphone },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notification Settings</h3>
              <p className="text-xs text-slate-400">Configure alert preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Sound Notification Alert */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <span className="font-bold text-slate-900 block">Sound Alerts</span>
                <span className="text-[11px] text-slate-500">
                  Play subtle chime on incoming notifications
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                  settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Subscribed Channels */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-2">
              Notification Channels
            </h4>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {categories.map((c) => {
                const Icon = c.icon;
                const isEnabled = settings.categories[c.id];

                return (
                  <div
                    key={c.id}
                    onClick={() => handleToggleCategory(c.id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-800 font-medium">{c.label}</span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
