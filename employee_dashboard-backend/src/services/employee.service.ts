import { Op } from 'sequelize';
import sequelize from '../config/db.config';
import {
  User,
  Role,
  Employee,
  Department,
  Designation,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Attendance,
  Task,
  WorkUpdate,
  Announcement,
  CalendarEvent,
  Holiday,
  Notification,
  EmployeeHistory,
  AttendanceCorrection,
  ProfileUpdateRequest,
} from '../models';
import { AppError } from '../utils/appError.util';
import { hashPassword } from '../utils/password.util';
import { generateSecurePassword } from '../helpers/passwordGenerator.helper';
import { getTodayDateString } from '../utils/dateUtils.util';
import auditLogService from './auditLog.service';
import departmentService from './department.service';
import notificationService from './notification.service';

export interface CreateEmployeeDTO {
  employee_code?: string;
  first_name: string;
  last_name: string;
  company_email: string;
  password?: string;
  temporary_password?: string;
  phone?: string;
  department_id?: number | null;
  department_name?: string;
  designation_id?: number | null;
  designation_title?: string;
  reporting_manager_id?: number | null;
  role_id?: number;
  role_name?: string;
  dashboard_access?: 'admin' | 'employee' | 'both';
  dashboard_access_enabled?: boolean;
  joining_date?: string;
  date_of_birth?: string | null;
  employment_type?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern' | string;
  employment_status?: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  gender?: string | null;
  address?: string;
  salary?: number | null;
}

export class EmployeeService {
  public async getMetadata() {
    const [departments, designations, roles, managers] = await Promise.all([
      Department.findAll({ where: { status: 'Active' }, order: [['name', 'ASC']] }),
      Designation.findAll({ where: { status: 'Active' }, order: [['title', 'ASC']] }),
      Role.findAll({ order: [['name', 'ASC']] }),
      Employee.findAll({
        where: { employment_status: 'Active', is_deleted: false },
        attributes: ['id', 'employee_code', 'full_name', 'department_id', 'designation_id'],
        order: [['full_name', 'ASC']],
      }),
    ]);
    return { departments, designations, roles, managers };
  }

