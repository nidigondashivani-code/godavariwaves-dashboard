/**
 * Leave Rule Constants
 * Enterprise standards for team concurrency rules and conflict statuses.
 */
export const LEAVE_RULE_CONSTANTS = {
  DEFAULT_MAX_CONCURRENT_LEAVES: 1,
  DEFAULT_MIN_WORKFORCE_PERCENTAGE: 75.0,
  SCOPES: {
    TEAM: 'Team',
    DESIGNATION: 'Designation',
    DEPARTMENT: 'Department',
    GLOBAL: 'Global',
  },
  CONFLICT_STATUSES: {
    DETECTED: 'Detected',
    RESOLVED: 'Resolved',
    OVERRIDDEN: 'Overridden',
    REJECTED: 'Rejected',
  },
  RULE_STATUSES: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
  },
} as const;

export default LEAVE_RULE_CONSTANTS;
