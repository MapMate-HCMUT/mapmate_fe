import { useCallback } from 'react';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { getLeaderboardApi } from '../api/gamificationApi';
import { useLeaderboardStore } from '../stores/leaderboardStore';
import { LEADERBOARD_LIMIT } from '../utils/leaderboard';

export const useLeaderboard = () => {
  const { period, setPeriod } = useLeaderboardStore();
  const fetchLeaderboard = useCallback(() => getLeaderboardApi({ period, limit: LEADERBOARD_LIMIT }), [period]);
  const { data, error, isLoading, reload } = useAsyncData(fetchLeaderboard, period);

  return { period, setPeriod, rankings: data?.rankings ?? [], me: data?.me, error, isLoading, reload };
};
