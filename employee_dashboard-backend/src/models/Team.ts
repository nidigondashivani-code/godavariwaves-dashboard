import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamAttributes {
  id: number;
  name: string;
  code: string;
  department_id?: number | null;
  description?: string;
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeamCreationAttributes = Optional<TeamAttributes, 'id' | 'department_id' | 'description' | 'status'>;

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public department_id?: number | null;
  public description?: string;
  public status!: 'Active' | 'Inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Team {
    Team.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        department_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('Active', 'Inactive'),
          allowNull: false,
          defaultValue: 'Active',
        },
      },
      {
        sequelize,
        tableName: 'teams',
        timestamps: true,
      }
    );
    return Team;
  }
}

export default Team;
