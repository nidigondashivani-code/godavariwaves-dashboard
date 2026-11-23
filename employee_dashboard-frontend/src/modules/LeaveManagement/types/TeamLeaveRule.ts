export type RuleScope = 'Team' | 'Designation' | 'Department' | 'Global';
export type RuleStatus = 'Active' | 'Inactive';

export interface ITeamLeaveRule {
  id: number;
  team_id: number;
  team_name?: string;
  max_concurrent_leaves: number;
  min_workforce_percentage: number;
  rule_scope: RuleScope;
  designation_id?: number | null;
  designation_title?: string;
  department_id?: number | null;
  department_name?: string;
  allow_admin_override: boolean;
  status: RuleStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateTeamLeaveRuleDTO {
  team_id: number;
  max_concurrent_leaves: number;
  min_workforce_percentage?: number;
  rule_scope?: RuleScope;
  designation_id?: number | null;
  department_id?: number | null;
  allow_admin_override?: boolean;
}

export interface IUpdateTeamLeaveRuleDTO extends Partial<ICreateTeamLeaveRuleDTO> {
  status?: RuleStatus;
}
