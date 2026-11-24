import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface RolePermissionAttributes {
  id: number;
  role_id: number;
  permission_id: number;
}

export type RolePermissionCreationAttributes = Optional<RolePermissionAttributes, 'id'>;

export class RolePermission
  extends Model<RolePermissionAttributes, RolePermissionCreationAttributes>
  implements RolePermissionAttributes
{
  public id!: number;
  public role_id!: number;
  public permission_id!: number;

  public static initModel(sequelize: Sequelize): typeof RolePermission {
    RolePermission.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        role_id: { type: DataTypes.INTEGER, allowNull: false },
        permission_id: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        tableName: 'role_permissions',
        timestamps: true,
        indexes: [{ unique: true, fields: ['role_id', 'permission_id'] }],
      }
    );
    return RolePermission;
  }
}

export default RolePermission;
