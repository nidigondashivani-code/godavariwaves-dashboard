import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AttendanceCorrectionAttributes {
  id: number;
  employee_id: number;
  attendance_id?: number | null;
  attendance_date: string;
  existing_login_time?: string | null;
  requested_login_time: string;
  existing_logout_time?: string | null;
  requested_logout_time: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewed_by?: number | null;
  reviewed_at?: Date | null;
  rejection_reason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AttendanceCorrectionCreationAttributes = Optional<
  AttendanceCorrectionAttributes,
  | 'id'
  | 'attendance_id'
  | 'existing_login_time'
  | 'existing_logout_time'
  | 'status'
  | 'reviewed_by'
  | 'reviewed_at'
  | 'rejection_reason'
>;

export class AttendanceCorrection
  extends Model<AttendanceCorrectionAttributes, AttendanceCorrectionCreationAttributes>
  implements AttendanceCorrectionAttributes
{
  public id!: number;
  public employee_id!: number;
  public attendance_id?: number | null;
  public attendance_date!: string;
  public existing_login_time?: string | null;
  public requested_login_time!: string;
  public existing_logout_time?: string | null;
  public requested_logout_time!: string;
  public reason!: string;
  public status!: 'Pending' | 'Approved' | 'Rejected';
  public reviewed_by?: number | null;
  public reviewed_at?: Date | null;
  public rejection_reason?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof AttendanceCorrection {
    AttendanceCorrection.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        attendance_id: { type: DataTypes.INTEGER, allowNull: true },
        attendance_date: { type: DataTypes.DATEONLY, allowNull: false },
        existing_login_time: { type: DataTypes.STRING(20), allowNull: true },
        requested_login_time: { type: DataTypes.STRING(20), allowNull: false },
        existing_logout_time: { type: DataTypes.STRING(20), allowNull: true },
        requested_logout_time: { type: DataTypes.STRING(20), allowNull: false },
        reason: { type: DataTypes.TEXT, allowNull: false },
        status: {
          type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
          allowNull: false,
          defaultValue: 'Pending',
        },
        reviewed_by: { type: DataTypes.INTEGER, allowNull: true },
        reviewed_at: { type: DataTypes.DATE, allowNull: true },
        rejection_reason: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'attendance_corrections', timestamps: true }
    );
    return AttendanceCorrection;
  }
}

export default AttendanceCorrection;
