import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface AnnouncementAttributes {
  id: number;
  title: string;
  content: string;
  category: 'General' | 'HR Policy' | 'Event' | 'Urgent' | 'IT';
  target_audience: 'All' | 'Department';
  department_id?: number | null;
  attachment_url?: string | null;
  status: 'Draft' | 'Scheduled' | 'Published';
  scheduled_at?: Date | null;
  published_at?: Date | null;
  created_by: number;
  read_by_ids?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnnouncementCreationAttributes = Optional<
  AnnouncementAttributes,
  | 'id'
  | 'category'
  | 'target_audience'
  | 'department_id'
  | 'attachment_url'
  | 'status'
  | 'scheduled_at'
  | 'published_at'
  | 'read_by_ids'
>;

export class Announcement
  extends Model<AnnouncementAttributes, AnnouncementCreationAttributes>
  implements AnnouncementAttributes
{
  public id!: number;
  public title!: string;
  public content!: string;
  public category!: 'General' | 'HR Policy' | 'Event' | 'Urgent' | 'IT';
  public target_audience!: 'All' | 'Department';
  public department_id?: number | null;
  public attachment_url?: string | null;
  public status!: 'Draft' | 'Scheduled' | 'Published';
  public scheduled_at?: Date | null;
  public published_at?: Date | null;
  public created_by!: number;
  public read_by_ids?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Announcement {
    Announcement.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(200), allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        category: {
          type: DataTypes.ENUM('General', 'HR Policy', 'Event', 'Urgent', 'IT'),
          allowNull: false,
          defaultValue: 'General',
        },
        target_audience: {
          type: DataTypes.ENUM('All', 'Department'),
          allowNull: false,
          defaultValue: 'All',
        },
        department_id: { type: DataTypes.INTEGER, allowNull: true },
        attachment_url: { type: DataTypes.STRING(500), allowNull: true },
        status: {
          type: DataTypes.ENUM('Draft', 'Scheduled', 'Published'),
          allowNull: false,
          defaultValue: 'Published',
        },
        scheduled_at: { type: DataTypes.DATE, allowNull: true },
        published_at: { type: DataTypes.DATE, allowNull: true },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
        read_by_ids: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
      },
      { sequelize, tableName: 'announcements', timestamps: true }
    );
    return Announcement;
  }
}

export default Announcement;
