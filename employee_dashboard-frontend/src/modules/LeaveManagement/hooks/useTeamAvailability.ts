import { useState, useEffect, useCallback } from 'react';
import { apiClient, extractApiError } from '../../../api/apiClient';

export interface UseTeamAvailabilityOptions {
  teamId?: number;
  date?: string;
}

export const useTeamAvailability = (options: UseTeamAvailabilityOptions = {}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [availability, setAvailability] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!options.teamId) return;
    setLoading(true);
    setError(null);
    try {
      const url = options.date
        ? `/team-leave-rules/availability/${options.teamId}?date=${options.date}`
        : `/team-leave-rules/availability/${options.teamId}`;
      const res = await apiClient.get(url);
      setAvailability(res.data?.data || null);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [options.teamId, options.date]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    loading,
    availability,
    error,
    refetch: fetchAvailability,
  };
};

export default useTeamAvailability;
