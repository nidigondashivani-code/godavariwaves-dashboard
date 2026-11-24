import { Sequelize } from 'sequelize';
import sequelize from '../config/db.config';

import Role from './Role.model';
import Permission from './Permission.model';
import RolePermission from './RolePermission.model';
import Department from './Department.model';
import Designation from './Designation.model';
import User from './User.model';
import Employee from './Employee.model';
import Team from './Team';
import TeamMember from './TeamMember';
import TeamLeaveRule from './TeamLeaveRule';
import LeaveConflict from './LeaveConflict';
import Attendance from './Attendance.model';
import AttendanceLog from './AttendanceLog.model';
import AttendanceCorrection from './AttendanceCorrection.model';
import LeaveType from './LeaveType.model';
import LeaveBalance from './LeaveBalance.model';
import LeaveRequest from './LeaveRequest.model';
import Holiday from './Holiday.model';
import CalendarEvent from './CalendarEvent.model';
import Task from './Task.model';
import TaskAssignment from './TaskAssignment.model';
import TaskUpdate from './TaskUpdate.model';
import WorkUpdate from './WorkUpdate.model';
import PerformanceReview from './PerformanceReview.model';
import Announcement from './Announcement.model';
import Notification from './Notification.model';
import EmployeeHistory from './EmployeeHistory.model';
import ProfileUpdateRequest from './ProfileUpdateRequest.model';
import AuditLog from './AuditLog.model';
import Setting from './Setting.model';

export const initAllModels = (db: Sequelize = sequelize) => {
  Role.initModel(db);
  Permission.initModel(db);
  RolePermission.initModel(db);
  Department.initModel(db);
  Designation.initModel(db);
  User.initModel(db);
  Employee.initModel(db);
  Team.initModel(db);
  TeamMember.initModel(db);
  TeamLeaveRule.initModel(db);
  LeaveConflict.initModel(db);
  Attendance.initModel(db);
  AttendanceLog.initModel(db);
  AttendanceCorrection.initModel(db);
  LeaveType.initModel(db);
  LeaveBalance.initModel(db);
  LeaveRequest.initModel(db);
  Holiday.initModel(db);
  CalendarEvent.initModel(db);
  Task.initModel(db);
  TaskAssignment.initModel(db);
  TaskUpdate.initModel(db);
  WorkUpdate.initModel(db);
  PerformanceReview.initModel(db);
  Announcement.initModel(db);
  Notification.initModel(db);
  EmployeeHistory.initModel(db);
  ProfileUpdateRequest.initModel(db);
  AuditLog.initModel(db);
  Setting.initModel(db);

  // Associations
  Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', as: 'permissions' });
  Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', as: 'roles' });

  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

  User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });
  Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  Department.hasMany(Designation, { foreignKey: 'department_id', as: 'designations' });
  Designation.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

  Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
  Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

  Designation.hasMany(Employee, { foreignKey: 'designation_id', as: 'employees' });
  Employee.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' });

  Employee.belongsTo(Employee, { foreignKey: 'reporting_manager_id', as: 'reportingManager' });

  // Teams & Leave Rules
  Department.hasMany(Team, { foreignKey: 'department_id', as: 'teams' });
  Team.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

  Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'members' });
  TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
  Employee.hasMany(TeamMember, { foreignKey: 'employee_id', as: 'teamMemberships' });
  TeamMember.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  Team.hasMany(TeamLeaveRule, { foreignKey: 'team_id', as: 'leaveRules' });
  TeamLeaveRule.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
  Department.hasMany(TeamLeaveRule, { foreignKey: 'department_id', as: 'departmentLeaveRules' });
  TeamLeaveRule.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Designation.hasMany(TeamLeaveRule, { foreignKey: 'designation_id', as: 'designationLeaveRules' });
  TeamLeaveRule.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' });

  LeaveConflict.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
  LeaveConflict.belongsTo(TeamLeaveRule, { foreignKey: 'rule_id', as: 'rule' });
  LeaveConflict.belongsTo(LeaveRequest, { foreignKey: 'leave_request_id', as: 'leaveRequest' });
  LeaveConflict.belongsTo(LeaveRequest, { foreignKey: 'existing_leave_request_id', as: 'existingLeaveRequest' });
  LeaveConflict.belongsTo(Employee, { foreignKey: 'conflicting_employee_id', as: 'conflictingEmployee' });

  // Attendance
  Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendanceRecords' });
  Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  Attendance.hasMany(AttendanceLog, { foreignKey: 'attendance_id', as: 'logs' });
  AttendanceLog.belongsTo(Attendance, { foreignKey: 'attendance_id', as: 'attendance' });

  Employee.hasMany(AttendanceCorrection, { foreignKey: 'employee_id', as: 'attendanceCorrections' });
  AttendanceCorrection.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  AttendanceCorrection.belongsTo(Attendance, { foreignKey: 'attendance_id', as: 'attendance' });
  AttendanceCorrection.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // Leaves
  Employee.hasMany(LeaveBalance, { foreignKey: 'employee_id', as: 'leaveBalances' });
  LeaveBalance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  LeaveType.hasMany(LeaveBalance, { foreignKey: 'leave_type_id', as: 'balances' });
  LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leave_type_id', as: 'leaveType' });

  Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id', as: 'leaveRequests' });
  LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  LeaveType.hasMany(LeaveRequest, { foreignKey: 'leave_type_id', as: 'requests' });
  LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leave_type_id', as: 'leaveType' });
  LeaveRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // Tasks
  Employee.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
  Task.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignee' });
  Task.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });
  Task.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

  Task.hasMany(TaskUpdate, { foreignKey: 'task_id', as: 'updates' });
  TaskUpdate.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
  TaskUpdate.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  Task.hasMany(TaskAssignment, { foreignKey: 'task_id', as: 'assignments' });
  TaskAssignment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
  TaskAssignment.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  // Work Updates
  Employee.hasMany(WorkUpdate, { foreignKey: 'employee_id', as: 'workUpdates' });
  WorkUpdate.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  WorkUpdate.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // Performance Reviews
  Employee.hasMany(PerformanceReview, { foreignKey: 'employee_id', as: 'performanceReviews' });
  PerformanceReview.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  PerformanceReview.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

  // Announcements & Calendar
  Announcement.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

  CalendarEvent.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  CalendarEvent.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Notifications
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Employee History & Profile Requests
  Employee.hasMany(EmployeeHistory, { foreignKey: 'employee_id', as: 'historyRecords' });
  EmployeeHistory.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  Employee.hasMany(ProfileUpdateRequest, { foreignKey: 'employee_id', as: 'profileUpdateRequests' });
  ProfileUpdateRequest.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  ProfileUpdateRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // Audit Logs
  AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'actor' });
};

export {
  sequelize,
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
  LeaveConflict,
  Attendance,
  AttendanceLog,
  AttendanceCorrection,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday,
  CalendarEvent,
  Task,
  TaskAssignment,
  TaskUpdate,
  WorkUpdate,
  PerformanceReview,
  Announcement,
  Notification,
  EmployeeHistory,
  ProfileUpdateRequest,
  AuditLog,
  Setting,
};
