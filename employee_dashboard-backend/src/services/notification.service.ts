import { Op } from 'sequelize';
import { Notification, User, Role, Employee } from '../models';
import { getIO } from '../config/socket.config';
import { ADMIN_ROLES } from '../constants/roles.constants';
import { NotificationAttributes } from '../models/Notification.model';
import { AppError } from '../utils/appError.util';

export interface CreateNotificationInput {
  userId: number;
  employeeId?: number | null;
  category: NotificationAttributes['category'];
  title: string;
  message: string;
  linkUrl?: string | null;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  public async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = await Notification.create({
      user_id: input.userId,
      employee_id: input.employeeId ?? null,
      category: input.category,
      title: input.title,
      message: input.message,
      link_url: input.linkUrl ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      is_read: false,
    });

    const io = getIO();
    if (io) {
      io.to(`user_${input.userId}`).emit('notification:new', notification.toJSON());
    }
    return notification;
  }

  public async notifyAdmins(
    category: NotificationAttributes['category'],
    title: string,
    message: string,
    linkUrl?: string
  ): Promise<void> {
    const adminRoles = await Role.findAll({ where: { name: { [Op.in]: [...ADMIN_ROLES] } } });
    const roleIds = adminRoles.map((r) => r.id);
    if (roleIds.length === 0) return;

    const admins = await User.findAll({ where: { role_id: { [Op.in]: roleIds }, is_active: true } });
    await Promise.all(
      admins.map((admin) =>
        this.create({
          userId: admin.id,
          category,
          title,
          message,
          linkUrl: linkUrl || null,
        })
      )
    );
  }

  public async notifyEmployee(
    employeeId: number,
    category: NotificationAttributes['category'],
    title: string,
    message: string,
    linkUrl?: string
  ): Promise<void> {
    const emp = await Employee.findByPk(employeeId);
    if (!emp) return;
    await this.create({
      userId: emp.user_id,
      employeeId: emp.id,
      category,
      title,
      message,
      linkUrl: linkUrl || null,
    });
  }

  public async getForUser(
    userId: number,
    filters: { isRead?: string; category?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const where: Record<string, unknown> = { user_id: userId };

    if (filters.isRead === 'true') where.is_read = true;
    if (filters.isRead === 'false') where.is_read = false;
    if (filters.category && filters.category !== 'All') where.category = filters.category;

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    const unreadCount = await Notification.count({ where: { user_id: userId, is_read: false } });
    return {
      notifications: rows,
      unreadCount,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  public async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId },
    });
    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }
    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();
    return notification;
  }

  public async markAllAsRead(userId: number): Promise<number> {
    const [updated] = await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: userId, is_read: false } }
    );
    return updated;
  }
}

export default new NotificationService();
