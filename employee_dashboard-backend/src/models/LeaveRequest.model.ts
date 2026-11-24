import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface LeaveRequestAttributes {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  attachment_url?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewed_by?: number | null;
  reviewed_at?: Date | null;
  rejection_reason?: string | null;
  has_team_conflict: boolean;
  conflict_summary?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeaveRequestCreationAttributes = Optional<
  LeaveRequestAttributes,
  | 'id'
  | 'attachment_url'
  | 'status'
  | 'reviewed_by'
  | 'reviewed_at'
  | 'rejection_reason'
  | 'has_team_conflict'
  | 'conflict_summary'
>;

export class LeaveRequest
  extends Model<LeaveRequestAttributes, LeaveRequestCreationAttributes>
  implements LeaveRequestAttributes
{
  public id!: number;
  public employee_id!: number;
  public leave_type_id!: number;
  public start_date!: string;
  public end_date!: string;
  public total_days!: number;
  public reason!: string;
  public attachment_url?: string | null;
  public status!: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  public reviewed_by?: number | null;
  public reviewed_at?: Date | null;
  public rejection_reason?: string | null;
  public has_team_conflict!: boolean;
  public conflict_summary?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof LeaveRequest {
    LeaveRequest.init(
      {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        leave_type_id: { type: DataTypes.INTEGER, allowNull: false },
        start_date: { type: DataTypes.DATEONLY, allowNull: false },
        end_date: { type: DataTypes.DATEONLY, allowNull: false },
        total_days: { type: DataTypes.DECIMAL(4, 1), allowNull: false },
        reason: { type: DataTypes.TEXT, allowNull: false },
        attachment_url: { type: DataTypes.STRING(500), allowNull: true },
        status: {
          type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
          allowNull: false,
          defaultValue: 'Pending',
        },
        reviewed_by: { type: DataTypes.INTEGER, allowNull: true },
        reviewed_at: { type: DataTypes.DATE, allowNull: true },
        rejection_reason: { type: DataTypes.TEXT, allowNull: true },
        has_team_conflict: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        conflict_summary: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'leave_requests', timestamps: true }
    );
    return LeaveRequest;
  }
}

export default LeaveRequest;
