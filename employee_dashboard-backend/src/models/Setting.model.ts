import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface SettingAttributes {
  id: number;
  key: string;
  value: string;
  group: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SettingCreationAttributes = Optional<SettingAttributes, 'id' | 'group' | 'description'>;

export class Setting
  extends Model<SettingAttributes, SettingCreationAttributes>
  implements SettingAttributes
{
  public id!: number;
  public key!: string;
  public value!: string;
  public group!: string;
  public description?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Setting {
    Setting.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        value: { type: DataTypes.TEXT, allowNull: false },
        group: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'general' },
        description: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'settings', timestamps: true }
    );
    return Setting;
  }
}

export default Setting;
