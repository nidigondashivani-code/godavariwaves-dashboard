import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TaskAssignmentAttributes {
  id: number;
  task_id: number;
  employee_id: number;
  assigned_by: number;
  assigned_at: Date;
}

export type TaskAssignmentCreationAttributes = Optional<TaskAssignmentAttributes, 'id' | 'assigned_at'>;

export class TaskAssignment
  extends Model<TaskAssignmentAttributes, TaskAssignmentCreationAttributes>
  implements TaskAssignmentAttributes
{
  public id!: number;
  public task_id!: number;
  public employee_id!: number;
  public assigned_by!: number;
  public assigned_at!: Date;

  public static initModel(sequelize: Sequelize): typeof TaskAssignment {
    TaskAssignment.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        task_id: { type: DataTypes.INTEGER, allowNull: false },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        assigned_by: { type: DataTypes.INTEGER, allowNull: false },
        assigned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { sequelize, tableName: 'task_assignments', timestamps: true }
    );
    return TaskAssignment;
  }
}

export default TaskAssignment;
