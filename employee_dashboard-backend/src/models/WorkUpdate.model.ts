import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface WorkUpdateAttributes {
  id: number;
  employee_id: number;
  work_date: string;
  work_description: string;
  tasks_completed?: string | null;
  progress: number;
  hours_spent: number;
  attachment_url?: string | null;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Revision Required';
  admin_feedback?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkUpdateCreationAttributes = Optional<
  WorkUpdateAttributes,
  | 'id'
  | 'tasks_completed'
  | 'progress'
  | 'hours_spent'
  | 'attachment_url'
  | 'status'
  | 'admin_feedback'
  | 'reviewed_by'
  | 'reviewed_at'
>;

export class WorkUpdate
  extends Model<WorkUpdateAttributes, WorkUpdateCreationAttributes>
  implements WorkUpdateAttributes
{
  public id!: number;
  public employee_id!: number;
  public work_date!: string;
  public work_description!: string;
  public tasks_completed?: string | null;
  public progress!: number;
  public hours_spent!: number;
  public attachment_url?: string | null;
  public status!: 'Pending Review' | 'Approved' | 'Rejected' | 'Revision Required';
  public admin_feedback?: string | null;
  public reviewed_by?: number | null;
  public reviewed_at?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof WorkUpdate {
    WorkUpdate.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        work_date: { type: DataTypes.DATEONLY, allowNull: false },
        work_description: { type: DataTypes.TEXT, allowNull: false },
        tasks_completed: { type: DataTypes.TEXT, allowNull: true },
        progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        hours_spent: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 0 },
        attachment_url: { type: DataTypes.STRING(500), allowNull: true },
        status: {
          type: DataTypes.ENUM('Pending Review', 'Approved', 'Rejected', 'Revision Required'),
          allowNull: false,
          defaultValue: 'Pending Review',
        },
        admin_feedback: { type: DataTypes.TEXT, allowNull: true },
        reviewed_by: { type: DataTypes.INTEGER, allowNull: true },
        reviewed_at: { type: DataTypes.DATE, allowNull: true },
      },
      { sequelize, tableName: 'work_updates', timestamps: true }
    );
    return WorkUpdate;
  }
}

export default WorkUpdate;
