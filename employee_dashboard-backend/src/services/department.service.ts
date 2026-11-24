import { Op } from 'sequelize';
import {
  Department,
  Designation,
  Employee,
  Team,
  TeamMember,
  AuditLog,
} from '../models';
import { AppError } from '../utils/appError.util';
import auditLogService from './auditLog.service';
import notificationService from './notification.service';

export class DepartmentService {
  private async ensureDepartmentTeam(dept: Department): Promise<Team> {
    const existing = await Team.findOne({ where: { department_id: dept.id } });
    if (existing) return existing;

    const code = `DEPT-${dept.code || dept.id}`.slice(0, 30);
    const [team] = await Team.findOrCreate({
      where: { code },
      defaults: {
        name: `${dept.name} Team`,
        code,
        department_id: dept.id,
        description: `Primary team for ${dept.name}`,
        status: 'Active',
      },
    });
    return team;
  }

  public async listDepartments() {
    const departments = await Department.findAll({
      include: [
        { model: Designation, as: 'designations', where: { status: 'Active' }, required: false },
        {
          model: Employee,
          as: 'employees',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'employee_code', 'full_name', 'company_email', 'phone', 'profile_picture', 'employment_status', 'designation_id'],
          include: [{ model: Designation, as: 'designation', attributes: ['id', 'title'] }],
        },
        {
          model: Team,
          as: 'teams',
          required: false,
          include: [
            {
              model: TeamMember,
              as: 'members',
              where: { is_lead: true, status: 'Active' },
              required: false,
              include: [
                {
                  model: Employee,
                  as: 'employee',
                  where: { is_deleted: false, employment_status: 'Active' },
                  required: true,
                  attributes: ['id', 'employee_code', 'full_name', 'company_email', 'phone', 'profile_picture', 'employment_status'],
                  include: [{ model: Designation, as: 'designation', attributes: ['id', 'title'] }],
                },
              ],
            },
          ],
        },
      ],
      order: [['id', 'ASC']],
    });

