import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface RoleAttributes {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'description'>;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public description?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Role {
    Role.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        description: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'roles', timestamps: true }
    );
    return Role;
  }
}

export default Role;
