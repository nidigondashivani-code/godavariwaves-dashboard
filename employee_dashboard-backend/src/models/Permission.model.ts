import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface PermissionAttributes {
  id: number;
  name: string;
  module: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PermissionCreationAttributes = Optional<PermissionAttributes, 'id' | 'description'>;

export class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: number;
  public name!: string;
  public module!: string;
  public description?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Permission {
    Permission.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        module: { type: DataTypes.STRING(60), allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'permissions', timestamps: true }
    );
    return Permission;
  }
}

export default Permission;
