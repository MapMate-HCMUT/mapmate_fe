import axios from 'axios';
import { GOONG_API_KEY } from '../../../config/map';

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
  const response = await axios.get('https://rsapi.goong.io/Geocode', { params: { latlng: `${lat},${lng}`, api_key: GOONG_API_KEY }, timeout: 8000 });
  const [result] = response.data?.results ?? [];
  const info = result ? { name: result.name || null, address: toAddress(result), district: result.compound?.district ?? null } : null;
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, info);
  return info;
};

// Địa chỉ -> toạ độ (Goong Geocoding), giới hạn quanh TP.HCM. Dùng ở ô tìm địa chỉ khi chủ quán chọn vị trí cửa hàng.
export const geocodeAddress = async (address) => {
  const response = await axios.get('https://rsapi.goong.io/geocode', { params: { address: `${address}, Hồ Chí Minh`, api_key: GOONG_API_KEY }, timeout: 8000 });
  const [result] = response.data?.results ?? [];
  if (!result?.geometry?.location) return null;
  const { lat, lng } = result.geometry.location;
  return { coordinates: [lng, lat], address: toAddress(result), district: result.compound?.district ?? null };
};
