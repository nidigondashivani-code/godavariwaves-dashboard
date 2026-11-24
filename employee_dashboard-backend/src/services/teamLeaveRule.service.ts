import { Op } from 'sequelize';
import {
  Team,
  TeamMember,
  TeamLeaveRule,
  LeaveConflict,
  LeaveRequest,
  Employee,
  Department,
  Designation,
} from '../models';
import { TeamLeaveRuleCreationAttributes, TeamLeaveRuleAttributes } from '../models/TeamLeaveRule';
import { calculateTeamAvailability } from '../utils/teamAvailabilityCalculator';
import { getTodayDateString } from '../utils/dateUtils.util';

export class TeamLeaveRuleService {
  public async getAllRules() {
    return TeamLeaveRule.findAll({
      include: [
        { model: Team, as: 'team' },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  public async getRuleById(id: number) {
    return TeamLeaveRule.findByPk(id, { include: [{ model: Team, as: 'team' }] });
  }

  public async getRuleByTeamId(teamId: number) {
    return TeamLeaveRule.findOne({ where: { team_id: teamId, status: 'Active' } });
  }

  public async createRule(data: TeamLeaveRuleCreationAttributes) {
    return TeamLeaveRule.create(data);
  }

  public async updateRule(id: number, data: Partial<TeamLeaveRuleAttributes>) {
    const rule = await TeamLeaveRule.findByPk(id);
    if (!rule) return null;
    await rule.update(data);
    return rule;
  }

  public async deleteRule(id: number) {
    return TeamLeaveRule.destroy({ where: { id } });
  }

  public async getTeamAvailability(teamId: number, date = getTodayDateString()) {
    const team = await Team.findByPk(teamId);
    const members = await TeamMember.findAll({
      where: { team_id: teamId, status: 'Active' },
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] }],
    });
    const rule = await this.getRuleByTeamId(teamId);
    const memberIds = members.map((m) => m.employee_id);

    const leaves = memberIds.length
      ? await LeaveRequest.findAll({
          where: {
            employee_id: { [Op.in]: memberIds },
            status: 'Approved',
            start_date: { [Op.lte]: date },
            end_date: { [Op.gte]: date },
          },
        })
      : [];

    const onLeaveSet = new Set(leaves.map((l) => l.employee_id));
    const calc = calculateTeamAvailability(
      { totalTeamMembers: members.length, approvedLeavesCount: onLeaveSet.size },
      Number(rule?.min_workforce_percentage || 75)
    );

    return {
      teamId,
      teamName: team?.name || 'Team',
      date,
      totalMembers: members.length,
      presentMembers: calc.activeWorkforceCount,
      onLeaveMembers: onLeaveSet.size,
      availabilityPercentage: calc.availabilityPercentage,
      isMinimumMet: calc.isMinimumMet,
      members: members.map((m) => {
        const emp = m.get('employee') as Employee | undefined;
        return {
          employeeId: m.employee_id,
          fullName: emp?.full_name || '',
          employeeCode: emp?.employee_code || '',
          roleInTeam: m.role_in_team,
          isLead: m.is_lead,
          status: onLeaveSet.has(m.employee_id) ? 'On Leave' : 'Available',
        };
      }),
    };
  }

  public async getConflictHistory(teamId?: number) {
    const where: Record<string, unknown> = {};
    if (teamId) where.team_id = teamId;
    return LeaveConflict.findAll({
      where,
      include: [
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: Employee, as: 'conflictingEmployee', attributes: ['id', 'full_name', 'employee_code'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}

export default new TeamLeaveRuleService();
