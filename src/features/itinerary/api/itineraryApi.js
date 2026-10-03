import { apiClient } from '../../../lib/apiClient';

// POST /api/itineraries/suggest { criteria, place_ids } -> { criteria, candidate_count, options[] }
export const suggestItinerariesApi = (criteria, placeIds) => apiClient.post('/itineraries/suggest', { criteria, place_ids: placeIds });

// POST /api/itineraries/preview { criteria, place_ids } -> { stops, summary } cho đúng các điểm đang chọn
export const previewItineraryApi = (criteria, placeIds) => apiClient.post('/itineraries/preview', { criteria, place_ids: placeIds });

// POST /api/itineraries -> lộ trình đã lưu (server tự tính giờ đến & chi phí)
export const createItineraryApi = (payload) => apiClient.post('/itineraries', payload);

export const getMyItinerariesApi = () => apiClient.get('/itineraries');
export const deleteItineraryApi = (itineraryId) => apiClient.delete(`/itineraries/${itineraryId}`);
// POST /api/itineraries/:id/clone -> "Dùng lộ trình này"
export const cloneItineraryApi = (itineraryId) => apiClient.post(`/itineraries/${itineraryId}/clone`);
