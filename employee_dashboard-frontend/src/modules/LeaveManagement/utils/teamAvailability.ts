/**
 * Team Availability Utility (Frontend)
 * Pure formatting and indicator calculations for team availability cards and tables.
 */

export interface TeamCoverageSummary {
  totalMembers: number;
  onLeaveCount: number;
  activeCount: number;
  coveragePercentage: number;
  statusBadge: 'healthy' | 'warning' | 'critical';
}

export const calculateCoverage = (totalMembers: number, onLeaveCount: number): TeamCoverageSummary => {
  if (totalMembers <= 0) {
    return {
      totalMembers: 0,
      onLeaveCount: 0,
      activeCount: 0,
      coveragePercentage: 100,
      statusBadge: 'healthy',
    };
  }

  const activeCount = Math.max(0, totalMembers - onLeaveCount);
  const coveragePercentage = Math.round((activeCount / totalMembers) * 100);

  let statusBadge: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (coveragePercentage < 50) {
    statusBadge = 'critical';
  } else if (coveragePercentage < 75) {
    statusBadge = 'warning';
  }

  return {
    totalMembers,
    onLeaveCount,
    activeCount,
    coveragePercentage,
    statusBadge,
  };
};
