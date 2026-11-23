import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface LeaveConflictAttributes {
  id: number;
  team_id: number;
  rule_id: number;
  leave_request_id: number;
  conflicting_employee_id: number;
  existing_leave_request_id: number;
  conflict_date: string;
  reason: string;
  status: 'Detected' | 'Resolved' | 'Overridden' | 'Rejected';
  resolved_by?: number | null;
  resolution_notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeaveConflictCreationAttributes = Optional<
  LeaveConflictAttributes,
  'id' | 'status' | 'resolved_by' | 'resolution_notes'
>;

export class LeaveConflict extends Model<LeaveConflictAttributes, LeaveConflictCreationAttributes> implements LeaveConflictAttributes {
  public id!: number;
  public team_id!: number;
  public rule_id!: number;
  public leave_request_id!: number;
  public conflicting_employee_id!: number;
  public existing_leave_request_id!: number;
  public conflict_date!: string;
  public reason!: string;
  public status!: 'Detected' | 'Resolved' | 'Overridden' | 'Rejected';
  public resolved_by?: number | null;
  public resolution_notes?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof LeaveConflict {
    LeaveConflict.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        team_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: 'teams',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        rule_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: 'team_leave_rules',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        leave_request_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: 'leave_requests',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        conflicting_employee_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: 'employees',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        existing_leave_request_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: 'leave_requests',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        conflict_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        reason: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('Detected', 'Resolved', 'Overridden', 'Rejected'),
          allowNull: false,
          defaultValue: 'Detected',
        },
        resolved_by: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        resolution_notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'leave_conflicts',
        timestamps: true,
      }
    );
    return LeaveConflict;
  }
}

export default LeaveConflict;
