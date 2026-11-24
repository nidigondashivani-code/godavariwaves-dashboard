/**
 * Notification Center - Service & Reactive Store
 * Manages notification state, persistence, event subscriptions, and simulation.
 */

import {
  NotificationCategory,
  NotificationItem,
  NotificationPriority,
  NotificationSettings,
} from '../types/notification.types';

const STORAGE_KEY = 'ems_notifications_v1';
const SETTINGS_KEY = 'ems_notifications_settings_v1';

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

// Seed notifications representing a live enterprise HRMS
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Emergency Leave Requested',
    description: 'Rahul Sharma submitted an emergency personal medical leave request for 2 days starting tomorrow.',
    category: 'leave',
    priority: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    isRead: false,
    employeeName: 'Rahul Sharma',
    employeeId: 'EMP-002',
    department: 'Software Development',
    actionUrl: '#employees',
    actionLabel: 'Review Request',
  },
  {
    id: 'notif-2',
    title: 'Task Overdue: Cloud Architecture Audit',
    description: 'Platform Security Review sprint task assigned to Software Development team is 24 hours overdue.',
    category: 'task',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    isRead: false,
    employeeName: 'Sarah Jenkins',
    employeeId: 'EMP-001',
    department: 'Software Development',
    actionUrl: '#employees',
    actionLabel: 'View Task Matrix',
  },
  {
    id: 'notif-3',
    title: 'New Employee Onboarded',
    description: 'Chloe Bennett was successfully onboarded as Office Executive with company email and dashboard access.',
    category: 'employee',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    isRead: false,
    employeeName: 'Chloe Bennett',
    employeeId: 'EMP-012',
    department: 'Administration',
    actionUrl: '#employees',
    actionLabel: 'View Profile',
  },
  {
    id: 'notif-4',
    title: 'Late Arrival Recorded: Post 10:00 AM',
    description: 'Sai Kumar checked in at 10:28 AM today. Standard shift reporting threshold is 09:30 AM.',
    category: 'attendance',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    isRead: false,
    employeeName: 'Sai Kumar',
    employeeId: 'EMP-003',
    department: 'Software Development',
    actionUrl: '#employees',
    actionLabel: 'Attendance Log',
  },
  {
    id: 'notif-5',
    title: 'Team Lead Appointed',
    description: 'Deepak Reddy was designated as DevOps & Infrastructure Lead for Software Development.',
    category: 'department',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    isRead: false,
    employeeName: 'Deepak Reddy',
    employeeId: 'EMP-005',
    department: 'Software Development',
    actionUrl: '#employees',
    actionLabel: 'View Team Members',
  },
  {
    id: 'notif-6',
    title: 'Security Permission Updated',
    description: 'Admin modified module permissions for Employee role: Attendance export privileges updated.',
    category: 'role',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    isRead: true,
    department: 'Administration',
    actionUrl: '#roles',
    actionLabel: 'Inspect Matrix',
  },
  {
    id: 'notif-7',
    title: 'Company All-Hands Meeting Scheduled',
    description: 'Q4 Product Roadmap & Executive Briefing scheduled for Friday at 04:00 PM in Main Conference / Zoom.',
    category: 'announcement',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // Yesterday
    isRead: true,
    department: 'Administration',
  },
  {
    id: 'notif-8',
    title: 'Casual Leave Approved',
    description: 'Jessica Taylor casual leave request for November 28th has been approved by Marcus Sterling.',
    category: 'leave',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
    employeeName: 'Jessica Taylor',
    employeeId: 'EMP-008',
    department: 'Sales',
  },
  {
    id: 'notif-9',
    title: 'Daily Work Update Submitted',
    description: 'Arjun Verma completed frontend sprint tickets for interactive dashboard summary cards.',
    category: 'task',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 2 days ago
    isRead: true,
    employeeName: 'Arjun Verma',
    employeeId: 'EMP-005',
    department: 'Software Development',
  },
  {
    id: 'notif-10',
    title: 'Upcoming Birthday: Emily Davis',
    description: 'Emily Davis in Digital Marketing turns a year older this Thursday! Send birthday wishes.',
    category: 'announcement',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    isRead: true,
    employeeName: 'Emily Davis',
    employeeId: 'EMP-006',
    department: 'Digital Marketing',
  },
];

class NotificationService {
  private notifications: NotificationItem[] = [];
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private listeners: Array<(notifications: NotificationItem[]) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.saveToStorage();
      }

      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch {
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.settings = DEFAULT_SETTINGS;
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

  public resetToDefaultSeed(): void {
    this.notifications = [...INITIAL_NOTIFICATIONS];
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

  /**
   * Helper to simulate real-time notification events for demo & testing
   */
  public simulateEvent(category: NotificationCategory): NotificationItem {
    const events: Record<
      NotificationCategory,
      Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>
    > = {
      employee: {
        title: 'New Employee Profile Created',
        description: 'New personnel record added for Engineering division. Credentials generated automatically.',
        category: 'employee',
        priority: 'medium',
        employeeName: 'Kavya Raman',
        department: 'Software Development',
        actionUrl: '#employees',
        actionLabel: 'View Directory',
      },
      attendance: {
        title: 'Employee Checked In: On-Time',
        description: 'Sarah Jenkins clocked in at 09:14 AM from Springfield remote workstation.',
        category: 'attendance',
        priority: 'low',
        employeeName: 'Sarah Jenkins',
        employeeId: 'EMP-001',
        department: 'Software Development',
      },
      leave: {
        title: 'Sick Leave Request Submitted',
        description: 'Emily Davis submitted a sick leave request for 1 day due to seasonal illness.',
        category: 'leave',
        priority: 'high',
        employeeName: 'Emily Davis',
        employeeId: 'EMP-006',
        department: 'Digital Marketing',
        actionUrl: '#employees',
        actionLabel: 'Review Leave',
      },
      task: {
        title: 'Task Assigned: Q4 Marketing Campaign',
        description: 'Alex Morgan assigned 3 new creative design deliverables for Godavari Wave website revamp.',
        category: 'task',
        priority: 'medium',
        employeeName: 'Alex Morgan',
        employeeId: 'EMP-009',
        department: 'Digital Marketing',
      },
      department: {
        title: 'Department Scope Updated: Sales Pipeline',
        description: 'Enterprise Sales targets revised to 14 revenue pipelines for Q1 FY27.',
        category: 'department',
        priority: 'low',
        department: 'Sales',
        actionUrl: '#employees',
        actionLabel: 'Inspect Directory',
      },
      role: {
        title: 'Security Audit: Admin Role Verified',
        description: 'Automated role access verification completed. 104 security permissions active.',
        category: 'role',
        priority: 'low',
        department: 'Administration',
        actionUrl: '#roles',
      },
      announcement: {
        title: 'Company Notice: Year-End Performance Appraisals',
        description: 'Annual performance evaluations begin next Monday across all 4 core departments.',
        category: 'announcement',
        priority: 'medium',
        department: 'Administration',
      },
    };

    return this.addNotification(events[category]);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
