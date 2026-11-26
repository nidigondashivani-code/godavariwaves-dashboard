import employeeService from '../../Employee/services/employee.service';
import type { Employee } from '../../Employee/types/employee.types';
import attendanceService from '../../Attendance/services/attendance.service';
import leaveService from '../../LeaveManagement/services/leave.service';
import notificationService from '../../Notifications/services/notification.service';
import { apiClient } from '../../../api/apiClient';
import { getAssetUrl } from '../../../config/env.config';
import type {
  DailyWorkUpdate,
  WorkUpdateAdminRemark,
  WorkUpdateAttachment,
  WorkUpdateAuditEntry,
  WorkUpdateEmployee,
  WorkUpdateRow,
  WorkUpdateStatus,
} from '../types/workUpdate.types';

const UPDATES_KEY = 'ems_daily_work_updates_v3';
const AUDIT_KEY = 'ems_daily_work_update_audit_v3';
const NOTIFICATION_KEYS_KEY = 'ems_daily_work_update_notification_keys_v3';

export interface SubmitDailyWorkUpdateInput {
  employeeKey: string;
  date?: string;
  workSummary: string;
  progressPercentage: number;
  remainingWork?: string;
  challenges?: string;
  comments?: string;
  attachment?: WorkUpdateAttachment;
}

const localDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getEmployeeSnapshot = (employee: Employee): WorkUpdateEmployee => ({
  id: employee.id,
  employeeId: employee.employeeId,
  firstName: employee.firstName,
  lastName: employee.lastName,
  department: employee.department,
  designation: employee.designation,
  companyEmail: employee.companyEmail,
  photoUrl: employee.photoUrl,
});

class WorkUpdateService {
  private listeners = new Set<() => void>();

