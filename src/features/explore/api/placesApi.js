import { apiClient } from '../../../lib/apiClient';

// GET /api/places/filter-options -> mọi lựa chọn của bộ lọc (loại hình, phong cách, phương tiện, quận...)
export const getFilterOptionsApi = () => apiClient.get('/places/filter-options');

// GET /api/places/nearby -> { items, page, limit, total, has_more }
export const getNearbyPlacesApi = (params) => apiClient.get('/places/nearby', { params });

// POST /api/places/:id/reports { type: 'closed' | 'open' } -> { status, report_counts, my_report }
export const reportPlaceStatusApi = (placeId, type, note = '') => apiClient.post(`/places/${placeId}/reports`, { type, note });
// DELETE /api/places/:id/reports -> gỡ phiếu của mình (báo nhầm) -> { status, report_counts, my_report: null }
export const undoPlaceReportApi = (placeId) => apiClient.delete(`/places/${placeId}/reports`);
