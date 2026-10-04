import { Footprints, Bike, Bus, Car, Train, Settings, Lock, Users, Globe } from 'lucide-react';

export const VEHICLE_LABELS = {
  walk: { label: 'Đi bộ', emoji: '🚶', icon: Footprints },
  bike: { label: 'Xe máy', emoji: '🛵', icon: Bike },
  bus: { label: 'Xe buýt', emoji: '🚌', icon: Bus },
  car: { label: 'Ô tô', emoji: '🚗', icon: Car },
  public: { label: 'Phương tiện công cộng', emoji: '🚍', icon: Bus },
  metro_grab: { label: 'Metro + Grab', emoji: '🚇', icon: Train },
  custom: { label: 'Kết hợp tuỳ chỉnh', emoji: '⚙️', icon: Settings },
};
export const getVehicleLabel = (vehicle) => VEHICLE_LABELS[vehicle] ?? VEHICLE_LABELS.bike;

export const VISIBILITY_LABELS = {
  private: { label: 'Chỉ mình tôi', emoji: '🔒', icon: Lock },
  friends: { label: 'Bạn bè', emoji: '👥', icon: Users },
  public: { label: 'Công khai', emoji: '🌐', icon: Globe },
};

// Vai trò điểm dừng (server tính từ loại quán + giờ đến): bữa chính / ăn vặt / đồ uống / vui chơi
export const STOP_ROLE_LABELS = { meal: 'Bữa chính', snack: 'Ăn vặt', drink: 'Đồ uống', activity: 'Vui chơi' };
export const MEAL_LABELS = { breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', late_night: 'Ăn khuya' };
export const getStopRoleLabel = (stop) => (stop.meal ? MEAL_LABELS[stop.meal] : STOP_ROLE_LABELS[stop.role]) ?? null;

// Chỉnh thời gian ở lại từng điểm (khớp giới hạn của server: constants/tripRules.js — STAY_RANGE)
export const STAY_STEP_MINUTES = 15;
export const STAY_LIMITS = { min: 10, max: 300 };
// Thời gian ở lại đang hiển thị => gửi kèm khi lưu / xem trước để server giữ đúng như vậy
export const stayOverridesOf = (stops) => Object.fromEntries(stops.map((stop) => [stop.place.id, stop.stay_minutes]));

// Trạm của lộ trình GỢI Ý có dạng { place: {...} }, trạm ĐÃ LƯU có dạng phẳng { place_name } => đưa về 1 dạng để hiển thị.
export const toTimelineStops = (stops) =>
  stops.map((stop, index) => ({
    key: stop.id ?? stop.place?.id ?? index,
    name: stop.place?.name ?? stop.place_name,
    category: stop.place?.category ?? stop.category,
    address: stop.place?.address ?? stop.address,
    arrival_time: stop.arrival_time,
    stay_minutes: stop.stay_minutes,
    travel_minutes: stop.travel_minutes,
    est_cost: stop.est_cost,
    travel: stop.travel ?? null, // { label, cost_per_person, segments[] } — null với lộ trình lưu từ bản cũ
    closed_on_arrival: stop.open_on_arrival === false,
    role_label: getStopRoleLabel(stop), // null với lộ trình lưu từ bản cũ
    // Nằm trong mall nào (null nếu không có, hoặc điểm này chính là mall)
    venue: stop.venue && String(stop.venue.id) !== String(stop.place?.id) ? stop.venue : null,
    venue_name: stop.venue?.name ?? null, // có cả khi điểm này chính là mall => chờ giờ ăn = dạo mall
    stay_range: stop.stay_range ?? null, // khoảng hợp lý — chỉ có ở lộ trình gợi ý / xem trước
    free_minutes_before: stop.free_minutes_before ?? 0, // chờ tới giờ ăn hợp lý => dạo quanh trước khi vào
  }));

const sumOf = (stops, key) => stops.reduce((sum, stop) => sum + (stop[key] ?? 0), 0);

// Bảng tổng hợp của 1 lộ trình. Lộ trình lưu trước khi có `summary` => dựng lại bản rút gọn từ các trường cũ.
export const getTripSummary = (itinerary) => {
  if (itinerary.summary) return itinerary.summary;
  const placesCost = sumOf(itinerary.stops, 'est_cost');
  const travelMinutes = sumOf(itinerary.stops, 'travel_minutes');
  return {
    stop_count: itinerary.stops.length,
    people: itinerary.people ?? 1,
    start_time: itinerary.start_time,
    total_minutes: itinerary.total_duration,
    travel_minutes: travelMinutes,
    visit_minutes: itinerary.total_duration - travelMinutes,
    total_distance_km: itinerary.total_distance_km,
    places_cost_per_person: placesCost,
    transport_cost_per_person: 0,
    cost_per_person: placesCost,
    total_cost: itinerary.total_cost,
    within_budget: true,
    within_duration: true,
    all_open: true,
    transport: [],
  };
};
