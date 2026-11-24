import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface DesignationAttributes {
  id: number;
  title: string;
  department_id?: number | null;
  level?: string | null;
  description?: string | null;
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export type DesignationCreationAttributes = Optional<
  DesignationAttributes,
  'id' | 'department_id' | 'level' | 'description' | 'status'
>;

export class Designation
  extends Model<DesignationAttributes, DesignationCreationAttributes>
  implements DesignationAttributes
{
  public id!: number;
  public title!: string;
  public department_id?: number | null;
  public level?: string | null;
  public description?: string | null;
  public status!: 'Active' | 'Inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Designation {
    Designation.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(100), allowNull: false },
        department_id: { type: DataTypes.INTEGER, allowNull: true },
        level: { type: DataTypes.STRING(50), allowNull: true },
        description: { type: DataTypes.STRING(255), allowNull: true },
        status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
      },
      { sequelize, tableName: 'designations', timestamps: true }
    );
    return Designation;
  }
}

export default Designation;
