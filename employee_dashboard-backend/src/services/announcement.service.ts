import { Op } from 'sequelize';
import { Announcement, Department, Employee } from '../models';
import { AppError } from '../utils/appError.util';
import notificationService from './notification.service';
import auditLogService from './auditLog.service';

export class AnnouncementService {
  private parseReadIds(raw?: string | null): number[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return [];
    }
  }

  public async getForEmployee(employeeId: number, departmentId?: number | null) {
    const now = new Date();
    const list = await Announcement.findAll({
      where: {
        [Op.or]: [
          { status: 'Published' },
          { status: 'Scheduled', scheduled_at: { [Op.lte]: now } },
        ],
        [Op.and]: [
          {
            [Op.or]: [
              { target_audience: 'All' },
              ...(departmentId ? [{ target_audience: 'Department', department_id: departmentId }] : []),
            ],
          },
        ],
      },
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      order: [['published_at', 'DESC'], ['createdAt', 'DESC']],
    });

    return list.map((a) => {
      const readIds = this.parseReadIds(a.read_by_ids);
      return {
        ...a.toJSON(),
        isRead: readIds.includes(Number(employeeId)),
        readCount: readIds.length,
      };
    });
  }

  public async markAsRead(announcementId: number, employeeId: number) {
    const ann = await Announcement.findByPk(announcementId);
    if (!ann) throw new AppError('Announcement not found.', 404);

    const readIds = this.parseReadIds(ann.read_by_ids);
    if (!readIds.includes(Number(employeeId))) {
      readIds.push(Number(employeeId));
      ann.read_by_ids = JSON.stringify(readIds);
      await ann.save();
    }
    return { id: ann.id, isRead: true };
  }

  public async adminListAll() {
    return Announcement.findAll({
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  public async create(
    adminUserId: number,
    dto: {
      title: string;
      content: string;
      category?: 'General' | 'HR Policy' | 'Event' | 'Urgent' | 'IT';
      target_audience?: 'All' | 'Department';
      department_id?: number | null;
      attachment_url?: string | null;
      status?: 'Draft' | 'Scheduled' | 'Published';
      scheduled_at?: string | null;
    }
  ) {
    if (!dto.title?.trim() || !dto.content?.trim()) {
      throw new AppError('Announcement title and content are required.', 400);
    }

    const status = dto.status || 'Published';
    const ann = await Announcement.create({
      title: dto.title.trim(),
      content: dto.content.trim(),
      category: dto.category || 'General',
      target_audience: dto.target_audience || 'All',
      department_id: dto.target_audience === 'Department' ? dto.department_id || null : null,
      attachment_url: dto.attachment_url || null,
      status,
      scheduled_at: dto.scheduled_at ? new Date(dto.scheduled_at) : null,
      published_at: status === 'Published' ? new Date() : null,
      created_by: adminUserId,
      read_by_ids: '[]',
    });

    if (status === 'Published') {
      const empWhere: Record<string, unknown> = { employment_status: 'Active' };
      if (ann.target_audience === 'Department' && ann.department_id) {
        empWhere.department_id = ann.department_id;
      }
      const employees = await Employee.findAll({ where: empWhere });
      await Promise.all(
        employees.map((e) =>
          notificationService.create({
            userId: e.user_id,
            employeeId: e.id,
            category: 'Announcement',
            title: `New Announcement: ${ann.title}`,
            message: ann.content.slice(0, 140),
            linkUrl: '/employee/announcements',
          })
        )
      );
    }

    await auditLogService.log({
      userId: adminUserId,
      action: 'CREATE_ANNOUNCEMENT',
      entityType: 'Announcement',
      entityId: ann.id,
      newValues: { title: ann.title, status: ann.status, target: ann.target_audience },
    });

    return ann;
  }

  public async update(id: number, adminUserId: number, dto: Partial<Announcement>) {
    const ann = await Announcement.findByPk(id);
    if (!ann) throw new AppError('Announcement not found.', 404);

    if (dto.status === 'Published' && !ann.published_at) {
      dto.published_at = new Date();
    }
    await ann.update(dto);

    await auditLogService.log({
      userId: adminUserId,
      action: 'UPDATE_ANNOUNCEMENT',
      entityType: 'Announcement',
      entityId: ann.id,
    });

    return ann;
  }

  public async remove(id: number, adminUserId: number) {
    const deleted = await Announcement.destroy({ where: { id } });
    if (!deleted) throw new AppError('Announcement not found.', 404);
    await auditLogService.log({
      userId: adminUserId,
      action: 'DELETE_ANNOUNCEMENT',
      entityType: 'Announcement',
      entityId: id,
    });
    return { deleted: true };
  }
}

export default new AnnouncementService();
