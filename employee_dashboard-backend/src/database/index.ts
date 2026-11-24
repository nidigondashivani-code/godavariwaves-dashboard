import { Op } from 'sequelize';
import sequelize from '../config/db.config';
import envConfig from '../config/env.config';
import {
  initAllModels,
  Role,
  Permission,
  RolePermission,
  Department,
  Designation,
  User,
  Employee,
  Team,
  TeamMember,
  TeamLeaveRule,
  LeaveType,
  LeaveBalance,
  Holiday,
  CalendarEvent,
  Announcement,
  Setting,
  EmployeeHistory,
} from '../models';
import { ROLES } from '../constants/roles.constants';
import { PERMISSIONS } from '../constants/permissions.constants';
import { hashPassword } from '../utils/password.util';
import { logger } from '../utils/logger.util';

const getId = (model: any): number => {
  if (!model) return 0;
  return model.getDataValue ? model.getDataValue('id') : model.id;
};

const getOrCreate = async (model: any, where: any, defaults: any) => {
  let record = await model.findOne({ where });
  if (!record) {
    try {
      record = await model.create({ ...defaults, ...where });
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        record = await model.findOne({ where });
      } else {
        throw err;
      }
    }
  }
  return record;
};

/**
 * Idempotent seed helper aligned with existing Admin Dashboard departments,
 * designations, roles, and admin email without overwriting existing records.
 */
