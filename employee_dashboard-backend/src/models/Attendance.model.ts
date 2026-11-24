import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AttendanceAttributes {
  id: number;
  employee_id: number;
  date: string;
  clock_in?: Date | null;
  clock_out?: Date | null;
  working_minutes: number;
  working_hours: number;
  late_minutes: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  notes?: string | null;
  is_corrected: boolean;
  is_approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AttendanceCreationAttributes = Optional<
  AttendanceAttributes,
  | 'id'
  | 'clock_in'
  | 'clock_out'
  | 'working_minutes'
  | 'working_hours'
  | 'late_minutes'
  | 'status'
  | 'notes'
  | 'is_corrected'
  | 'is_approved'
>;

export class Attendance
  extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes
{
  public id!: number;
  public employee_id!: number;
  public date!: string;
  public clock_in?: Date | null;
  public clock_out?: Date | null;
  public working_minutes!: number;
  public working_hours!: number;
  public late_minutes!: number;
  public status!: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  public notes?: string | null;
  public is_corrected!: boolean;
  public is_approved!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Attendance {
    Attendance.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        date: { type: DataTypes.DATEONLY, allowNull: false },
        clock_in: { type: DataTypes.DATE, allowNull: true },
        clock_out: { type: DataTypes.DATE, allowNull: true },
        working_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        working_hours: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
        late_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        status: {
          type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Half Day', 'On Leave'),
          allowNull: false,
          defaultValue: 'Present',
        },
        notes: { type: DataTypes.TEXT, allowNull: true },
        is_corrected: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        is_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      },
      {
        sequelize,
        tableName: 'attendance',
        timestamps: true,
        indexes: [{ unique: true, fields: ['employee_id', 'date'] }],
      }
    );
    return Attendance;
  }
}

export default Attendance;
