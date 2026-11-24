import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface LeaveTypeAttributes {
  id: number;
  name: string;
  code: string;
  default_days_per_year: number;
  carry_forward_allowed: boolean;
  requires_attachment: boolean;
  is_active: boolean;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeaveTypeCreationAttributes = Optional<
  LeaveTypeAttributes,
  'id' | 'carry_forward_allowed' | 'requires_attachment' | 'is_active' | 'description'
>;

export class LeaveType
  extends Model<LeaveTypeAttributes, LeaveTypeCreationAttributes>
  implements LeaveTypeAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;
  public default_days_per_year!: number;
  public carry_forward_allowed!: boolean;
  public requires_attachment!: boolean;
  public is_active!: boolean;
  public description?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof LeaveType {
    LeaveType.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
        code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
        default_days_per_year: { type: DataTypes.DECIMAL(5, 1), allowNull: false, defaultValue: 12 },
        carry_forward_allowed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        requires_attachment: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        description: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'leave_types', timestamps: true }
    );
    return LeaveType;
  }
}

export default LeaveType;
