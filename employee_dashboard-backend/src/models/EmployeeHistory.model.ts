import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface EmployeeHistoryAttributes {
  id: number;
  employee_id: number;
  event_type: string;
  title: string;
  description?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  performed_by?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EmployeeHistoryCreationAttributes = Optional<
  EmployeeHistoryAttributes,
  'id' | 'description' | 'old_value' | 'new_value' | 'performed_by'
>;

export class EmployeeHistory
  extends Model<EmployeeHistoryAttributes, EmployeeHistoryCreationAttributes>
  implements EmployeeHistoryAttributes
{
  public id!: number;
  public employee_id!: number;
  public event_type!: string;
  public title!: string;
  public description?: string | null;
  public old_value?: string | null;
  public new_value?: string | null;
  public performed_by?: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof EmployeeHistory {
    EmployeeHistory.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        event_type: { type: DataTypes.STRING(60), allowNull: false },
        title: { type: DataTypes.STRING(180), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        old_value: { type: DataTypes.TEXT, allowNull: true },
        new_value: { type: DataTypes.TEXT, allowNull: true },
        performed_by: { type: DataTypes.INTEGER, allowNull: true },
      },
      { sequelize, tableName: 'employee_history', timestamps: true }
    );
    return EmployeeHistory;
  }
}

export default EmployeeHistory;
