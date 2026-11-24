import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface HolidayAttributes {
  id: number;
  name: string;
  date: string;
  type: 'National' | 'Festival' | 'Company' | 'Optional';
  description?: string | null;
  is_optional: boolean;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type HolidayCreationAttributes = Optional<
  HolidayAttributes,
  'id' | 'type' | 'description' | 'is_optional'
>;

export class Holiday
  extends Model<HolidayAttributes, HolidayCreationAttributes>
  implements HolidayAttributes
{
  public id!: number;
  public name!: string;
  public date!: string;
  public type!: 'National' | 'Festival' | 'Company' | 'Optional';
  public description?: string | null;
  public is_optional!: boolean;
  public year!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Holiday {
    Holiday.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(150), allowNull: false },
        date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
        type: {
          type: DataTypes.ENUM('National', 'Festival', 'Company', 'Optional'),
          allowNull: false,
          defaultValue: 'Company',
        },
        description: { type: DataTypes.STRING(255), allowNull: true },
        is_optional: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        year: { type: DataTypes.INTEGER, allowNull: false },
      },
      { sequelize, tableName: 'holidays', timestamps: true }
    );
    return Holiday;
  }
}

export default Holiday;
