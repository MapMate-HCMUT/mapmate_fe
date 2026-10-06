import { Bike, Bus, Footprints, Ship, TrainFront } from 'lucide-react';

// Từng loại chặng: nhãn, icon, màu vẽ trên bản đồ (chặng xe công cộng dùng màu của tuyến nếu có)
export const LEG_MODES = {
  walk: { label: 'Đi bộ', icon: Footprints, color: '#64748b', dashed: true },
  ride: { label: 'Gọi xe', icon: Bike, color: '#7c3aed', dashed: true },
  bus: { label: 'Xe buýt', icon: Bus, color: '#0284c7' },
  metro: { label: 'Metro', icon: TrainFront, color: '#2563eb' },
  waterbus: { label: 'Buýt sông', icon: Ship, color: '#0891b2' },
};
export const legMode = (mode) => LEG_MODES[mode] ?? LEG_MODES.bus;
export const legColor = (leg) => (leg.route?.color && !LEG_MODES[leg.mode]?.dashed ? leg.route.color : legMode(leg.mode).color);

export const PRIORITY_OPTIONS = [
  { value: 'fastest', label: 'Nhanh nhất' },
  { value: 'least_walk', label: 'Ít đi bộ' },
  { value: 'cheapest', label: 'Rẻ nhất' },
];
export const CONNECTOR_OPTIONS = [
  { value: 'auto', label: 'Tự động', hint: 'Gần thì đi bộ, xa thì gọi xe ra trạm' },
  { value: 'walk', label: 'Chỉ đi bộ', hint: 'Không gọi xe, chỉ đi bộ ra / rời trạm' },
  { value: 'ride', label: 'Gọi xe', hint: 'Gọi xe (Grab / Be...) ra / rời trạm' },
];
export const OPTION_TAGS = {
  recommended: { label: 'Gợi ý', className: 'bg-primary-600 text-white' },
  fastest: { label: 'Nhanh nhất', className: 'bg-info-50 text-info-700' },
  least_walk: { label: 'Ít đi bộ', className: 'bg-accent-50 text-accent-700' },
  cheapest: { label: 'Rẻ nhất', className: 'bg-success-50 text-success-700' },
};

export const formatMinutes = (minutes) => (minutes >= 60 ? `${Math.floor(minutes / 60)} giờ ${minutes % 60 ? `${minutes % 60} phút` : ''}`.trim() : `${minutes} phút`);
export const formatDistance = (meters) => (meters >= 1000 ? `${(meters / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(meters / 10) * 10} m`);
export const formatFare = (vnd) => (vnd == null ? 'chưa rõ giá' : vnd === 0 ? 'Miễn phí' : `${vnd.toLocaleString('vi-VN')}đ`);

// Mở app gọi xe trên điện thoại với điểm đến điền sẵn (máy tính không mở được => sao chép điểm đến)
export const grabBookingUrl = (to) =>
  `grab://open?screenType=BOOKING&dropOffLatitude=${to.coordinates[1]}&dropOffLongitude=${to.coordinates[0]}&dropOffName=${encodeURIComponent(to.name)}`;
export const isMobileDevice = () => typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const MINUTES_TO_SECONDS = 60;
const middlePoint = (coordinates) => coordinates[Math.floor(coordinates.length / 2)] ?? null;

/**
 * Kết quả tìm cách đi cho cả chuyến + phương án đang chọn ở mỗi chặng => dữ liệu lộ trình dùng chung với dẫn đường Goong
 * (tổng thời gian, quãng đường, toạ độ để vẽ / kiểm tra ngập trên tuyến...). `transit` giữ nguyên kết quả để đổi phương án.
 */
export const buildTransitRouteData = (plans, selected, waypoints) => {
  const legs = plans.map((plan, index) => {
    const option = plan.options[selected[index] ?? 0] ?? null;
    const coordinates = option ? option.legs.flatMap((leg) => leg.geometry) : [];
    const meters = option ? option.legs.reduce((sum, leg) => sum + (leg.distance_m ?? 0), 0) : 0;
    const minutes = option?.duration_min ?? 0;
    return {
      from: waypoints[index],
      to: waypoints[index + 1],
      summary: option?.title ?? 'Không tìm được cách đi',
      distance: { text: formatDistance(meters), value: meters },
      duration: { text: formatMinutes(minutes), value: minutes * MINUTES_TO_SECONDS },
      steps: [],
      coordinates,
    };
  });
  const totalMeters = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
  const totalSeconds = legs.reduce((sum, leg) => sum + leg.duration.value, 0);
  const coordinates = legs.flatMap((leg) => leg.coordinates);
  const longest = legs.reduce((best, leg) => (leg.coordinates.length > (best?.coordinates.length ?? 0) ? leg : best), null);
  return {
    totalDistance: formatDistance(totalMeters),
    totalDistanceMeters: totalMeters,
    totalDuration: formatMinutes(Math.round(totalSeconds / MINUTES_TO_SECONDS)),
    totalDurationSeconds: totalSeconds,
    legs,
    steps: [],
    coordinates,
    waypoints,
    midpoint: longest ? middlePoint(longest.coordinates) : null,
    primaryRoad: legs.map((leg) => leg.summary).join(' · '),
    vehicle: 'bus',
    durationNote: 'Giờ xe theo lịch xuất bến của tuyến; xe thực tế có thể sớm / muộn vài phút',
    transit: { plans, selected },
  };
};
