import { Op } from 'sequelize';
import {
  Task,
  TaskAssignment,
  TaskUpdate,
  Employee,
  Department,
  User,
  EmployeeHistory,
} from '../models';
import { AppError } from '../utils/appError.util';
import { getTodayDateString } from '../utils/dateUtils.util';
import notificationService from './notification.service';
import auditLogService from './auditLog.service';

export class TaskService {
  public async createTask(
    adminUserId: number,
    dto: {
      title: string;
      description?: string;
      assigned_to: number;
      department_id?: number | null;
      priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
      due_date: string;
      assigned_date?: string;
      attachments?: string[];
    }
  ) {
    if (!dto.title?.trim() || !dto.assigned_to || !dto.due_date) {
      throw new AppError('Task title, assignee, and due date are required.', 400);
    }

    const assignee = await Employee.findByPk(dto.assigned_to);
    if (!assignee) throw new AppError('Assigned employee not found.', 404);

    const task = await Task.create({
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      department_id: dto.department_id ?? assignee.department_id ?? null,
      assigned_by: adminUserId,
      assigned_to: assignee.id,
      priority: dto.priority || 'Medium',
      status: 'Pending',
      progress: 0,
      assigned_date: dto.assigned_date || getTodayDateString(),
      due_date: dto.due_date,
      attachments: dto.attachments ? JSON.stringify(dto.attachments) : '[]',
    });

    await TaskAssignment.create({
      task_id: task.id,
      employee_id: assignee.id,
      assigned_by: adminUserId,
      assigned_at: new Date(),
    });

    await notificationService.notifyEmployee(
      assignee.id,
      'Task',
      'New Task Assigned',
      `You have been assigned "${task.title}" (Priority: ${task.priority}, Due: ${task.due_date}).`,
      '/employee/tasks'
    );

    await auditLogService.log({
      userId: adminUserId,
      action: 'ASSIGN_TASK',
      entityType: 'Task',
      entityId: task.id,
      newValues: { title: task.title, assignedTo: assignee.id, dueDate: task.due_date },
    });

    return this.getTaskById(task.id);
  }

  public async getTaskById(id: number) {
    const task = await Task.findByPk(id, {
      include: [
        { model: Employee, as: 'assignee', attributes: ['id', 'employee_code', 'full_name', 'department_id'] },
        { model: User, as: 'assigner', attributes: ['id', 'email'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        {
          model: TaskUpdate,
          as: 'updates',
          include: [{ model: Employee, as: 'employee', attributes: ['id', 'full_name'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    if (!task) throw new AppError('Task not found.', 404);
    return task;
  }

  public async getMyTasks(employeeId: number, filters: { status?: string; priority?: string; search?: string }) {
    const where: Record<string, unknown> = { assigned_to: employeeId };
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.priority && filters.priority !== 'All') where.priority = filters.priority;
    if (filters.search) {
      where.title = { [Op.like]: `%${filters.search.trim()}%` };
    }

    return Task.findAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: User, as: 'assigner', attributes: ['id', 'email'] },
        { model: TaskUpdate, as: 'updates' },
      ],
      order: [['due_date', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public async updateOwnTaskProgress(
    taskId: number,
    employeeId: number,
    userId: number,
    dto: {
      status?: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
      progress?: number;
      comment?: string;
      attachment_url?: string | null;
    }
  ) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // Strict employee ownership enforcement
    if (Number(task.assigned_to) !== Number(employeeId)) {
      throw new AppError('Forbidden: you can only update tasks assigned to you.', 403);
    }

    if (dto.progress !== undefined) {
      task.progress = Math.min(100, Math.max(0, Number(dto.progress)));
    }
    if (dto.status) {
      task.status = dto.status;
    }
    if (task.status === 'Completed') {
      task.progress = 100;
      task.completed_at = new Date();
    } else if (task.progress === 100 && !dto.status) {
      task.status = 'Completed';
      task.completed_at = new Date();
    } else if (task.progress > 0 && task.status === 'Pending') {
      task.status = 'In Progress';
    }

    if (dto.attachment_url) {
      let list: string[] = [];
      try {
        list = task.attachments ? JSON.parse(task.attachments) : [];
      } catch {
        list = [];
      }
      list.push(dto.attachment_url);
      task.attachments = JSON.stringify(list);
    }

    await task.save();

    if (dto.comment?.trim() || dto.attachment_url || dto.status || dto.progress !== undefined) {
      await TaskUpdate.create({
        task_id: task.id,
        employee_id: employeeId,
        comment: dto.comment?.trim() || `Updated status to ${task.status} (${task.progress}%)`,
        progress: task.progress,
        status: task.status,
        attachment_url: dto.attachment_url || null,
      });
    }

    if (task.status === 'Completed') {
      await EmployeeHistory.create({
        employee_id: employeeId,
        event_type: 'TaskCompleted',
        title: `Completed Task: ${task.title}`,
        description: `Task completed on ${getTodayDateString()}`,
        performed_by: userId,
      });
      await notificationService.notifyAdmins(
        'Task',
        'Task Completed',
        `Task "${task.title}" has been marked as Completed.`,
        '/admin/tasks'
      );
    }

    await auditLogService.log({
      userId,
      action: 'UPDATE_TASK_PROGRESS',
      entityType: 'Task',
      entityId: task.id,
      newValues: { status: task.status, progress: task.progress },
    });

    return this.getTaskById(task.id);
  }

  public async adminListTasks(filters: {
    status?: string;
    priority?: string;
    departmentId?: number;
    employeeId?: number;
    delayedOnly?: boolean;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.priority && filters.priority !== 'All') where.priority = filters.priority;
    if (filters.departmentId) where.department_id = filters.departmentId;
    if (filters.employeeId) where.assigned_to = filters.employeeId;
    if (filters.delayedOnly) {
      where.due_date = { [Op.lt]: getTodayDateString() };
      where.status = { [Op.ne]: 'Completed' };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Employee, as: 'assignee', attributes: ['id', 'employee_code', 'full_name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: TaskUpdate, as: 'updates' },
      ],
      order: [['createdAt', 'DESC']],
    });

    const today = getTodayDateString();
    const analytics = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      delayed: tasks.filter((t) => t.status !== 'Completed' && t.due_date < today).length,
    };

    return { tasks, analytics };
  }

  public async adminUpdateTask(
    taskId: number,
    adminUserId: number,
    dto: Partial<{
      title: string;
      description: string;
      assigned_to: number;
      department_id: number | null;
      priority: 'Low' | 'Medium' | 'High' | 'Urgent';
      status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
      due_date: string;
      progress: number;
    }>
  ) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new AppError('Task not found.', 404);
    await task.update(dto);
    await auditLogService.log({
      userId: adminUserId,
      action: 'ADMIN_UPDATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      newValues: dto,
    });
    return this.getTaskById(task.id);
  }

  public async adminDeleteTask(taskId: number, adminUserId: number) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new AppError('Task not found.', 404);
    await task.destroy();
    await auditLogService.log({
      userId: adminUserId,
      action: 'DELETE_TASK',
      entityType: 'Task',
      entityId: taskId,
    });
    return { deleted: true };
  }
}

export default new TaskService();
