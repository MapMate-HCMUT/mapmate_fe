import { calculateDistanceKm } from '../../../utils/calculateDistance';
import { ALL_CATEGORIES } from './placeCategory';
import { getVehicle } from './quickFilters';

const MINUTES_PER_HOUR = 60;
// Bỏ dấu + ký tự ẩn mà một số bộ gõ chèn vào => gõ có dấu hay không dấu đều tìm được.
const normalize = (text) => text.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').replace(/đ/gi, 'd').toLowerCase();

// Gắn khoảng cách + thời gian di chuyển ước tính, sau đó lọc theo bộ lọc hiện tại.
export const enrichAndFilterPlaces = (places, { origin, vehicle, category, query, budgetMax, radiusKm }) => {
  const { speedKmh } = getVehicle(vehicle);
  const keyword = normalize(query.trim());

  return places
    .map((place) => {
      const distanceKm = calculateDistanceKm(origin, place.location.coordinates);
      return { ...place, distanceKm, travelMinutes: Math.max(1, Math.round((distanceKm / speedKmh) * MINUTES_PER_HOUR)) };
    })
    .filter((place) => category === ALL_CATEGORIES || place.category === category)
    .filter((place) => !keyword || normalize(`${place.name} ${place.address}`).includes(keyword))
    .filter((place) => budgetMax === null || place.price_range.min <= budgetMax)
    .filter((place) => radiusKm === null || place.distanceKm <= radiusKm)
    .sort((a, b) => Number(b.is_trending) - Number(a.is_trending) || b.rating - a.rating);
};
