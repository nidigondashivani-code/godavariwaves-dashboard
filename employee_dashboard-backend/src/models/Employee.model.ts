import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface EmployeeAttributes {
  id: number;
  user_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  company_email: string;
  personal_email?: string | null;
  phone?: string | null;
  profile_picture?: string | null;
  department_id?: number | null;
  designation_id?: number | null;
  reporting_manager_id?: number | null;
  date_of_birth?: string | null;
  joining_date: string;
  employment_type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  employment_status: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  gender?: string | null;
  inactivity_reason?: string | null;
  is_deleted: boolean;
  deleted_at?: Date | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  bio?: string | null;
  skills?: string | null;
  salary?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EmployeeCreationAttributes = Optional<
  EmployeeAttributes,
  | 'id'
  | 'personal_email'
  | 'phone'
  | 'profile_picture'
  | 'department_id'
  | 'designation_id'
  | 'reporting_manager_id'
  | 'date_of_birth'
  | 'employment_type'
  | 'employment_status'
  | 'gender'
  | 'inactivity_reason'
  | 'is_deleted'
  | 'deleted_at'
  | 'address'
  | 'emergency_contact_name'
  | 'emergency_contact_phone'
  | 'bio'
  | 'skills'
  | 'salary'
>;

export class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: number;
  public user_id!: number;
  public employee_code!: string;
  public first_name!: string;
  public last_name!: string;
  public full_name!: string;
  public company_email!: string;
  public personal_email?: string | null;
  public phone?: string | null;
  public profile_picture?: string | null;
  public department_id?: number | null;
  public designation_id?: number | null;
  public reporting_manager_id?: number | null;
  public date_of_birth?: string | null;
  public joining_date!: string;
  public employment_type!: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  public employment_status!: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  public gender?: string | null;
  public inactivity_reason?: string | null;
  public is_deleted!: boolean;
  public deleted_at?: Date | null;
  public address?: string | null;
  public emergency_contact_name?: string | null;
  public emergency_contact_phone?: string | null;
  public bio?: string | null;
  public skills?: string | null;
  public salary?: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof Employee {
    Employee.init(
      {
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
        employee_code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        first_name: { type: DataTypes.STRING(80), allowNull: false },
        last_name: { type: DataTypes.STRING(80), allowNull: false },
        full_name: { type: DataTypes.STRING(160), allowNull: false },
        company_email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
        personal_email: { type: DataTypes.STRING(150), allowNull: true },
        phone: { type: DataTypes.STRING(30), allowNull: true },
        profile_picture: { type: DataTypes.STRING(500), allowNull: true },
        department_id: { type: DataTypes.INTEGER, allowNull: true },
        designation_id: { type: DataTypes.INTEGER, allowNull: true },
        reporting_manager_id: { type: DataTypes.BIGINT, allowNull: true },
        date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
        joining_date: { type: DataTypes.DATEONLY, allowNull: false },
        employment_type: {
          type: DataTypes.ENUM('Full-Time', 'Part-Time', 'Contract', 'Intern'),
          allowNull: false,
          defaultValue: 'Full-Time',
        },
        employment_status: {
          type: DataTypes.ENUM('Active', 'On Leave', 'Inactive', 'Terminated'),
          allowNull: false,
          defaultValue: 'Active',
        },
        gender: { type: DataTypes.STRING(30), allowNull: true },
        inactivity_reason: { type: DataTypes.STRING(120), allowNull: true },
        is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        deleted_at: { type: DataTypes.DATE, allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        emergency_contact_name: { type: DataTypes.STRING(120), allowNull: true },
        emergency_contact_phone: { type: DataTypes.STRING(30), allowNull: true },
        bio: { type: DataTypes.TEXT, allowNull: true },
        skills: { type: DataTypes.TEXT, allowNull: true },
        salary: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      },
      { sequelize, tableName: 'employees', timestamps: true }
    );
    return Employee;
  }
}

export default Employee;
