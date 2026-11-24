import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AttendanceLogAttributes {
  id: number;
  attendance_id?: number | null;
  employee_id: number;
  action: 'CLOCK_IN' | 'CLOCK_OUT' | 'CORRECTION_APPLIED' | 'AUTO_ABSENT';
  timestamp: Date;
  ip_address?: string | null;
  metadata?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AttendanceLogCreationAttributes = Optional<
  AttendanceLogAttributes,
  'id' | 'attendance_id' | 'ip_address' | 'metadata'
>;

export class AttendanceLog
  extends Model<AttendanceLogAttributes, AttendanceLogCreationAttributes>
  implements AttendanceLogAttributes
{
  public id!: number;
  public attendance_id?: number | null;
  public employee_id!: number;
  public action!: 'CLOCK_IN' | 'CLOCK_OUT' | 'CORRECTION_APPLIED' | 'AUTO_ABSENT';
  public timestamp!: Date;
  public ip_address?: string | null;
  public metadata?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof AttendanceLog {
    AttendanceLog.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        attendance_id: { type: DataTypes.INTEGER, allowNull: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        action: {
          type: DataTypes.ENUM('CLOCK_IN', 'CLOCK_OUT', 'CORRECTION_APPLIED', 'AUTO_ABSENT'),
          allowNull: false,
        },
        timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        ip_address: { type: DataTypes.STRING(64), allowNull: true },
        metadata: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'attendance_logs', timestamps: true }
    );
    return AttendanceLog;
  }
}

export default AttendanceLog;
