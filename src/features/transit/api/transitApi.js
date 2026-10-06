import { apiClient } from '../../../lib/apiClient';

// Giao thông công cộng TP.HCM (xe buýt, Metro số 1, buýt đường sông) — dữ liệu công khai của Trung tâm QLGT công cộng
export const getTransitStopsApi = ({ bbox }) => apiClient.get('/transit/stops', { params: { bbox: bbox.join(',') } });
export const getTransitStopApi = (stopId) => apiClient.get(`/transit/stops/${stopId}`);
export const getStopArrivalsApi = (stopId) => apiClient.get(`/transit/stops/${stopId}/arrivals`);
export const getTransitRouteApi = (routeId) => apiClient.get(`/transit/routes/${routeId}`);
export const getRailLinesApi = () => apiClient.get('/transit/lines');

// Tìm cách đi cho cả chuyến (vị trí hiện tại -> điểm 1 -> điểm 2...) — tính nhiều phương án nên cho phép chờ lâu hơn
export const planTransitTripApi = ({ waypoints, stays, prefs }) =>
  apiClient.post('/transit/trip-plan', { waypoints, stays, priority: prefs.priority, connector: prefs.connector, max_walk_m: prefs.maxWalkM }, { timeout: 30000 });
// Đường đi bộ thật (OpenStreetMap) cho chặng đi bộ của phương án đang chọn
export const getWalkPathApi = (from, to) => apiClient.post('/transit/walk-path', { from, to });
