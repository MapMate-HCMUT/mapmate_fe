import { apiClient } from '../../../lib/apiClient';

// POST /api/itineraries/suggest { criteria, place_ids } -> { criteria, candidate_count, options[] }
export const suggestItinerariesApi = (criteria, placeIds) => apiClient.post('/itineraries/suggest', { criteria, place_ids: placeIds });

// POST /api/itineraries/preview { criteria, place_ids, keep_order?, stay_overrides? } -> { stops, summary } cho đúng các điểm đang chọn
// keepOrder + stayOverrides { placeId: phút }: người dùng chỉnh thời gian ở lại 1 lộ trình đã gợi ý => server tính lại giờ giấc
export const previewItineraryApi = (criteria, placeIds, { keepOrder = false, stayOverrides } = {}) =>
  apiClient.post('/itineraries/preview', { criteria, place_ids: placeIds, keep_order: keepOrder, ...(stayOverrides ? { stay_overrides: stayOverrides } : {}) });

// POST /api/itineraries -> lộ trình đã lưu (server tự tính giờ đến & chi phí)
export const createItineraryApi = (payload) => apiClient.post('/itineraries', payload);

export const getMyItinerariesApi = () => apiClient.get('/itineraries');
export const updateItineraryApi = (itineraryId, payload) => apiClient.patch(`/itineraries/${itineraryId}`, payload);
export const deleteItineraryApi = (itineraryId) => apiClient.delete(`/itineraries/${itineraryId}`);
// POST /api/itineraries/:id/clone -> "Dùng lộ trình này"
export const cloneItineraryApi = (itineraryId) => apiClient.post(`/itineraries/${itineraryId}/clone`);
