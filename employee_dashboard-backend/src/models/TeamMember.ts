import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamMemberAttributes {
  id: number;
  team_id: number;
  employee_id: number;
  role_in_team?: string;
  is_lead: boolean;
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeamMemberCreationAttributes = Optional<TeamMemberAttributes, 'id' | 'role_in_team' | 'is_lead' | 'status'>;

export class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes> implements TeamMemberAttributes {
  public id!: number;
  public team_id!: number;
  public employee_id!: number;
  public role_in_team?: string;
  public is_lead!: boolean;
  public status!: 'Active' | 'Inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof TeamMember {
    TeamMember.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        team_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: 'teams',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        employee_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          references: {
            model: 'employees',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        role_in_team: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        is_lead: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        status: {
          type: DataTypes.ENUM('Active', 'Inactive'),
          allowNull: false,
          defaultValue: 'Active',
        },
      },
      {
        sequelize,
        tableName: 'team_members',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['team_id', 'employee_id'],
          },
        ],
      }
    );
    return TeamMember;
  }
}

export default TeamMember;
