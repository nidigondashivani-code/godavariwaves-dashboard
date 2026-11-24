import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface DepartmentAttributes {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  monthly_target?: string | null;
  active_projects_count: number;
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export type DepartmentCreationAttributes = Optional<
  DepartmentAttributes,
  'id' | 'description' | 'monthly_target' | 'active_projects_count' | 'status'
>;

export class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string | null;
  public monthly_target?: string | null;
  public active_projects_count!: number;
  public status!: 'Active' | 'Inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Department {
    Department.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        description: { type: DataTypes.STRING(255), allowNull: true },
        monthly_target: { type: DataTypes.STRING(180), allowNull: true },
        active_projects_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
      },
      { sequelize, tableName: 'departments', timestamps: true }
    );
    return Department;
  }
}

export default Department;