  public async listEmployees(filters: {
    search?: string;
    departmentId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const where: Record<string, unknown> = { is_deleted: false };

    if (filters.departmentId) where.department_id = filters.departmentId;
    if (filters.status && filters.status !== 'All') where.employment_status = filters.status;
    if (filters.search) {
      const q = `%${filters.search.trim()}%`;
      where[Op.or as unknown as string] = [
        { full_name: { [Op.like]: q } },
        { company_email: { [Op.like]: q } },
        { employee_code: { [Op.like]: q } },
      ];
    }

    const { rows, count } = await Employee.findAndCountAll({
      where,
      attributes: { exclude: ['salary'] },
      include: [
        { model: Department, as: 'department' },
        { model: Designation, as: 'designation' },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role_id', 'dashboard_access', 'is_active', 'last_login_at'],
          include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
        },
        { model: Employee, as: 'reportingManager', attributes: ['id', 'full_name', 'employee_code'] },
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    return {
      employees: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  public async getEmployeeById(id: number, includeSalary = false) {
    const emp = await Employee.findByPk(id, {
      attributes: includeSalary ? undefined : { exclude: ['salary'] },
      include: [
        { model: Department, as: 'department' },
        { model: Designation, as: 'designation' },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role_id', 'dashboard_access', 'is_active', 'last_login_at'],
          include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
        },
        { model: Employee, as: 'reportingManager', attributes: ['id', 'full_name', 'employee_code'] },
      ],
    });
    if (!emp) throw new AppError('Employee not found.', 404);
    return emp;
  }

  public async createEmployee(dto: CreateEmployeeDTO, adminUserId: number) {
    const email = dto.company_email.trim().toLowerCase();
    const [existingUser, existingEmpEmail] = await Promise.all([
      User.findOne({ where: { email } }),
      Employee.findOne({ where: { company_email: email } }),
    ]);
    if (existingUser || existingEmpEmail) {
      throw new AppError('An account with this company email already exists.', 409);
    }

    // Resolve or generate Employee Code and strictly prevent duplicates
    let employeeCode = dto.employee_code?.trim();
    if (employeeCode) {
      const duplicateCode = await Employee.findOne({ where: { employee_code: employeeCode } });
      if (duplicateCode) {
        throw new AppError(`Employee ID "${employeeCode}" already exists.`, 409);
      }
    } else {
      const employeeCount = await Employee.count();
      employeeCode = `GW-EMP-${1001 + employeeCount + Math.floor(Math.random() * 50)}`;
    }

    // Resolve Department by ID or exact name
    let resolvedDeptId = dto.department_id ?? null;
    if (!resolvedDeptId && dto.department_name?.trim()) {
      const dept = await Department.findOne({ where: { name: dto.department_name.trim() } });
      if (!dept) {
        throw new AppError(`Department "${dto.department_name}" does not exist.`, 400);
      }
      resolvedDeptId = dept.id;
    }

    // Resolve Designation by ID or exact title (within department if provided)
    let resolvedDesigId = dto.designation_id ?? null;
    if (!resolvedDesigId && dto.designation_title?.trim()) {
      const desigWhere: Record<string, unknown> = { title: dto.designation_title.trim() };
      if (resolvedDeptId) desigWhere.department_id = resolvedDeptId;
      let desig = await Designation.findOne({ where: desigWhere });
      if (!desig && resolvedDeptId) {
        desig = await Designation.findOne({ where: { title: dto.designation_title.trim() } });
      }
      if (!desig) {
        throw new AppError(`Designation "${dto.designation_title}" does not exist.`, 400);
      }
      resolvedDesigId = desig.id;
    }

    let role: Role | null = null;
    if (dto.role_id) {
      role = await Role.findByPk(dto.role_id);
    } else if (dto.role_name) {
      role = await Role.findOne({ where: { name: dto.role_name } });
    } else {
      role = await Role.findOne({ where: { name: 'Employee' } });
    }
    if (!role) throw new AppError('Invalid role selected.', 400);

    const rawPassword = (dto.password || dto.temporary_password)?.trim() || generateSecurePassword(12);
    if (rawPassword.length < 6) {
      throw new AppError('Temporary password must be at least 6 characters long.', 400);
    }
    const passwordHash = await hashPassword(rawPassword);

    const empStatus = dto.employment_status || 'Active';
    const isUserActive =
      empStatus === 'Active' && (dto.dashboard_access_enabled !== undefined ? Boolean(dto.dashboard_access_enabled) : true);

    const normalizeEmpType = (raw?: string): 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern' => {
      const v = (raw || '').toLowerCase();
      if (v === 'part-time') return 'Part-Time';
      if (v === 'contract') return 'Contract';
      if (v === 'intern') return 'Intern';
      return 'Full-Time';
    };

    const result = await sequelize.transaction(async (t) => {
      const user = await User.create(
        {
          email,
          password_hash: passwordHash,
          role_id: role!.id,
          dashboard_access: dto.dashboard_access || (role!.name === 'Admin' ? 'both' : 'employee'),
          is_active: isUserActive,
        },
        { transaction: t }
      );

      const fullName = `${dto.first_name.trim()} ${dto.last_name.trim()}`.trim();
      const employee = await Employee.create(
        {
          user_id: user.id,
          employee_code: employeeCode!,
          first_name: dto.first_name.trim(),
          last_name: dto.last_name.trim(),
          full_name: fullName,
          company_email: email,
          phone: dto.phone || null,
          department_id: resolvedDeptId,
          designation_id: resolvedDesigId,
          reporting_manager_id: dto.reporting_manager_id || null,
          date_of_birth: dto.date_of_birth || null,
          joining_date: dto.joining_date || getTodayDateString(),
          employment_type: normalizeEmpType(dto.employment_type),
          employment_status: empStatus,
          gender: dto.gender || null,
          is_deleted: false,
          address: dto.address || null,
          salary: dto.salary ?? null,
        },
        { transaction: t }
      );

      const currentYear = new Date().getFullYear();
      const leaveTypes = await LeaveType.findAll({ where: { is_active: true }, transaction: t });
      for (const lt of leaveTypes) {
        await LeaveBalance.create(
          {
            employee_id: employee.id,
            leave_type_id: lt.id,
            year: currentYear,
            allocated_days: Number(lt.default_days_per_year),
            used_days: 0,
            pending_days: 0,
            remaining_days: Number(lt.default_days_per_year),
          },
          { transaction: t }
        );
      }

      await EmployeeHistory.create(
        {
          employee_id: employee.id,
          event_type: 'Joined',
          title: 'Employee Account Created',
          description: `Onboarded as ${fullName} (${employeeCode}) with ${role!.name} role.`,
          performed_by: adminUserId,
        },
        { transaction: t }
      );

      return { employee, user };
    });

    await auditLogService.log({
      userId: adminUserId,
      action: 'CREATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: result.employee.id,
      newValues: { employee_code: result.employee.employee_code, email },
    });

    const fullEmp = await this.getEmployeeById(result.employee.id);
    return {
      employee: fullEmp,
      generatedCredentials: {
        email,
        temporaryPassword: rawPassword,
      },
    };
  }

  public async updateEmployee(id: number, updates: Partial<CreateEmployeeDTO> & { is_active?: boolean }, adminUserId: number) {
    const emp = await Employee.findByPk(id, { include: [{ model: User, as: 'user' }] });
    if (!emp) throw new AppError('Employee not found.', 404);

    const oldSnapshot = emp.toJSON();
    if (updates.first_name !== undefined) emp.first_name = updates.first_name.trim();
    if (updates.last_name !== undefined) emp.last_name = updates.last_name.trim();
    emp.full_name = `${emp.first_name} ${emp.last_name}`.trim();
    if (updates.phone !== undefined) emp.phone = updates.phone;
    if (updates.department_id !== undefined) emp.department_id = updates.department_id;
    if (updates.designation_id !== undefined) emp.designation_id = updates.designation_id;
    if (updates.reporting_manager_id !== undefined) emp.reporting_manager_id = updates.reporting_manager_id;
    if (updates.employment_type !== undefined) {
      const v = String(updates.employment_type).toLowerCase();
      emp.employment_type =
        v === 'part-time' ? 'Part-Time' : v === 'contract' ? 'Contract' : v === 'intern' ? 'Intern' : 'Full-Time';
    }
    if (updates.employment_status !== undefined) emp.employment_status = updates.employment_status;
    if (updates.joining_date !== undefined) emp.joining_date = updates.joining_date;
    if (updates.date_of_birth !== undefined) emp.date_of_birth = updates.date_of_birth;
    if (updates.address !== undefined) emp.address = updates.address;

    await emp.save();

    const user = await User.findByPk(emp.user_id);
    if (user) {
      if (updates.role_id !== undefined) user.role_id = updates.role_id;
      if (updates.dashboard_access !== undefined) user.dashboard_access = updates.dashboard_access;
      if (updates.is_active !== undefined) user.is_active = updates.is_active;
      if (updates.password && updates.password.trim().length >= 6) {
        user.password_hash = await hashPassword(updates.password.trim());
      }
      await user.save();
    }

    await auditLogService.log({
      userId: adminUserId,
      action: 'UPDATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: emp.id,
      oldValues: { department_id: oldSnapshot.department_id, designation_id: oldSnapshot.designation_id, status: oldSnapshot.employment_status },
      newValues: { department_id: emp.department_id, designation_id: emp.designation_id, status: emp.employment_status },
    });

    return this.getEmployeeById(emp.id);
  }

  public async activateEmployee(id: number, adminUserId: number) {
    const emp = await Employee.findOne({ where: { id, is_deleted: false } });
    if (!emp) throw new AppError('Employee not found.', 404);

    emp.employment_status = 'Active';
    emp.inactivity_reason = null;
    await emp.save();

    await User.update(
      { is_active: true },
      { where: { id: emp.user_id } }
    );

    await EmployeeHistory.create({
      employee_id: emp.id,
      event_type: 'StatusChanged',
      title: 'Employee Account Activated',
      description: 'Active status and dashboard login restored by Admin.',
      new_value: 'Active',
      performed_by: adminUserId,
    });

    await notificationService.notifyEmployee(
      emp.id,
      'System',
      'Account Activated',
      'Your employee account has been activated.',
      '/employee/dashboard'
    );

    await auditLogService.log({
      userId: adminUserId,
      action: 'ACTIVATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: emp.id,
    });

    return this.getEmployeeById(emp.id);
  }

  public async deactivateEmployee(id: number, reason: string, adminUserId: number) {
    const emp = await Employee.findOne({ where: { id, is_deleted: false } });
    if (!emp) throw new AppError('Employee not found.', 404);

    emp.employment_status = 'Inactive';
    emp.inactivity_reason = reason?.trim() || 'Deactivated';
    await emp.save();

    await User.update(
      { is_active: false, refresh_token_hash: null },
      { where: { id: emp.user_id } }
    );

    // Automatic business rule: remove deactivated employee from Department Team Leads
    await departmentService.purgeTeamLeadForEmployee(emp.id);

    await EmployeeHistory.create({
      employee_id: emp.id,
      event_type: 'StatusChanged',
      title: 'Employee Account Deactivated',
      description: `Deactivated (${emp.inactivity_reason}). Active team lead assignments revoked.`,
      new_value: 'Inactive',
      performed_by: adminUserId,
    });

    await auditLogService.log({
      userId: adminUserId,
      action: 'DEACTIVATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: emp.id,
      newValues: { reason: emp.inactivity_reason },
    });

    return this.getEmployeeById(emp.id);
  }

  public async toggleDashboardAccess(id: number, enabled: boolean, adminUserId: number) {
    const emp = await Employee.findOne({ where: { id, is_deleted: false } });
    if (!emp) throw new AppError('Employee not found.', 404);

    const user = await User.findByPk(emp.user_id);
    if (!user) throw new AppError('Associated user account not found.', 404);

    user.is_active = Boolean(enabled);
    if (!enabled) user.refresh_token_hash = null;
    await user.save();

    await auditLogService.log({
      userId: adminUserId,
      action: enabled ? 'GRANT_DASHBOARD_ACCESS' : 'REVOKE_DASHBOARD_ACCESS',
      entityType: 'Employee',
      entityId: emp.id,
      newValues: { dashboardAccessEnabled: Boolean(enabled) },
    });

    return this.getEmployeeById(emp.id);
  }

  public async resetEmployeePassword(id: number, newPassword: string | undefined, adminUserId: number) {
    const emp = await Employee.findOne({ where: { id, is_deleted: false } });
    if (!emp) throw new AppError('Employee not found.', 404);

    const rawPassword = newPassword?.trim() || generateSecurePassword(12);
    if (rawPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400);
    }

    await User.update(
      { password_hash: await hashPassword(rawPassword), refresh_token_hash: null },
      { where: { id: emp.user_id } }
    );

    await auditLogService.log({
      userId: adminUserId,
      action: 'RESET_EMPLOYEE_PASSWORD',
      entityType: 'Employee',
      entityId: emp.id,
    });

    return {
      employeeId: emp.id,
      email: emp.company_email,
      temporaryPassword: rawPassword,
    };
  }

  public async softDeleteEmployee(id: number, adminUserId: number) {
    const emp = await Employee.findOne({ where: { id, is_deleted: false } });
    if (!emp) throw new AppError('Employee not found.', 404);

    emp.is_deleted = true;
    emp.deleted_at = new Date();
    emp.employment_status = 'Terminated';
    await emp.save();

    await User.update(
      { is_active: false, refresh_token_hash: null },
      { where: { id: emp.user_id } }
    );
    await departmentService.purgeTeamLeadForEmployee(emp.id);

    await auditLogService.log({
      userId: adminUserId,
      action: 'SOFT_DELETE_EMPLOYEE',
      entityType: 'Employee',
      entityId: emp.id,
    });

    return { deleted: true, employeeId: emp.id };
  }

  public async bulkAction(
    ids: number[],
    action: 'activate' | 'deactivate' | 'delete' | 'enableAccess' | 'disableAccess',
    adminUserId: number,
    reason?: string
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('At least one employee ID is required for bulk actions.', 400);
    }
    const processed: number[] = [];
    for (const empId of ids) {
      if (action === 'activate') await this.activateEmployee(empId, adminUserId);
      else if (action === 'deactivate') await this.deactivateEmployee(empId, reason || 'Deactivated', adminUserId);
      else if (action === 'delete') await this.softDeleteEmployee(empId, adminUserId);
      else if (action === 'enableAccess') await this.toggleDashboardAccess(empId, true, adminUserId);
      else if (action === 'disableAccess') await this.toggleDashboardAccess(empId, false, adminUserId);
      else throw new AppError(`Unsupported bulk action: ${action}`, 400);
      processed.push(empId);
    }
    return { action, processedCount: processed.length, processedIds: processed };
  }

  public async getEmployeeDashboardOverview(employeeId: number, userId: number) {
    const today = getTodayDateString();
    const currentYear = new Date().getFullYear();

    const employee = await this.getEmployeeById(employeeId);

    const [
      todayAttendance,
      leaveBalances,
      pendingLeavesCount,
      tasks,
      pendingWorkUpdatesCount,
      recentWorkUpdates,
      announcements,
      upcomingHolidays,
      upcomingEvents,
      recentNotifications,
      unreadNotificationsCount,
      birthdays,
    ] = await Promise.all([
      Attendance.findOne({ where: { employee_id: employeeId, date: today } }),
      LeaveBalance.findAll({
        where: { employee_id: employeeId, year: currentYear },
        include: [{ model: LeaveType, as: 'leaveType' }],
      }),
      LeaveRequest.count({ where: { employee_id: employeeId, status: 'Pending' } }),
      Task.findAll({
        where: { assigned_to: employeeId },
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        order: [['due_date', 'ASC']],
      }),
      WorkUpdate.count({
        where: { employee_id: employeeId, status: { [Op.in]: ['Pending Review', 'Revision Required'] } },
      }),
      WorkUpdate.findAll({
        where: { employee_id: employeeId },
        order: [['work_date', 'DESC']],
        limit: 5,
      }),
      Announcement.findAll({
        where: {
          status: 'Published',
          [Op.or]: [
            { target_audience: 'All' },
            ...(employee.department_id ? [{ target_audience: 'Department', department_id: employee.department_id }] : []),
          ],
        },
        order: [['published_at', 'DESC']],
        limit: 5,
      }).catch(() => []),
      Holiday.findAll({
        where: { date: { [Op.gte]: today } },
        order: [['date', 'ASC']],
        limit: 5,
      }),
      CalendarEvent.findAll({
        where: {
          end_date: { [Op.gte]: today },
          [Op.or]: [
            { department_id: null },
            ...(employee.department_id ? [{ department_id: employee.department_id }] : []),
          ],
        },
        order: [['start_date', 'ASC']],
        limit: 5,
      }).catch(() => []),
      Notification.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
        limit: 6,
      }),
      Notification.count({ where: { user_id: userId, is_read: false } }),
      Employee.findAll({
        where: { employment_status: 'Active', date_of_birth: { [Op.ne]: null } },
        attributes: ['id', 'full_name', 'date_of_birth'],
        limit: 10,
      }),
    ]);