export const seedDefaultData = async (): Promise<void> => {
  const currentYear = new Date().getFullYear();

  // 1. Seed Roles (Admin, HR, Manager, Employee)
  const roleSeeds = [
    { name: ROLES.ADMIN, description: 'Full system administration and HRMS control' },
    { name: ROLES.HR, description: 'Human Resources management and approvals' },
    { name: ROLES.MANAGER, description: 'Department/Team manager' },
    { name: ROLES.EMPLOYEE, description: 'Standard employee dashboard access' },
  ];
  const roleMap = new Map<string, Role>();
  for (const r of roleSeeds) {
    const role = await getOrCreate(Role, { name: r.name }, r);
    roleMap.set(r.name, role);
  }

  // 2. Seed Permissions
  const permList = Object.values(PERMISSIONS);
  const permMap = new Map<string, Permission>();
  for (const permName of permList) {
    const perm = await getOrCreate(
      Permission,
      { name: permName },
      {
        name: permName,
        module: permName.split('_').slice(-1)[0] || 'general',
        description: permName,
      }
    );
    permMap.set(permName, perm);
  }

  const adminRole = roleMap.get(ROLES.ADMIN)!;
  const employeeRole = roleMap.get(ROLES.EMPLOYEE)!;

  for (const perm of permMap.values()) {
    await getOrCreate(
      RolePermission,
      { role_id: getId(adminRole), permission_id: getId(perm) },
      { role_id: getId(adminRole), permission_id: getId(perm) }
    );
  }

  const employeePerms = [
    PERMISSIONS.VIEW_EMPLOYEE_DASHBOARD,
    PERMISSIONS.CLOCK_ATTENDANCE,
    PERMISSIONS.REQUEST_ATTENDANCE_CORRECTION,
    PERMISSIONS.APPLY_LEAVE,
    PERMISSIONS.SUBMIT_WORK_UPDATE,
    PERMISSIONS.UPDATE_OWN_TASKS,
    PERMISSIONS.REQUEST_PROFILE_UPDATE,
    PERMISSIONS.VIEW_OWN_HISTORY,
  ];
  for (const pName of employeePerms) {
    const perm = permMap.get(pName);
    if (perm) {
      await getOrCreate(
        RolePermission,
        { role_id: getId(employeeRole), permission_id: getId(perm) },
        { role_id: getId(employeeRole), permission_id: getId(perm) }
      );
    }
  }

  // 3. Seed 4 Core Departments aligned exactly with Admin Frontend (DEPARTMENTS)
  const deptSeeds = [
    {
      name: 'Software Development',
      code: 'SWD',
      description: 'Engineers core enterprise systems, cloud platforms, and product deliverables.',
      monthly_target: '12 Product Sprints & Releases',
      active_projects_count: 0,
    },
    {
      name: 'Digital Marketing',
      code: 'DMK',
      description: 'SEO, social media, content strategy, and brand creative.',
      monthly_target: 'Campaign ROI & Lead Growth',
      active_projects_count: 0,
    },
    {
      name: 'Sales',
      code: 'SLS',
      description: 'Client acquisition, enterprise partnerships, and account growth.',
      monthly_target: 'Quarterly Revenue Pipeline',
      active_projects_count: 0,
    },
    {
      name: 'Administration',
      code: 'ADM',
      description: 'Operations, HR compliance, facilities, and corporate governance.',
      monthly_target: '100% Compliance & Workforce Operations',
      active_projects_count: 0,
    },
  ];
  const deptMap = new Map<string, Department>();
  for (const d of deptSeeds) {
    const dept = await getOrCreate(Department, { name: d.name }, d);
    deptMap.set(d.name, dept);
    // Ensure a primary department Team exists for multiple Team Leads & Leave Rules
    await getOrCreate(
      Team,
      { code: `DEPT-${d.code}` },
      {
        name: `${d.name} Team`,
        code: `DEPT-${d.code}`,
        department_id: getId(dept),
        description: `Primary team for ${d.name}`,
        status: 'Active',
      }
    );
  }

  // 4. Seed Designations aligned exactly with Admin Frontend (DESIGNATIONS_BY_DEPARTMENT)
  const designationsByDept: Record<string, string[]> = {
    'Software Development': [
      'Intern',
      'Junior Developer',
      'Software Engineer',
      'Senior Software Engineer',
      'Team Lead',
    ],
    'Digital Marketing': [
      'SEO Executive',
      'Social Media Executive',
      'Content Writer',
      'Graphic Designer',
    ],
    Sales: ['Sales Executive', 'Senior Sales Executive', 'Sales Manager'],
    Administration: ['Administrator', 'Office Executive', 'Operations Coordinator'],
  };

  const desigMap = new Map<string, Designation>();
  for (const [deptName, titles] of Object.entries(designationsByDept)) {
    const dept = deptMap.get(deptName);
    if (!dept) continue;
    for (const title of titles) {
      const desig = await getOrCreate(
        Designation,
        { title, department_id: getId(dept) },
        { title, department_id: getId(dept), status: 'Active' }
      );
      desigMap.set(title, desig);
    }
  }

  // 5. Seed Leave Types
  const leaveTypeSeeds = [
    {
      name: 'Casual Leave',
      code: 'CL',
      default_days_per_year: 12,
      carry_forward_allowed: false,
      requires_attachment: false,
      description: 'Personal and planned casual time off',
    },
    {
      name: 'Sick Leave',
      code: 'SL',
      default_days_per_year: 10,
      carry_forward_allowed: false,
      requires_attachment: false,
      description: 'Medical recovery and health-related leave',
    },
    {
      name: 'Emergency Leave',
      code: 'EL',
      default_days_per_year: 5,
      carry_forward_allowed: false,
      requires_attachment: false,
      description: 'Unforeseen personal or family emergencies',
    },
  ];
  const leaveTypes: LeaveType[] = [];
  for (const lt of leaveTypeSeeds) {
    const record = await getOrCreate(LeaveType, { code: lt.code }, lt);
    leaveTypes.push(record);
  }

  // 6. Seed Default Settings
  const settingSeeds = [
    { key: 'office_start_time', value: envConfig.officePolicy.startTime, group: 'office_policy', description: 'Standard shift start time (HH:mm)' },
    { key: 'grace_period_minutes', value: String(envConfig.officePolicy.gracePeriodMinutes), group: 'office_policy', description: 'Allowed late grace period in minutes' },
    { key: 'late_threshold_time', value: envConfig.officePolicy.lateThresholdTime, group: 'office_policy', description: 'Time after which check-in is marked Late' },
    { key: 'office_end_time', value: envConfig.officePolicy.endTime, group: 'office_policy', description: 'Standard shift end time (HH:mm)' },
    { key: 'half_day_hours', value: '4', group: 'office_policy', description: 'Minimum working hours before Half Day' },
    { key: 'weekend_days', value: '[0,6]', group: 'leave_policy', description: 'Weekend weekday indexes (0=Sun, 6=Sat)' },
    { key: 'company_name', value: 'Godavari Wave Technologies Pvt. Ltd.', group: 'company', description: 'Official company name' },
  ];
  for (const s of settingSeeds) {
    await getOrCreate(Setting, { key: s.key }, s);
  }

  // 7. Seed Default Admin Account ONLY if no existing admin account exists (never overwrites existing accounts!)
  const adminDept = deptMap.get('Administration')!;
  const existingAdmin = await User.findOne({
    where: {
      [Op.or]: [
        { email: 'admin@godavariwaves.com' },
        { email: 'admin@godavariwave.com' },
        { role_id: getId(adminRole) },
      ],
    },
  });

  if (!existingAdmin) {
    const adminEmail = 'admin@godavariwaves.com';
    const adminUser = await User.create({
      email: adminEmail,
      password_hash: await hashPassword('Admin@123'),
      role_id: getId(adminRole),
      dashboard_access: 'both',
      is_active: true,
    });
    await Employee.create({
      user_id: getId(adminUser),
      employee_code: 'GW-ADM-001',
      first_name: 'Admin',
      last_name: 'User',
      full_name: 'Admin User',
      company_email: adminEmail,
      phone: '+91 98480 10001',
      department_id: getId(adminDept),
      designation_id: desigMap.get('Administrator') ? getId(desigMap.get('Administrator')) : null,
      joining_date: '2024-01-10',
      employment_type: 'Full-Time',
      employment_status: 'Active',
      is_deleted: false,
    });
  }

  // 8. Seed Default Team Leave Rules for department teams if none exist
  const swTeam = await Team.findOne({ where: { code: 'DEPT-SWD' } });
  if (swTeam) {
    await getOrCreate(
      TeamLeaveRule,
      { team_id: getId(swTeam) },
      {
        team_id: getId(swTeam),
        max_concurrent_leaves: 1,
        min_workforce_percentage: 75,
        rule_scope: 'Team',
        department_id: deptMap.get('Software Development') ? getId(deptMap.get('Software Development')) : null,
        allow_admin_override: true,
        status: 'Active',
      }
    );
  }

  // 9. Seed Default Holidays (only if empty)
  const holidayCount = await Holiday.count();
  if (holidayCount === 0) {
    await Holiday.bulkCreate([
      { name: 'Republic Day', date: `${currentYear}-01-26`, type: 'National', description: 'Indian Republic Day', is_optional: false, year: currentYear },
      { name: 'Independence Day', date: `${currentYear}-08-15`, type: 'National', description: 'Indian Independence Day', is_optional: false, year: currentYear },
      { name: 'Gandhi Jayanti', date: `${currentYear}-10-02`, type: 'National', description: 'Birth anniversary of Mahatma Gandhi', is_optional: false, year: currentYear },
      { name: 'Diwali Festival', date: `${currentYear}-11-08`, type: 'Festival', description: 'Festival of Lights', is_optional: false, year: currentYear },
      { name: 'Christmas Day', date: `${currentYear}-12-25`, type: 'Festival', description: 'Christmas celebration', is_optional: false, year: currentYear },
    ]);
  }

  // Keep references to unused imports clean for downstream callers
  void LeaveBalance;
  void TeamMember;
  void CalendarEvent;
  void Announcement;
  void EmployeeHistory;
};

/**
 * Connects to the existing MySQL 8 database without creating/dropping/resetting databases.
 * Models are initialized and verified cleanly; schema changes should be run via safe additive migrations.
 */
export const initializeDatabase = async (): Promise<void> => {
  initAllModels(sequelize);
  await sequelize.authenticate();
  logger.info(
    `Connected to existing MySQL 8 database: ${envConfig.db.name} (${envConfig.db.host}:${envConfig.db.port})`
  );
  // Safe sync: alter:false, force:false — only creates missing tables, never drops or alters existing data
  await sequelize.sync({ alter: false, force: false });
  logger.info('Sequelize models verified against MySQL 8.');
  await seedDefaultData();
  logger.info('Default reference records verified without overwriting existing data.');
};

export default { initializeDatabase, seedDefaultData, sequelize };
