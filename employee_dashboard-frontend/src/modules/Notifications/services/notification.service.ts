/**
 * Notification Center - Service & Reactive Store
 * Manages notification state, persistence, subscriptions, and alert preferences.
 */

import {
  NotificationItem,
  NotificationSettings,
} from '../types/notification.types';

const STORAGE_KEY = 'ems_notifications_clean_v3';
const SETTINGS_KEY = 'ems_notifications_settings_v1';
const LEGACY_SIMULATED_NOTIFICATION_TITLES = new Set([
  'New Employee Profile Created',
  'Employee Checked In: On-Time',
  'Sick Leave Request Submitted',
  'Task Assigned: Q4 Marketing Campaign',
  'Department Scope Updated: Sales Pipeline',
  'Security Audit: Admin Role Verified',
  'Company Notice: Year-End Performance Appraisals',
]);

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  categories: {
    employee: true,
    attendance: true,
    leave: true,
    task: true,
    department: true,
    role: true,
    announcement: true,
  },
};

class NotificationService {
  private notifications: NotificationItem[] = [];
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private listeners: Array<(notifications: NotificationItem[]) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      localStorage.removeItem('ems_notifications_v1');
      localStorage.removeItem('ems_notifications_clean_v1');
      localStorage.removeItem('ems_notifications_simulated_v1');
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      const notifications = Array.isArray(parsed) ? (parsed as NotificationItem[]) : [];
      this.notifications = notifications.filter(
        (notification) =>
          notification && !LEGACY_SIMULATED_NOTIFICATION_TITLES.has(notification.title)
      );
      if (!stored || this.notifications.length !== notifications.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
      }

      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      this.notifications = [];
      this.settings = DEFAULT_SETTINGS;
      console.error('Failed to load notifications from storage', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save notifications to storage', e);
    }
  }

  private notifyListeners(): void {
    const list = [...this.notifications];
    this.listeners.forEach((fn) => fn(list));
  }

  /**
   * Synthesize audio chime for incoming notification using Web Audio API
   */
  public playNotificationChime(): void {
    if (!this.settings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy catch
    }
  }

  public subscribe(listener: (notifications: NotificationItem[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.notifications]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public addNotification(
    item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>
  ): NotificationItem {
    // Check if category is enabled in settings
    if (!this.settings.categories[item.category]) {
      // Still store, or optionally ignore
    }

    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.notifications = [newNotif, ...this.notifications];
    this.saveToStorage();
    this.notifyListeners();
    this.playNotificationChime();

    return newNotif;
  }

  public markAsRead(id: string): void {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notifications[idx] = { ...this.notifications[idx], isRead: true };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public markAsUnread(id: string): void {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notifications[idx] = { ...this.notifications[idx], isRead: false };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public markAllAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.saveToStorage();
    this.notifyListeners();
  }

  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearAll(): void {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveToStorage();
  }

}

export const notificationService = new NotificationService();
export default notificationService;
