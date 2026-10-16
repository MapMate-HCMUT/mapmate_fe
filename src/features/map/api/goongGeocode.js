import { apiClient } from '../../../lib/apiClient';

// Gọi Goong qua backend (/api/geo) — key Goong không nằm trong trình duyệt.
// Toạ độ -> tên + địa chỉ (Goong Reverse Geocoding). Dùng khi người dùng bấm 1 điểm bất kỳ trên bản đồ.
// Cache theo toạ độ làm tròn ~1 m: bấm lại đúng chỗ cũ không gọi Goong lần nữa (Goong chặn khi gọi dồn).
const CACHE_MAX = 100;
const COORD_DECIMALS = 5;
const cache = new Map();

// Goong trả "District 1" trong formatted_address; phần "compound" có tên tiếng Việt (Quận 1, phường)
const toAddress = (result) => {
  const { commune, district, province } = result.compound ?? {};
  const parts = [result.name, commune, district, province].filter(Boolean);
  return parts.length > 1 ? [...new Set(parts)].join(', ') : result.formatted_address ?? '';
};

export const reverseGeocode = async ([lng, lat]) => {
  const key = `${lng.toFixed(COORD_DECIMALS)},${lat.toFixed(COORD_DECIMALS)}`;
  if (cache.has(key)) return cache.get(key);
  const data = await apiClient.get('/geo/reverse', { params: { lat, lng } });
  const [result] = data?.results ?? [];
  const info = result ? { name: result.name || null, address: toAddress(result), district: result.compound?.district ?? null } : null;
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, info);
  return info;
};

// Tìm địa chỉ / tên địa điểm -> tối đa `limit` kết quả (chọn điểm xuất phát khi chỉ đường). Gọi khi bấm Tìm, không gọi theo từng phím.
export const searchAddresses = async (query, limit = 5) => {
  const data = await apiClient.get('/geo/geocode', { params: { address: query } });
  return (data?.results ?? [])
    .filter((result) => result.geometry?.location)
    .slice(0, limit)
    .map((result) => ({
      id: result.place_id ?? `${result.geometry.location.lat},${result.geometry.location.lng}`,
      name: result.name || result.formatted_address,
      address: toAddress(result),
      coordinates: [result.geometry.location.lng, result.geometry.location.lat],
    }));
};

// Địa chỉ -> toạ độ (Goong Geocoding), giới hạn quanh TP.HCM. Dùng ở ô tìm địa chỉ khi chủ quán chọn vị trí cửa hàng.
export const geocodeAddress = async (address) => {
  const data = await apiClient.get('/geo/geocode', { params: { address } });
  const [result] = data?.results ?? [];
  if (!result?.geometry?.location) return null;
  const { lat, lng } = result.geometry.location;
  return { coordinates: [lng, lat], address: toAddress(result), district: result.compound?.district ?? null };
};
