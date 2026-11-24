import { apiClient } from '../../../api/apiClient';
import { ITeamLeaveRule, ICreateTeamLeaveRuleDTO, IUpdateTeamLeaveRuleDTO } from '../types/TeamLeaveRule';
import { ILeaveConflict, ICheckConflictParams, IConflictCheckResult } from '../types/LeaveConflict';

export const teamLeaveRuleService = {
  getRules: async (): Promise<ITeamLeaveRule[]> => {
    const res = await apiClient.get('/team-leave-rules');
    return res.data?.data || [];
  },

  getRuleByTeam: async (teamId: number): Promise<ITeamLeaveRule | null> => {
    const res = await apiClient.get(`/team-leave-rules/team/${teamId}`);
    return res.data?.data || null;
  },

  createRule: async (data: ICreateTeamLeaveRuleDTO): Promise<ITeamLeaveRule> => {
    const res = await apiClient.post('/team-leave-rules', data);
    return res.data?.data;
  },

  updateRule: async (id: number, data: IUpdateTeamLeaveRuleDTO): Promise<ITeamLeaveRule> => {
    const res = await apiClient.put(`/team-leave-rules/${id}`, data);
    return res.data?.data;
  },

  deleteRule: async (id: number): Promise<void> => {
    await apiClient.delete(`/team-leave-rules/${id}`);
  },

  checkConflict: async (params: ICheckConflictParams): Promise<IConflictCheckResult> => {
    const res = await apiClient.post('/team-leave-rules/check-conflict', params);
    return res.data?.data || { hasConflict: false, conflicts: [] };
  },

  getConflictHistory: async (teamId?: number): Promise<ILeaveConflict[]> => {
    const url = teamId ? `/team-leave-rules/conflicts?teamId=${teamId}` : '/team-leave-rules/conflicts';
    const res = await apiClient.get(url);
    return res.data?.data || [];
  },
};

export default teamLeaveRuleService;
