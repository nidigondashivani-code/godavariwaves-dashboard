import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TaskUpdateAttributes {
  id: number;
  task_id: number;
  employee_id: number;
  comment: string;
  progress?: number | null;
  status?: string | null;
  attachment_url?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskUpdateCreationAttributes = Optional<
  TaskUpdateAttributes,
  'id' | 'progress' | 'status' | 'attachment_url'
>;

export class TaskUpdate
  extends Model<TaskUpdateAttributes, TaskUpdateCreationAttributes>
  implements TaskUpdateAttributes
{
  public id!: number;
  public task_id!: number;
  public employee_id!: number;
  public comment!: string;
  public progress?: number | null;
  public status?: string | null;
  public attachment_url?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof TaskUpdate {
    TaskUpdate.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        task_id: { type: DataTypes.INTEGER, allowNull: false },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: false },
        progress: { type: DataTypes.INTEGER, allowNull: true },
        status: { type: DataTypes.STRING(40), allowNull: true },
        attachment_url: { type: DataTypes.STRING(500), allowNull: true },
      },
      { sequelize, tableName: 'task_updates', timestamps: true }
    );
    return TaskUpdate;
  }
}

export default TaskUpdate;
