import { apiClient } from '../../../lib/apiClient';

const MAP_RADIUS_KM = 10;
const MAP_PLACE_LIMIT = 40; // tối đa của API /places/nearby
const DEFAULT_SORT = 'recommended';
// Bấm 1 nhãn trên bản đồ nền: toạ độ nhãn của Goong và của dữ liệu MapMate lệch nhau vài chục mét
const SAME_NAMED_PLACE_KM = 0.12;
const SAME_SPOT_KM = 0.035; // không có tên (bấm chỗ trống) => phải sát hơn mới coi là cùng nơi
const LOOKUP_RADIUS_KM = 1;
const LOOKUP_LIMIT = 3;

// Bản đồ dùng GeoJSON location.coordinates [lng, lat]
const toMapPlace = (place) => ({ ...place, location: { type: 'Point', coordinates: [place.coordinates.lng, place.coordinates.lat] } });
const plain = (text) => text.normalize('NFKD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const sameName = (a, b) => plain(a).includes(plain(b)) || plain(b).includes(plain(a));

// Địa điểm thật trên bản đồ trang chủ — CÙNG nguồn với trang Khám phá (GET /api/places/nearby), nên id dùng chung được cho
// giỏ chuyến đi / gợi ý lộ trình. Có từ khoá => server tìm theo tên trong 20 km (không chỉ lọc trong 40 điểm đã tải).
export const getMapPlaces = async ([lng, lat], query = '') => {
  const data = await apiClient.get('/places/nearby', {
    params: { lat, lng, radius_km: MAP_RADIUS_KM, limit: MAP_PLACE_LIMIT, sort: DEFAULT_SORT, q: query.trim() || undefined, auto_relax: true },
  });
  return data.items.map(toMapPlace);
};

// Địa điểm của MapMate tại chỗ người dùng bấm trên bản đồ (để hiện thẻ đầy đủ: đánh giá, giá, giờ mở cửa...) — không có thì null
export const findPlaceAt = async ([lng, lat], name = null) => {
  const data = await apiClient.get('/places/nearby', {
    params: { lat, lng, radius_km: LOOKUP_RADIUS_KM, limit: LOOKUP_LIMIT, sort: 'distance', q: name ?? undefined },
  });
  const match = data.items.find((place) => (name ? place.distance_km <= SAME_NAMED_PLACE_KM && sameName(place.name, name) : place.distance_km <= SAME_SPOT_KM));
  return match ? toMapPlace(match) : null;
};
