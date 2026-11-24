import sequelize from '../config/db.config';
import {
  Employee,
  Department,
  Designation,
  User,
  Role,
  ProfileUpdateRequest,
  EmployeeHistory,
} from '../models';
import { AppError } from '../utils/appError.util';
import notificationService from './notification.service';
import auditLogService from './auditLog.service';

// Protected fields that employees CANNOT directly edit (must go through Admin or are immutable)
const PROTECTED_FIELDS = new Set([
  'id',
  'user_id',
  'employee_code',
  'role_id',
  'department_id',
  'designation_id',
  'salary',
  'employment_status',
  'employment_type',
  'joining_date',
  'company_email',
  'dashboard_access',
  'is_active',
]);

// Fields permitted for Profile Update Request workflow
const REQUESTABLE_PROFILE_FIELDS: Record<string, string> = {
  full_name: 'Full Name',
  phone: 'Phone Number',
  personal_email: 'Personal Email',
  address: 'Residential Address',
  emergency_contact_name: 'Emergency Contact Name',
  emergency_contact_phone: 'Emergency Contact Phone',
  date_of_birth: 'Date of Birth',
  bio: 'Bio',
  skills: 'Skills',
};

export class ProfileService {
  public async getMyProfile(employeeId: number) {
    const employee = await Employee.findByPk(employeeId, {
      attributes: { exclude: ['salary'] },
      include: [
        { model: Department, as: 'department' },
        { model: Designation, as: 'designation' },
        { model: Employee, as: 'reportingManager', attributes: ['id', 'employee_code', 'full_name', 'company_email'] },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'dashboard_access', 'is_active', 'last_login_at'],
          include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
        },
      ],
    });
    if (!employee) throw new AppError('Employee profile not found.', 404);

    const requests = await ProfileUpdateRequest.findAll({
      where: { employee_id: employeeId },
      order: [['createdAt', 'DESC']],
    });

    return {
      profile: employee,
      updateRequests: requests,
      requestableFields: Object.entries(REQUESTABLE_PROFILE_FIELDS).map(([key, label]) => ({
        key,
        label,
      })),
    };
  }

  public async updateProfilePicture(employeeId: number, userId: number, pictureUrl: string) {
    const emp = await Employee.findByPk(employeeId);
    if (!emp) throw new AppError('Employee not found.', 404);
    emp.profile_picture = pictureUrl;
    await emp.save();

    await auditLogService.log({
      userId,
      action: 'UPDATE_PROFILE_PICTURE',
      entityType: 'Employee',
      entityId: employeeId,
    });
    return { profile_picture: pictureUrl };
  }

  public async submitUpdateRequest(
    employeeId: number,
    userId: number,
    dto: { field_name: string; requested_value: string; reason: string }
  ) {
    const field = dto.field_name?.trim();
    if (!field || !dto.requested_value?.trim() || !dto.reason?.trim()) {
      throw new AppError('Field name, requested new value, and reason are required.', 400);
    }

    if (PROTECTED_FIELDS.has(field) || !REQUESTABLE_PROFILE_FIELDS[field]) {
      throw new AppError(
        `Field "${field}" is protected or cannot be requested through employee self-service. Please contact HR.`,
        403
      );
    }

    const emp = await Employee.findByPk(employeeId);
    if (!emp) throw new AppError('Employee not found.', 404);

    const existingPending = await ProfileUpdateRequest.findOne({
      where: { employee_id: employeeId, field_name: field, status: 'Pending' },
    });
    if (existingPending) {
      throw new AppError(`You already have a pending update request for ${REQUESTABLE_PROFILE_FIELDS[field]}.`, 409);
    }

    const currentValue = String((emp as unknown as Record<string, unknown>)[field] ?? '');

    const reqRecord = await ProfileUpdateRequest.create({
      employee_id: employeeId,
      field_name: field,
      current_value: currentValue || 'Not Set',
      requested_value: dto.requested_value.trim(),
      reason: dto.reason.trim(),
      status: 'Pending',
    });

    await notificationService.notifyAdmins(
      'Profile',
      'New Profile Update Request',
      `${emp.full_name} requested to update ${REQUESTABLE_PROFILE_FIELDS[field]}.`,
      '/admin/profile-requests'
    );

    await auditLogService.log({
      userId,
      action: 'SUBMIT_PROFILE_UPDATE_REQUEST',
      entityType: 'ProfileUpdateRequest',
      entityId: reqRecord.id,
      newValues: { field, requestedValue: dto.requested_value },
    });

    return reqRecord;
  }

  public async adminListUpdateRequests(status?: string) {
    const where: Record<string, unknown> = {};
    if (status && status !== 'All') where.status = status;

    return ProfileUpdateRequest.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'employee_code', 'full_name', 'company_email'],
          include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  public async reviewUpdateRequest(
    requestId: number,
    adminUserId: number,
    action: 'Approved' | 'Rejected',
    rejectionReason?: string
  ) {
    const reqRecord = await ProfileUpdateRequest.findByPk(requestId);
    if (!reqRecord) throw new AppError('Profile update request not found.', 404);
    if (reqRecord.status !== 'Pending') {
      throw new AppError(`Request has already been ${reqRecord.status.toLowerCase()}.`, 400);
    }
    if (action === 'Rejected' && !rejectionReason?.trim()) {
      throw new AppError('Please enter a rejection reason.', 400);
    }

    await sequelize.transaction(async (t) => {
      reqRecord.status = action;
      reqRecord.reviewed_by = adminUserId;
      reqRecord.reviewed_at = new Date();
      reqRecord.rejection_reason = action === 'Rejected' ? rejectionReason!.trim() : null;
      await reqRecord.save({ transaction: t });

      if (action === 'Approved' && REQUESTABLE_PROFILE_FIELDS[reqRecord.field_name]) {
        const emp = await Employee.findByPk(reqRecord.employee_id, { transaction: t });
        if (emp) {
          if (reqRecord.field_name === 'full_name') {
            const parts = reqRecord.requested_value.trim().split(/\s+/);
            emp.first_name = parts[0] || emp.first_name;
            emp.last_name = parts.slice(1).join(' ') || emp.last_name;
            emp.full_name = reqRecord.requested_value.trim();
          } else {
            (emp as unknown as Record<string, unknown>)[reqRecord.field_name] = reqRecord.requested_value;
          }
          await emp.save({ transaction: t });

          await EmployeeHistory.create(
            {
              employee_id: emp.id,
              event_type: 'ProfileUpdated',
              title: `Profile Field Updated: ${REQUESTABLE_PROFILE_FIELDS[reqRecord.field_name]}`,
              description: `Approved profile change requested by employee.`,
              old_value: reqRecord.current_value || '',
              new_value: reqRecord.requested_value,
              performed_by: adminUserId,
            },
            { transaction: t }
          );
        }
      }
    });

    await notificationService.notifyEmployee(
      reqRecord.employee_id,
      'Profile',
      `Profile Update ${action}`,
      action === 'Approved'
        ? `Your request to update ${REQUESTABLE_PROFILE_FIELDS[reqRecord.field_name] || reqRecord.field_name} has been approved.`
        : `Your profile update request was rejected. Reason: ${rejectionReason}`,
      '/employee/profile'
    );

    await auditLogService.log({
      userId: adminUserId,
      action: `PROFILE_REQUEST_${action.toUpperCase()}`,
      entityType: 'ProfileUpdateRequest',
      entityId: reqRecord.id,
      newValues: { status: action, rejectionReason },
    });

    return reqRecord;
  }
}

export default new ProfileService();
