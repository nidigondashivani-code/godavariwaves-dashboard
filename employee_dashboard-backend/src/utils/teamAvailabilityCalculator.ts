export interface AvailabilityCalculationInput {
  totalTeamMembers: number;
  approvedLeavesCount: number;
  pendingLeavesCount?: number;
}

export interface AvailabilityCalculationResult {
  activeWorkforceCount: number;
  availabilityPercentage: number;
  isMinimumMet: boolean;
}

/**
 * Team Availability Calculator Utility
 * Pure functions to compute coverage percentages and remaining workforce capacity.
 */
export const calculateTeamAvailability = (
  input: AvailabilityCalculationInput,
  minWorkforcePercentage: number = 75
): AvailabilityCalculationResult => {
  const { totalTeamMembers, approvedLeavesCount } = input;
  if (totalTeamMembers <= 0) {
    return { activeWorkforceCount: 0, availabilityPercentage: 100, isMinimumMet: true };
  }

  const activeWorkforceCount = Math.max(0, totalTeamMembers - approvedLeavesCount);
  const availabilityPercentage = Math.round((activeWorkforceCount / totalTeamMembers) * 100);
  const isMinimumMet = availabilityPercentage >= minWorkforcePercentage;

  return {
    activeWorkforceCount,
    availabilityPercentage,
    isMinimumMet,
  };
};
