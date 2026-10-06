import { buildTransitRouteData, planTransitTripApi } from '../../transit';
import { getStopCoordinates } from './goongDirections';

/**
 * Chế độ "Công cộng": tìm cách đi bằng xe buýt / metro cho cả chuyến (vị trí hiện tại -> điểm 1 -> ...) ở backend,
 * trả về cùng dạng dữ liệu với dẫn đường Goong (fetchTripRoute) + `transit` (các phương án từng chặng để chọn lại).
 */
export const fetchTransitTripRoute = async (origin, stops, places, prefs) => {
  const valid = (stops ?? []).map((stop) => ({ stop, coordinates: getStopCoordinates(stop, places) })).filter((item) => item.coordinates);
  if (!valid.length) return null;
  const waypoints = [
    { name: 'Vị trí của bạn', coordinates: origin, isUser: true },
    ...valid.map((item, index) => ({
      name: item.stop.place?.name || item.stop.place_name || `Điểm ${index + 1}`,
      category: item.stop.place?.category || item.stop.category || 'other',
      address: item.stop.place?.address || item.stop.address || '',
      coordinates: item.coordinates,
      stop: item.stop,
      index,
    })),
  ];
  const result = await planTransitTripApi({ waypoints: waypoints.map((point) => point.coordinates), stays: valid.map((item) => item.stop.stay_minutes ?? 0), prefs });
  // Backend gọi 2 đầu là "Điểm đi" / "Điểm đến" => thay bằng tên thật của từng chặng
  const named = (point, index) => (point.stop_id == null ? { ...point, name: waypoints[index].name } : point);
  const plans = result.legs.map((plan, index) => ({
    ...plan,
    options: plan.options.map((option) => ({
      ...option,
      legs: option.legs.map((leg) => ({ ...leg, from: leg.from.name === 'Điểm đi' ? named(leg.from, index) : leg.from, to: leg.to.name === 'Điểm đến' ? named(leg.to, index + 1) : leg.to })),
    })),
  }));
  return buildTransitRouteData(plans, plans.map(() => 0), waypoints);
};
