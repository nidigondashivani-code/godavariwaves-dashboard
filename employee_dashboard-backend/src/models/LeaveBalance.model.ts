import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface LeaveBalanceAttributes {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeaveBalanceCreationAttributes = Optional<
  LeaveBalanceAttributes,
  'id' | 'used_days' | 'pending_days'
>;

export class LeaveBalance
  extends Model<LeaveBalanceAttributes, LeaveBalanceCreationAttributes>
  implements LeaveBalanceAttributes
{
  public id!: number;
  public employee_id!: number;
  public leave_type_id!: number;
  public year!: number;
  public allocated_days!: number;
  public used_days!: number;
  public pending_days!: number;
  public remaining_days!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof LeaveBalance {
    LeaveBalance.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        leave_type_id: { type: DataTypes.INTEGER, allowNull: false },
        year: { type: DataTypes.INTEGER, allowNull: false },
        allocated_days: { type: DataTypes.DECIMAL(5, 1), allowNull: false, defaultValue: 0 },
        used_days: { type: DataTypes.DECIMAL(5, 1), allowNull: false, defaultValue: 0 },
        pending_days: { type: DataTypes.DECIMAL(5, 1), allowNull: false, defaultValue: 0 },
        remaining_days: { type: DataTypes.DECIMAL(5, 1), allowNull: false, defaultValue: 0 },
      },
      {
        sequelize,
        tableName: 'leave_balances',
        timestamps: true,
        indexes: [{ unique: true, fields: ['employee_id', 'leave_type_id', 'year'] }],
      }
    );
    return LeaveBalance;
  }
}

export default LeaveBalance;
