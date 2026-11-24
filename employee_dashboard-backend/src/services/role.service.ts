import sequelize from '../config/db.config';
import { Role, Permission, RolePermission, User, AuditLog } from '../models';
import { AppError } from '../utils/appError.util';
import { ROLES } from '../constants/roles.constants';
import auditLogService from './auditLog.service';

export interface PermissionMatrixInput {
  [moduleName: string]: {
    [action: string]: boolean;
  };
}

export class RoleService {
  private buildPermissionKey(moduleName: string, action: string): string {
    return `${moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}:${action.toLowerCase()}`;
  }

  public async listRoles() {
    const roles = await Role.findAll({
      include: [
        { model: Permission, as: 'permissions' },
        { model: User, as: 'users', attributes: ['id', 'is_active'] },
      ],
      order: [['id', 'ASC']],
    });

    return roles.map((r) => {
      const perms = (r.get('permissions') as Permission[]) || [];
      const users = (r.get('users') as User[]) || [];

      const matrix: Record<string, Record<string, boolean>> = {};
      for (const p of perms) {
        if (p.name.includes(':')) {
          const [mod, act] = p.name.split(':');
          if (!matrix[mod]) matrix[mod] = {};
          matrix[mod][act] = true;
        }
      }

      return {
        id: r.id,
        name: r.name,
        description: r.description,
        isEditable: r.name !== ROLES.ADMIN,
        isDeletable: false,
        assignedUsersCount: users.filter((u) => u.is_active).length,
        totalPermissions: perms.length,
        permissionNames: perms.map((p) => p.name),
        permissionMatrix: matrix,
        updatedAt: r.updatedAt,
      };
    });
  }

  public async getRoleById(id: number) {
    const all = await this.listRoles();
    const role = all.find((r) => r.id === id);
    if (!role) throw new AppError('Role not found.', 404);
    return role;
  }

  /**
   * Update granular permissions for a non-Admin role (supports either flat permissionNames[] or module->action matrix).
   * Writes an exact diff audit log entry using existing AuditLog model.
   */
  public async updateRolePermissions(
    roleId: number,
    adminUserId: number,
    payload: {
      permissions?: string[];
      permissionMatrix?: PermissionMatrixInput;
    }
  ) {
    const role = await Role.findByPk(roleId, {
      include: [{ model: Permission, as: 'permissions' }],
    });
    if (!role) throw new AppError('Role not found.', 404);
    if (role.name === ROLES.ADMIN) {
      throw new AppError('Admin role permissions are immutable and cannot be modified.', 403);
    }

    const desiredNames = new Set<string>();
    if (Array.isArray(payload.permissions)) {
      payload.permissions.forEach((p) => {
        if (typeof p === 'string' && p.trim()) desiredNames.add(p.trim());
      });
    }
    if (payload.permissionMatrix && typeof payload.permissionMatrix === 'object') {
      for (const [mod, actions] of Object.entries(payload.permissionMatrix)) {
        for (const [action, enabled] of Object.entries(actions || {})) {
          if (enabled) desiredNames.add(this.buildPermissionKey(mod, action));
        }
      }
    }

    const currentPerms = (role.get('permissions') as Permission[]) || [];
    const oldNames = currentPerms.map((p) => p.name).sort();
    const newNames = Array.from(desiredNames).sort();

    await sequelize.transaction(async (t) => {
      const permIds: number[] = [];
      for (const name of newNames) {
        const mod = name.includes(':') ? name.split(':')[0] : name.split('_').slice(-1)[0] || 'general';
        const [perm] = await Permission.findOrCreate({
          where: { name },
          defaults: { name, module: mod, description: name },
          transaction: t,
        });
        permIds.push(perm.id);
      }

      await RolePermission.destroy({ where: { role_id: role.id }, transaction: t });
      if (permIds.length > 0) {
        await RolePermission.bulkCreate(
          permIds.map((pid) => ({ role_id: role.id, permission_id: pid })),
          { transaction: t }
        );
      }
    });

    const added = newNames.filter((n) => !oldNames.includes(n));
    const removed = oldNames.filter((n) => !newNames.includes(n));

    await auditLogService.log({
      userId: adminUserId,
      action: 'UPDATE_ROLE_PERMISSIONS',
      entityType: 'Role',
      entityId: role.id,
      oldValues: { count: oldNames.length, removed },
      newValues: { count: newNames.length, added },
    });

    return {
      role: await this.getRoleById(role.id),
      diff: { added, removed, diffCount: added.length + removed.length },
    };
  }

  public async getPermissionAuditLogs(limit = 50) {
    return AuditLog.findAll({
      where: { entity_type: 'Role' },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}

export default new RoleService();
