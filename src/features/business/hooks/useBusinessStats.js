import { useAsyncData } from '../../../hooks/useAsyncData';
import { getBusinessStatsApi } from '../api/businessApi';

// Thống kê theo ngày — số ngày tối đa tuỳ gói (server tự giới hạn)
export const useBusinessStats = (days) => {
  const { data, error, isLoading, reload } = useAsyncData(() => getBusinessStatsApi(days), days);
  return { stats: data, error, isLoading, reload };
};
