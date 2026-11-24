import { useState } from 'react';
import { ICheckConflictParams, IConflictCheckResult } from '../types/LeaveConflict';
import teamLeaveRuleService from '../services/teamLeaveRule.service';

export const useLeaveConflict = () => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [conflictResult, setConflictResult] = useState<IConflictCheckResult | null>(null);

  const checkConflict = async (params: ICheckConflictParams): Promise<IConflictCheckResult> => {
    setIsChecking(true);
    try {
      const result = await teamLeaveRuleService.checkConflict(params);
      setConflictResult(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  const clearConflict = () => {
    setConflictResult(null);
  };

  return {
    isChecking,
    conflictResult,
    checkConflict,
    clearConflict,
  };
};

export default useLeaveConflict;
