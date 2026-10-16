import { apiClient } from '../../../lib/apiClient';

// Số liệu tổng (người dùng, địa điểm, tuyến buýt...) — đếm thật từ database, server cache 10 phút
export const getPublicStatsApi = () => apiClient.get('/stats/public');
