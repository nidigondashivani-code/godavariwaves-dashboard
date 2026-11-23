import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TeamLeaveRuleAttributes {
  id: number;
  team_id: number;
  max_concurrent_leaves: number;
  min_workforce_percentage: number;
  rule_scope: 'Team' | 'Designation' | 'Department' | 'Global';
  designation_id?: number | null;
  department_id?: number | null;
  allow_admin_override: boolean;
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeamLeaveRuleCreationAttributes = Optional<
  TeamLeaveRuleAttributes,
  'id' | 'min_workforce_percentage' | 'rule_scope' | 'designation_id' | 'department_id' | 'allow_admin_override' | 'status'
>;

export class TeamLeaveRule extends Model<TeamLeaveRuleAttributes, TeamLeaveRuleCreationAttributes> implements TeamLeaveRuleAttributes {
  public id!: number;
  public team_id!: number;
  public max_concurrent_leaves!: number;
  public min_workforce_percentage!: number;
  public rule_scope!: 'Team' | 'Designation' | 'Department' | 'Global';
  public designation_id?: number | null;
  public department_id?: number | null;
  public allow_admin_override!: boolean;
  public status!: 'Active' | 'Inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof TeamLeaveRule {
    TeamLeaveRule.init(
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
        max_concurrent_leaves: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        min_workforce_percentage: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 75.0,
        },
        rule_scope: {
          type: DataTypes.ENUM('Team', 'Designation', 'Department', 'Global'),
          allowNull: false,
          defaultValue: 'Team',
        },
        designation_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        department_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        allow_admin_override: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        status: {
          type: DataTypes.ENUM('Active', 'Inactive'),
          allowNull: false,
          defaultValue: 'Active',
        },
      },
      {
        sequelize,
        tableName: 'team_leave_rules',
        timestamps: true,
      }
    );
    return TeamLeaveRule;
  }
}

export default TeamLeaveRule;
