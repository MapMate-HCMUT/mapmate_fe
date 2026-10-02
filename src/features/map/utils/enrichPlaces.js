import { calculateDistanceKm } from '../../../utils/calculateDistance';
import { ALL_CATEGORIES } from './placeCategory';
import { getVehicle } from './quickFilters';

const MINUTES_PER_HOUR = 60;
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

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
