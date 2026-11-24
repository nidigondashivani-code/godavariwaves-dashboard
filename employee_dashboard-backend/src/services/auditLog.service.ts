import { AuditLog } from '../models';
import { logger } from '../utils/logger.util';

export interface AuditLogInput {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditLogService {
  public async log(input: AuditLogInput): Promise<void> {
    try {
      await AuditLog.create({
        user_id: input.userId ?? null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId ?? null,
        old_values: input.oldValues !== undefined ? JSON.stringify(input.oldValues) : null,
        new_values: input.newValues !== undefined ? JSON.stringify(input.newValues) : null,
        ip_address: input.ipAddress ?? null,
        user_agent: input.userAgent ?? null,
      });
    } catch (err) {
      logger.warn('Failed to write audit log', err);
    }
  }
}

export default new AuditLogService();