    const pendingTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress');
    const completedTasks = tasks.filter((t) => t.status === 'Completed');
    const totalLeaveBalance = leaveBalances.reduce((sum, lb) => sum + Number(lb.remaining_days || 0), 0);

    // Combine upcoming events (Holidays + Calendar Events + Birthdays this month)
    const currentMonth = new Date().getMonth() + 1;
    const birthdayEvents = birthdays
      .filter((b) => b.date_of_birth && parseInt(b.date_of_birth.split('-')[1], 10) === currentMonth)
      .map((b) => ({
        id: `bday-${b.id}`,
        title: `${b.full_name}'s Birthday`,
        type: 'Birthday',
        date: `${currentYear}-${b.date_of_birth!.slice(5)}`,
        description: 'Employee Birthday',
      }));

    const combinedUpcomingEvents = [
      ...upcomingHolidays.map((h) => ({
        id: `hol-${h.id}`,
        title: h.name,
        type: 'Holiday',
        date: h.date,
        description: h.description || `${h.type} Holiday`,
      })),
      ...upcomingEvents.map((e) => ({
        id: `ev-${e.id}`,
        title: e.title,
        type: e.event_type,
        date: e.start_date,
        description: e.description || e.location || '',
      })),
      ...birthdayEvents,
    ]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);

    return {
      employee,
      today,
      summary: {
        todayAttendanceStatus: todayAttendance?.status || 'Not Clocked In',
        workingHours: Number(todayAttendance?.working_hours || 0),
        totalLeaveBalance,
        pendingTasksCount: pendingTasks.length,
        completedTasksCount: completedTasks.length,
        pendingWorkUpdatesCount,
      },
      todayAttendance,
      todayTasks: pendingTasks.slice(0, 6),
      leaveOverview: {
        balances: leaveBalances,
        pendingRequestsCount: pendingLeavesCount,
      },
      announcements,
      upcomingEvents: combinedUpcomingEvents,
      notifications: {
        items: recentNotifications,
        unreadCount: unreadNotificationsCount,
      },
      recentWorkUpdates,
    };
  }

  public async getAdminDashboardOverview() {
    const today = getTodayDateString();
    const [
      totalEmployees,
      activeEmployees,
      presentToday,
      lateToday,
      onLeaveToday,
      pendingLeaves,
      pendingCorrections,
      pendingWorkUpdates,
      pendingProfileRequests,
      totalTasks,
      completedTasks,
      recentEmployees,
      recentLeaves,
      todayHoliday,
      recentAnnouncements,
      employeesWithDob,
    ] = await Promise.all([
      Employee.count({ where: { is_deleted: false } }),
      Employee.count({ where: { employment_status: 'Active', is_deleted: false } }),
      Attendance.count({ where: { date: today, status: { [Op.in]: ['Present', 'Late', 'Half Day'] } } }),
      Attendance.count({ where: { date: today, status: 'Late' } }),
      Attendance.count({ where: { date: today, status: 'On Leave' } }),
      LeaveRequest.count({ where: { status: 'Pending' } }),
      AttendanceCorrection.count({ where: { status: 'Pending' } }),
      WorkUpdate.count({ where: { status: 'Pending Review' } }),
      ProfileUpdateRequest.count({ where: { status: 'Pending' } }),
      Task.count(),
      Task.count({ where: { status: 'Completed' } }),
      Employee.findAll({
        where: { is_deleted: false },
        attributes: { exclude: ['salary'] },
        include: [
          { model: Department, as: 'department', attributes: ['id', 'name'] },
          { model: Designation, as: 'designation', attributes: ['id', 'title'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      LeaveRequest.findAll({
        where: { status: 'Pending' },
        include: [
          { model: Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] },
          { model: LeaveType, as: 'leaveType', attributes: ['id', 'name', 'code'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      Holiday.findOne({ where: { date: today } }),
      Announcement.findAll({
        where: { status: 'Published' },
        order: [['published_at', 'DESC']],
        limit: 5,
      }).catch(() => []),
      Employee.findAll({
        where: { employment_status: 'Active', is_deleted: false, date_of_birth: { [Op.ne]: null } },
        attributes: ['id', 'full_name', 'date_of_birth'],
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        limit: 20,
      }),
    ]);

    const absentToday = Math.max(0, activeEmployees - presentToday - onLeaveToday);

    return {
      stats: {
        totalEmployees,
        activeEmployees,
        presentToday,
        absentToday,
        lateToday,
        employeesOnLeave: onLeaveToday,
        pendingLeaves,
        pendingCorrections,
        pendingWorkUpdates,
        pendingProfileRequests,
        totalTasks,
        completedTasks,
      },
      todayHoliday,
      recentAnnouncements,
      upcomingBirthdays: employeesWithDob,
      recentEmployees,
      pendingLeaveRequests: recentLeaves,
    };
  }
}

export default new EmployeeService();
