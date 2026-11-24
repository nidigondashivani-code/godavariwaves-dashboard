import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface TaskAttributes {
  id: number;
  title: string;
  description?: string | null;
  department_id?: number | null;
  assigned_by: number;
  assigned_to: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  assigned_date: string;
  due_date: string;
  completed_at?: Date | null;
  attachments?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskCreationAttributes = Optional<
  TaskAttributes,
  'id' | 'description' | 'department_id' | 'priority' | 'status' | 'progress' | 'completed_at' | 'attachments'
>;

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description?: string | null;
  public department_id?: number | null;
  public assigned_by!: number;
  public assigned_to!: number;
  public priority!: 'Low' | 'Medium' | 'High' | 'Urgent';
  public status!: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  public progress!: number;
  public assigned_date!: string;
  public due_date!: string;
  public completed_at?: Date | null;
  public attachments?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Task {
    Task.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(200), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        department_id: { type: DataTypes.INTEGER, allowNull: true },
        assigned_by: { type: DataTypes.INTEGER, allowNull: false },
        assigned_to: { type: DataTypes.BIGINT, allowNull: false },
        priority: {
          type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
          allowNull: false,
          defaultValue: 'Medium',
        },
        status: {
          type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'On Hold'),
          allowNull: false,
          defaultValue: 'Pending',
        },
        progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        assigned_date: { type: DataTypes.DATEONLY, allowNull: false },
        due_date: { type: DataTypes.DATEONLY, allowNull: false },
        completed_at: { type: DataTypes.DATE, allowNull: true },
        attachments: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'tasks', timestamps: true }
    );
    return Task;
  }
}

export default Task;
