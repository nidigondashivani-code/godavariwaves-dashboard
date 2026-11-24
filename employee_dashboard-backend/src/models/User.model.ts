import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface UserAttributes {
  id: number;
  email: string;
  password_hash: string;
  role_id: number;
  dashboard_access: 'admin' | 'employee' | 'both';
  is_active: boolean;
  last_login_at?: Date | null;
  refresh_token_hash?: string | null;
  reset_token?: string | null;
  reset_token_expires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'dashboard_access'
  | 'is_active'
  | 'last_login_at'
  | 'refresh_token_hash'
  | 'reset_token'
  | 'reset_token_expires'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public role_id!: number;
  public dashboard_access!: 'admin' | 'employee' | 'both';
  public is_active!: boolean;
  public last_login_at?: Date | null;
  public refresh_token_hash?: string | null;
  public reset_token?: string | null;
  public reset_token_expires?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
        password_hash: { type: DataTypes.STRING(255), allowNull: false },
        role_id: { type: DataTypes.INTEGER, allowNull: false },
        dashboard_access: {
          type: DataTypes.ENUM('admin', 'employee', 'both'),
          allowNull: false,
          defaultValue: 'employee',
        },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        last_login_at: { type: DataTypes.DATE, allowNull: true },
        refresh_token_hash: { type: DataTypes.STRING(255), allowNull: true },
        reset_token: { type: DataTypes.STRING(255), allowNull: true },
        reset_token_expires: { type: DataTypes.DATE, allowNull: true },
      },
      { sequelize, tableName: 'users', timestamps: true }
    );
    return User;
  }
}

export default User;
