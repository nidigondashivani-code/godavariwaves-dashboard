import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface CalendarEventAttributes {
  id: number;
  title: string;
  description?: string | null;
  event_type: 'Holiday' | 'Meeting' | 'Birthday' | 'Company Event' | 'Activity' | 'Training';
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  department_id?: number | null;
  created_by?: number | null;
  is_all_day: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CalendarEventCreationAttributes = Optional<
  CalendarEventAttributes,
  'id' | 'description' | 'start_time' | 'end_time' | 'location' | 'department_id' | 'created_by' | 'is_all_day'
>;

export class CalendarEvent
  extends Model<CalendarEventAttributes, CalendarEventCreationAttributes>
  implements CalendarEventAttributes
{
  public id!: number;
  public title!: string;
  public description?: string | null;
  public event_type!: 'Holiday' | 'Meeting' | 'Birthday' | 'Company Event' | 'Activity' | 'Training';
  public start_date!: string;
  public end_date!: string;
  public start_time?: string | null;
  public end_time?: string | null;
  public location?: string | null;
  public department_id?: number | null;
  public created_by?: number | null;
  public is_all_day!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof CalendarEvent {
    CalendarEvent.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(150), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        event_type: {
          type: DataTypes.ENUM('Holiday', 'Meeting', 'Birthday', 'Company Event', 'Activity', 'Training'),
          allowNull: false,
          defaultValue: 'Company Event',
        },
        start_date: { type: DataTypes.DATEONLY, allowNull: false },
        end_date: { type: DataTypes.DATEONLY, allowNull: false },
        start_time: { type: DataTypes.STRING(20), allowNull: true },
        end_time: { type: DataTypes.STRING(20), allowNull: true },
        location: { type: DataTypes.STRING(150), allowNull: true },
        department_id: { type: DataTypes.INTEGER, allowNull: true },
        created_by: { type: DataTypes.INTEGER, allowNull: true },
        is_all_day: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      },
      { sequelize, tableName: 'calendar_events', timestamps: true }
    );
    return CalendarEvent;
  }
}

export default CalendarEvent;