  private readArray<T>(key: string): T[] {
    try {
      const value = localStorage.getItem(key);
      if (!value) return [];
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (error) {
      console.error(`Unable to read work-update data from ${key}`, error);
      return [];
    }
  }

  private writeArray<T>(key: string, value: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save work-update data to ${key}`, error);
      throw error;
    }
  }

  private recordAudit(entry: Omit<WorkUpdateAuditEntry, 'id' | 'timestamp'>): void {
    const auditEntries = this.readArray<WorkUpdateAuditEntry>(AUDIT_KEY);
    auditEntries.unshift({
      ...entry,
      id: `work-audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    });
    this.writeArray(AUDIT_KEY, auditEntries.slice(0, 1000));
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Sync work updates from live backend MySQL database (via Express /api/v1/work-updates/admin/all)
   */
  public async syncFromBackend(date?: string): Promise<DailyWorkUpdate[]> {
    try {
      const params: Record<string, string> = {};
      if (date) params.workDate = date;
      const res = await apiClient.get('/work-updates/admin/all', { params });
      const rows = res.data?.data;
      if (Array.isArray(rows)) {
        const updates: DailyWorkUpdate[] = rows.map((r: any) => {
          const emp = r.employee || {};
          const nameParts = (emp.full_name || 'Employee').split(' ');
          const firstName = nameParts[0] || 'Employee';
          const lastName = nameParts.slice(1).join(' ') || '';
          const dept = emp.department?.name || 'Software Development';

          let attachment: WorkUpdateAttachment | undefined = undefined;
          if (r.attachment_url) {
            const rawUrl: string = r.attachment_url;
            const parts = rawUrl.split('/');
            const rawFilename = parts[parts.length - 1] || 'Document';
            const cleanName = rawFilename.replace(/^\d+(_\d+)?_/, '') || rawFilename;
            const ext = cleanName.split('.').pop()?.toLowerCase();
            let mimeType = 'application/octet-stream';
            if (ext === 'pdf') mimeType = 'application/pdf';
            else if (ext === 'docx' || ext === 'doc') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            else if (ext === 'xlsx' || ext === 'xls') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

            attachment = {
              name: cleanName,
              mimeType,
              dataUrl: getAssetUrl(rawUrl) || rawUrl,
            };
          }

          return {
            id: String(r.id),
            employeeKey: String(r.employee_id),
            employee: {
              id: String(r.employee_id),
              employeeId: emp.employee_code || `EMP-${r.employee_id}`,
              firstName,
              lastName,
              department: dept,
              designation: 'Software Engineer',
              companyEmail: emp.company_email || '',
              photoUrl: emp.profile_picture ? (getAssetUrl(emp.profile_picture) || undefined) : undefined,
            },
            date: r.work_date,
            workSummary: r.work_description || '',
            progressPercentage: Number(r.progress || 0),
            remainingWork: r.tasks_completed || '',
            challenges: '',
            comments: '',
            attachment,
            attachmentUrl: r.attachment_url || undefined,
            submittedAt: r.createdAt || new Date().toISOString(),
            logoutTime: null,
            status: (r.status || (Number(r.progress || 0) === 100 ? 'Completed' : 'Submitted')) as WorkUpdateStatus,
            adminRemarks: r.admin_feedback
              ? [
                  {
                    id: `remark-db-${r.id}`,
                    text: r.admin_feedback,
                    addedBy: 'Admin',
                    addedAt: r.updatedAt || r.createdAt,
                  },
                ]
              : undefined,
          };
        });

        this.writeArray(UPDATES_KEY, updates);
        this.notifyListeners();
        return this.getUpdates();
      }
    } catch (err) {
      console.warn('Backend work updates sync error:', err);
    }
    return this.getUpdates();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getUpdates(): DailyWorkUpdate[] {
    return this.readArray<DailyWorkUpdate>(UPDATES_KEY).sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt)
    );
  }

  public getEmployeeHistory(employeeKey: string): DailyWorkUpdate[] {
    return this.getUpdates().filter((update) => update.employeeKey === employeeKey);
  }

  public getAuditLog(): WorkUpdateAuditEntry[] {
    return this.readArray<WorkUpdateAuditEntry>(AUDIT_KEY);
  }

  public getRowsForDate(date: string): WorkUpdateRow[] {
    const today = localDateString(new Date());
    const employees = employeeService
      .getEmployees()
      .filter((employee) => employee.joiningDate <= date && (date < today || employee.status === 'Active'));
    const updates = this.getUpdates().filter((update) => update.date === date);
    const employeeByKey = new Map<string, WorkUpdateEmployee>(
      employees.map((employee) => [employee.id, getEmployeeSnapshot(employee)])
    );

    updates.forEach((update) => {
      if (!employeeByKey.has(update.employeeKey)) {
        employeeByKey.set(update.employeeKey, update.employee);
      }
    });

    const approvedLeaves = leaveService
      .getLeaveRequests()
      .filter(
        (request) =>
          request.status === 'Approved' &&
          request.startDate <= date &&
          date <= request.endDate
      );
    const attendanceByEmployee = new Map(
      attendanceService
        .getAttendanceForDate(date)
        .map((row) => [row.employee.id, row])
    );

    return Array.from(employeeByKey.values()).map((employee) => {
      const update = updates.find((entry) => entry.employeeKey === employee.id) ?? null;
      const onLeave = !update && approvedLeaves.some(
        (request) => request.employeeId === employee.employeeId
      );
      const attendance = attendanceByEmployee.get(employee.id);

      return {
        employee,
        date,
        update,
        status: (onLeave
          ? 'On Leave'
          : update
            ? update.progressPercentage === 100
              ? 'Completed'
              : 'Submitted'
            : 'Pending') as WorkUpdateStatus,
        logoutTime: update?.logoutTime ?? attendance?.logoutTime ?? null,
        isWorking: Boolean(attendance?.isOnline),
      };
    }).sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (b.status === 'Pending' && a.status !== 'Pending') return 1;
      return `${a.employee.firstName} ${a.employee.lastName}`.localeCompare(
        `${b.employee.firstName} ${b.employee.lastName}`
      );
    });
  }

  public submitDailyWorkUpdate(input: SubmitDailyWorkUpdateInput): DailyWorkUpdate {
    const employee = employeeService.getEmployeeById(input.employeeKey);
    const date = input.date ?? localDateString(new Date());
    const workSummary = input.workSummary.trim();

    if (!employee || employee.status !== 'Active') {
      throw new Error('Only active employees can submit daily work updates.');
    }
    if (employee.joiningDate > date) {
      throw new Error('The employee was not active on the selected work date.');
    }
    if (!workSummary) {
      throw new Error('Work completed today is required.');
    }
    if (!Number.isInteger(input.progressPercentage) || input.progressPercentage < 0 || input.progressPercentage > 100) {
      throw new Error('Progress percentage must be an integer from 0 to 100.');
    }
    if (input.attachment && input.attachment.dataUrl.length > 3_000_000) {
      throw new Error('The attached file is too large to store.');
    }

    const onApprovedLeave = leaveService.getLeaveRequests().some(
      (request) =>
        request.employeeId === employee.employeeId &&
        request.status === 'Approved' &&
        request.startDate <= date &&
        date <= request.endDate
    );
    if (onApprovedLeave) {
      throw new Error('Employees on approved leave cannot submit a work update.');
    }

    const updates = this.getUpdates();
    if (updates.some((update) => update.employeeKey === employee.id && update.date === date)) {
      throw new Error('A daily work update has already been submitted for this employee and date.');
    }

    const now = new Date();
    const record: DailyWorkUpdate = {
      id: `work-update-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      employeeKey: employee.id,
      employee: getEmployeeSnapshot(employee),
      date,
      workSummary,
      progressPercentage: input.progressPercentage,
      remainingWork: input.remainingWork?.trim() || undefined,
      challenges: input.challenges?.trim() || undefined,
      comments: input.comments?.trim() || undefined,
      attachment: input.attachment,
      submittedAt: now.toISOString(),
      logoutTime: null,
    };

    this.writeArray(UPDATES_KEY, [record, ...updates]);
    this.recordAudit({
      employeeKey: employee.id,
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date,
      action: 'submitted',
      details: 'Daily work update submitted.',
    });

    notificationService.addNotification({
      title: 'Daily Work Update Submitted',
      description: `${employee.firstName} ${employee.lastName} submitted a work update for ${date}.`,
      category: 'task',
      priority: 'medium',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      department: employee.department,
      actionUrl: '/admin/work-updates',
      actionLabel: 'Review Work Update',
    });

    if (date === localDateString(new Date())) this.notifyIfAllSubmitted(date);
    this.notifyListeners();
    return record;
  }

  private notifyIfAllSubmitted(date: string): void {
    const rows = this.getRowsForDate(date).filter((row) => row.status !== 'On Leave');
    if (rows.length === 0 || rows.some((row) => !row.update)) return;

    const notificationKey = `all-updates-submitted:${date}`;
    const sentKeys = new Set(this.readArray<string>(NOTIFICATION_KEYS_KEY));
    if (sentKeys.has(notificationKey)) return;

    notificationService.addNotification({
      title: 'All Daily Work Updates Received',
      description: `All ${rows.length} eligible employees have submitted their work updates for ${date}.`,
      category: 'task',
      priority: 'low',
      actionUrl: '/admin/work-updates',
      actionLabel: 'View Work Updates',
    });
    sentKeys.add(notificationKey);
    this.writeArray(NOTIFICATION_KEYS_KEY, Array.from(sentKeys));
  }

  public canEmployeeLogout(employeeKey: string, date = localDateString(new Date())): boolean {
    return this.getUpdates().some(
      (update) => update.employeeKey === employeeKey && update.date === date
    );
  }

  public recordEmployeeLogout(
    employeeKey: string,
    date = localDateString(new Date()),
    logoutTime = new Date().toTimeString().slice(0, 5)
  ): boolean {
    const employee = employeeService.getEmployeeById(employeeKey);
    const updates = this.getUpdates();
    const update = updates.find(
      (entry) => entry.employeeKey === employeeKey && entry.date === date
    );

    if (!employee || employee.status !== 'Active') return false;
    if (!update) {
      const name = `${employee.firstName} ${employee.lastName}`;
      this.recordAudit({
        employeeKey,
        employeeId: employee.employeeId,
        employeeName: name,
        date,
        action: 'logout-blocked',
        details: 'Logout was blocked because no daily work update was submitted.',
      });
      notificationService.addNotification({
        title: 'Employee Logout Blocked',
        description: `${name} attempted to log out without submitting a daily work update.`,
        category: 'task',
        priority: 'high',
        employeeName: name,
        employeeId: employee.employeeId,
        department: employee.department,
        actionUrl: '/admin/work-updates',
        actionLabel: 'Review Work Updates',
      });
      this.notifyListeners();
      return false;
    }

    const attendanceRecord = attendanceService.recordLogout(employeeKey, date, logoutTime);
    if (!attendanceRecord) return false;

    update.logoutTime = logoutTime;
    this.writeArray(UPDATES_KEY, updates);
    this.recordAudit({
      employeeKey,
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date,
      action: 'logout-recorded',
      details: `Employee logged out at ${logoutTime}.`,
    });
    this.notifyListeners();
    return true;
  }

  public addAdminRemark(updateId: string, remark: string, adminName = 'Admin'): boolean {
    const cleanRemark = remark.trim();
    if (!cleanRemark) throw new Error('Admin remark cannot be empty.');

    const updates = this.getUpdates();
    const update = updates.find((entry) => entry.id === updateId);
    if (!update) return false;

    const newRemark: WorkUpdateAdminRemark = {
      id: `work-remark-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: cleanRemark,
      addedBy: adminName,
      addedAt: new Date().toISOString(),
    };
    update.adminRemarks = [...(update.adminRemarks ?? []), newRemark];
    this.writeArray(UPDATES_KEY, updates);

    // Call backend API if record is numeric ID from MySQL
    const numericId = Number(updateId);
    if (!Number.isNaN(numericId) && numericId > 0) {
      void apiClient
        .patch(`/work-updates/${numericId}/review`, {
          status: 'Approved',
          admin_feedback: cleanRemark,
        })
        .catch((err) => {
          console.warn('Backend work update review sync failed:', err);
        });
    }
    this.recordAudit({
      employeeKey: update.employeeKey,
      employeeId: update.employee.employeeId,
      employeeName: `${update.employee.firstName} ${update.employee.lastName}`,
      date: update.date,
      action: 'admin-remark-added',
      details: 'Admin added a remark to the daily work update.',
    });
    this.notifyListeners();
    return true;
  }
}

export const workUpdateService = new WorkUpdateService();
export default workUpdateService;
