import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface ProfileUpdateRequestAttributes {
  id: number;
  employee_id: number;
  field_name: string;
  current_value?: string | null;
  requested_value: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewed_by?: number | null;
  reviewed_at?: Date | null;
  rejection_reason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProfileUpdateRequestCreationAttributes = Optional<
  ProfileUpdateRequestAttributes,
  'id' | 'current_value' | 'status' | 'reviewed_by' | 'reviewed_at' | 'rejection_reason'
>;

export class ProfileUpdateRequest
  extends Model<ProfileUpdateRequestAttributes, ProfileUpdateRequestCreationAttributes>
  implements ProfileUpdateRequestAttributes
{
  public id!: number;
  public employee_id!: number;
  public field_name!: string;
  public current_value?: string | null;
  public requested_value!: string;
  public reason!: string;
  public status!: 'Pending' | 'Approved' | 'Rejected';
  public reviewed_by?: number | null;
  public reviewed_at?: Date | null;
  public rejection_reason?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof ProfileUpdateRequest {
    ProfileUpdateRequest.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        field_name: { type: DataTypes.STRING(80), allowNull: false },
        current_value: { type: DataTypes.TEXT, allowNull: true },
        requested_value: { type: DataTypes.TEXT, allowNull: false },
        reason: { type: DataTypes.TEXT, allowNull: false },
        status: {
          type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
          allowNull: false,
          defaultValue: 'Pending',
        },
        reviewed_by: { type: DataTypes.INTEGER, allowNull: true },
        reviewed_at: { type: DataTypes.DATE, allowNull: true },
        rejection_reason: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'profile_update_requests', timestamps: true }
    );
    return ProfileUpdateRequest;
  }
}

export default ProfileUpdateRequest;
