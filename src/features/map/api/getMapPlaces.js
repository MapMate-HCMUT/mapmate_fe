import { apiClient } from '../../../lib/apiClient';

const MAP_RADIUS_KM = 10;
const MAP_PLACE_LIMIT = 40; // tối đa của API /places/nearby
const DEFAULT_SORT = 'recommended';

// Địa điểm thật trên bản đồ trang chủ — CÙNG nguồn với trang Khám phá (GET /api/places/nearby), nên id dùng chung được cho
// giỏ chuyến đi / gợi ý lộ trình. Có từ khoá => server tìm theo tên trong 20 km (không chỉ lọc trong 40 điểm đã tải).
export const getMapPlaces = async ([lng, lat], query = '') => {
  const data = await apiClient.get('/places/nearby', {
    params: { lat, lng, radius_km: MAP_RADIUS_KM, limit: MAP_PLACE_LIMIT, sort: DEFAULT_SORT, q: query.trim() || undefined, auto_relax: true },
  });
  // Bản đồ dùng GeoJSON location.coordinates [lng, lat]
  return data.items.map((place) => ({ ...place, location: { type: 'Point', coordinates: [place.coordinates.lng, place.coordinates.lat] } }));
};
