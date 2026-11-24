import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface NotificationAttributes {
  id: number;
  user_id: number;
  employee_id?: number | null;
  category:
    | 'Attendance'
    | 'Leave'
    | 'AttendanceCorrection'
    | 'Task'
    | 'WorkUpdate'
    | 'Holiday'
    | 'Meeting'
    | 'Announcement'
    | 'Profile'
    | 'System';
  title: string;
  message: string;
  is_read: boolean;
  read_at?: Date | null;
  link_url?: string | null;
  metadata?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'employee_id' | 'is_read' | 'read_at' | 'link_url' | 'metadata'
>;

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public user_id!: number;
  public employee_id?: number | null;
  public category!:
    | 'Attendance'
    | 'Leave'
    | 'AttendanceCorrection'
    | 'Task'
    | 'WorkUpdate'
    | 'Holiday'
    | 'Meeting'
    | 'Announcement'
    | 'Profile'
    | 'System';
  public title!: string;
  public message!: string;
  public is_read!: boolean;
  public read_at?: Date | null;
  public link_url?: string | null;
  public metadata?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Notification {
    Notification.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        employee_id: { type: DataTypes.BIGINT, allowNull: true },
        category: {
          type: DataTypes.ENUM(
            'Attendance',
            'Leave',
            'AttendanceCorrection',
            'Task',
            'WorkUpdate',
            'Holiday',
            'Meeting',
            'Announcement',
            'Profile',
            'System'
          ),
          allowNull: false,
          defaultValue: 'System',
        },
        title: { type: DataTypes.STRING(180), allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        read_at: { type: DataTypes.DATE, allowNull: true },
        link_url: { type: DataTypes.STRING(255), allowNull: true },
        metadata: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'notifications', timestamps: true }
    );
    return Notification;
  }
}

export default Notification;
