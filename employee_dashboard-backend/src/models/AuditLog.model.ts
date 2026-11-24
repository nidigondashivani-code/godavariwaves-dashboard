import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AuditLogAttributes {
  id: number;
  user_id?: number | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  old_values?: string | null;
  new_values?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  'id' | 'user_id' | 'entity_id' | 'old_values' | 'new_values' | 'ip_address' | 'user_agent'
>;

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  public id!: number;
  public user_id?: number | null;
  public action!: string;
  public entity_type!: string;
  public entity_id?: number | null;
  public old_values?: string | null;
  public new_values?: string | null;
  public ip_address?: string | null;
  public user_agent?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof AuditLog {
    AuditLog.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        action: { type: DataTypes.STRING(80), allowNull: false },
        entity_type: { type: DataTypes.STRING(80), allowNull: false },
        entity_id: { type: DataTypes.INTEGER, allowNull: true },
        old_values: { type: DataTypes.TEXT, allowNull: true },
        new_values: { type: DataTypes.TEXT, allowNull: true },
        ip_address: { type: DataTypes.STRING(64), allowNull: true },
        user_agent: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'audit_logs', timestamps: true }
    );
    return AuditLog;
  }
}

export default AuditLog;