    return departments.map((d) => {
      const json = d.toJSON() as unknown as Record<string, unknown>;
      const teams = (d.get('teams') as Array<Team & { members?: Array<TeamMember & { employee?: Employee & { designation?: Designation } }> }>) || [];
      const leadMap = new Map<number, Record<string, unknown>>();

      for (const t of teams) {
        for (const m of t.members || []) {
          if (m.employee && !leadMap.has(Number(m.employee.id))) {
            leadMap.set(Number(m.employee.id), {
              id: m.id,
              employeeId: m.employee.id,
              employeeCode: m.employee.employee_code,
              name: m.employee.full_name,
              companyEmail: m.employee.company_email,
              phone: m.employee.phone,
              avatar: m.employee.profile_picture,
              designation: m.employee.designation?.title || m.role_in_team || 'Team Lead',
              assignedDate: m.createdAt,
              status: m.employee.employment_status,
            });
          }
        }
      }

      const teamLeads = Array.from(leadMap.values());
      const employees = (d.get('employees') as Employee[]) || [];

      return {
        ...json,
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.employment_status === 'Active').length,
        teamLeads,
        teamLeadCount: teamLeads.length,
        teamLead: teamLeads[0] || null,
      };
    });
  }

  public async getDepartmentById(id: number) {
    const all = await this.listDepartments();
    const dept = all.find((d) => Number((d as Record<string, unknown>).id) === Number(id));
    if (!dept) throw new AppError('Department not found.', 404);
    return dept;
  }

  public async createDepartment(
    adminUserId: number,
    dto: {
      name: string;
      code?: string;
      description?: string;
      monthly_target?: string;
      active_projects_count?: number;
      status?: 'Active' | 'Inactive';
    }
  ) {
    if (!dto.name?.trim()) throw new AppError('Department name is required.', 400);
    const code = (dto.code?.trim() || dto.name.trim().replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || `D${Date.now() % 1000}`);

    const dept = await Department.create({
      name: dto.name.trim(),
      code,
      description: dto.description?.trim() || null,
      monthly_target: dto.monthly_target?.trim() || null,
      active_projects_count: Number(dto.active_projects_count || 0),
      status: dto.status || 'Active',
    });

    await this.ensureDepartmentTeam(dept);

    await auditLogService.log({
      userId: adminUserId,
      action: 'CREATE_DEPARTMENT',
      entityType: 'Department',
      entityId: dept.id,
      newValues: { name: dept.name, code: dept.code },
    });

    return this.getDepartmentById(dept.id);
  }

  public async updateDepartment(
    id: number,
    adminUserId: number,
    dto: Partial<{
      name: string;
      description: string;
      monthly_target: string;
      active_projects_count: number;
      status: 'Active' | 'Inactive';
    }>
  ) {
    const dept = await Department.findByPk(id);
    if (!dept) throw new AppError('Department not found.', 404);

    const oldVal = { name: dept.name, description: dept.description, monthly_target: dept.monthly_target, status: dept.status };
    if (dto.name !== undefined) dept.name = dto.name.trim();
    if (dto.description !== undefined) dept.description = dto.description.trim();
    if (dto.monthly_target !== undefined) dept.monthly_target = dto.monthly_target.trim();
    if (dto.active_projects_count !== undefined) dept.active_projects_count = Number(dto.active_projects_count);
    if (dto.status !== undefined) dept.status = dto.status;
    await dept.save();

    await auditLogService.log({
      userId: adminUserId,
      action: 'UPDATE_DEPARTMENT',
      entityType: 'Department',
      entityId: dept.id,
      oldValues: oldVal,
      newValues: dto,
    });

    return this.getDepartmentById(dept.id);
  }

  /**
   * Assign an active employee as a Team Lead for their department (reusing Team + TeamMember).
   * Enforces: active status, same department, no duplicate lead assignment.
   */
  public async assignTeamLead(departmentId: number, employeeId: number, adminUserId: number) {
    const dept = await Department.findByPk(departmentId);
    if (!dept) throw new AppError('Department not found.', 404);

    const emp = await Employee.findOne({ where: { id: employeeId, is_deleted: false } });
    if (!emp) throw new AppError('Employee not found.', 404);
    if (emp.employment_status !== 'Active') {
      throw new AppError('Only active employees can be assigned as Team Lead.', 400);
    }
    if (Number(emp.department_id) !== Number(departmentId)) {
      throw new AppError(`Employee must belong to ${dept.name} to be assigned as its Team Lead.`, 400);
    }

    const team = await this.ensureDepartmentTeam(dept);
    const existing = await TeamMember.findOne({
      where: { team_id: team.id, employee_id: emp.id },
    });

    if (existing && existing.is_lead && existing.status === 'Active') {
      throw new AppError(`${emp.full_name} is already assigned as a Team Lead for ${dept.name}.`, 409);
    }

    if (existing) {
      existing.is_lead = true;
      existing.status = 'Active';
      existing.role_in_team = 'Team Lead';
      await existing.save();
    } else {
      await TeamMember.create({
        team_id: team.id,
        employee_id: emp.id,
        role_in_team: 'Team Lead',
        is_lead: true,
        status: 'Active',
      });
    }

    await notificationService.notifyEmployee(
      emp.id,
      'System',
      'Assigned as Department Team Lead',
      `You have been assigned as a Team Lead for ${dept.name}.`,
      '/employee/profile'
    );

    await auditLogService.log({
      userId: adminUserId,
      action: 'ASSIGN_TEAM_LEAD',
      entityType: 'Department',
      entityId: dept.id,
      newValues: { employeeId: emp.id, employeeName: emp.full_name, department: dept.name },
    });

    return this.getDepartmentById(dept.id);
  }

  public async removeTeamLead(departmentId: number, employeeId: number, adminUserId: number) {
    const dept = await Department.findByPk(departmentId);
    if (!dept) throw new AppError('Department not found.', 404);

    const teams = await Team.findAll({ where: { department_id: departmentId } });
    const teamIds = teams.map((t) => t.id);

    if (teamIds.length > 0) {
      await TeamMember.update(
        { is_lead: false },
        { where: { team_id: { [Op.in]: teamIds }, employee_id: employeeId } }
      );
    }

    await auditLogService.log({
      userId: adminUserId,
      action: 'REMOVE_TEAM_LEAD',
      entityType: 'Department',
      entityId: departmentId,
      oldValues: { employeeId },
    });

    return this.getDepartmentById(departmentId);
  }

  /**
   * Cascade helper: automatically revokes active Team Lead assignments when an employee is deactivated or soft-deleted.
   */
  public async purgeTeamLeadForEmployee(employeeId: number) {
    await TeamMember.update(
      { is_lead: false, status: 'Inactive' },
      { where: { employee_id: employeeId } }
    );
  }

  // ---- Designations CRUD ----
  public async listDesignations(departmentId?: number) {
    const where: Record<string, unknown> = { status: 'Active' };
    if (departmentId) where.department_id = departmentId;
    return Designation.findAll({
      where,
      include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }],
      order: [['department_id', 'ASC'], ['title', 'ASC']],
    });
  }

  public async createDesignation(
    adminUserId: number,
    dto: { title: string; department_id?: number | null; level?: string; description?: string }
  ) {
    if (!dto.title?.trim()) throw new AppError('Designation title is required.', 400);

    const existing = await Designation.findOne({
      where: {
        title: dto.title.trim(),
        department_id: dto.department_id ?? null,
        status: 'Active',
      },
    });
    if (existing) {
      throw new AppError('This designation already exists in the selected department.', 409);
    }

    const designation = await Designation.create({
      title: dto.title.trim(),
      department_id: dto.department_id ?? null,
      level: dto.level || null,
      description: dto.description || null,
      status: 'Active',
    });

    await auditLogService.log({
      userId: adminUserId,
      action: 'CREATE_DESIGNATION',
      entityType: 'Designation',
      entityId: designation.id,
      newValues: { title: designation.title, department_id: designation.department_id },
    });

    return designation;
  }

  public async updateDesignation(
    id: number,
    adminUserId: number,
    dto: Partial<{ title: string; department_id: number | null; level: string; description: string; status: 'Active' | 'Inactive' }>
  ) {
    const designation = await Designation.findByPk(id);
    if (!designation) throw new AppError('Designation not found.', 404);

    const oldTitle = designation.title;
    if (dto.title !== undefined) designation.title = dto.title.trim();
    if (dto.department_id !== undefined) designation.department_id = dto.department_id;
    if (dto.level !== undefined) designation.level = dto.level;
    if (dto.description !== undefined) designation.description = dto.description;
    if (dto.status !== undefined) designation.status = dto.status;
    await designation.save();

    await auditLogService.log({
      userId: adminUserId,
      action: 'UPDATE_DESIGNATION',
      entityType: 'Designation',
      entityId: designation.id,
      oldValues: { title: oldTitle },
      newValues: { title: designation.title },
    });

    return designation;
  }

  public async deleteDesignation(id: number, adminUserId: number) {
    const designation = await Designation.findByPk(id);
    if (!designation) throw new AppError('Designation not found.', 404);

    const assignedCount = await Employee.count({
      where: { designation_id: id, is_deleted: false },
    });
    if (assignedCount > 0) {
      throw new AppError(
        `Cannot delete designation "${designation.title}" because ${assignedCount} active employee(s) hold it.`,
        409
      );
    }

    designation.status = 'Inactive';
    await designation.save();

    await auditLogService.log({
      userId: adminUserId,
      action: 'DELETE_DESIGNATION',
      entityType: 'Designation',
      entityId: id,
    });

    return { deleted: true };
  }

  public async getDepartmentActivities(limit = 25) {
    return AuditLog.findAll({
      where: { entity_type: { [Op.in]: ['Department', 'Designation'] } },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}

export default new DepartmentService();
