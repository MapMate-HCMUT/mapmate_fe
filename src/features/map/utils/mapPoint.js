import { calculateDistanceKm } from '../../../utils/calculateDistance';

// Bấm vào bản đồ: điểm đó là gì?
// - Trúng lớp riêng của MapMate (trạm buýt, tuyến đang vẽ...) => lớp đó tự xử lý
// - Trúng nhãn địa điểm của bản đồ nền (Goong / OpenFreeMap đều đặt id lớp "poi...") => lấy tên nhãn
// - Sát 1 địa điểm của MapMate => mở thẻ địa điểm đó (đủ giá, giờ, đánh giá) thay vì thẻ toạ độ
export const PLACE_PIN_LAYER = 'mapmate-places-pins'; // ghim địa điểm MapMate (usePlacePins)
export const SAVED_ROUTE_STOP_LAYER = 'mapmate-saved-route-stops'; // điểm dừng của lộ trình đã lưu đang hiện (useSavedRouteLayers)
const APP_LAYER_PREFIXES = ['transit-', 'goong-itinerary-', 'map-point-', 'mapmate-'];
const POI_LAYER_PREFIX = 'poi';
const QUERY_PADDING_PX = 10; // ngón tay / chuột lệch vài pixel vẫn trúng chấm / nhãn
const SAME_PLACE_KM = 0.04;
const SAME_SPOT_PX = 16; // bấm lại cách chỗ cũ ≤ 16 pixel trên màn hình = bấm lại đúng chỗ đang mở (mọi mức zoom)

const boxAround = ({ x, y }) => [[x - QUERY_PADDING_PX, y - QUERY_PADDING_PX], [x + QUERY_PADDING_PX, y + QUERY_PADDING_PX]];

export const hitsAppLayer = (map, point) =>
  map.queryRenderedFeatures(boxAround(point)).some((feature) => APP_LAYER_PREFIXES.some((prefix) => feature.layer.id.startsWith(prefix)));

// Loại địa điểm theo biểu tượng (thuộc tính "maki") của bản đồ nền Goong — hiện trên thẻ cho người dùng biết đó là gì
const POI_KIND_LABELS = {
  restaurant: 'Nhà hàng / quán ăn', 'fast-food': 'Đồ ăn nhanh', cafe: 'Quán cà phê', bakery: 'Tiệm bánh', bar: 'Quán bar', beer: 'Quán bia',
  lodging: 'Khách sạn / nhà nghỉ', shop: 'Cửa hàng', 'clothing-store': 'Shop thời trang', grocery: 'Tạp hoá / siêu thị', business: 'Công ty / văn phòng',
  bank: 'Ngân hàng', fuel: 'Cây xăng', hospital: 'Bệnh viện', doctor: 'Phòng khám', pharmacy: 'Nhà thuốc', school: 'Trường học', college: 'Trường đại học / cao đẳng',
  park: 'Công viên', playground: 'Khu vui chơi', 'place-of-worship': 'Nơi thờ tự', 'religious-buddhist': 'Chùa', 'religious-christian': 'Nhà thờ',
  'rail-metro': 'Ga metro', rail: 'Ga tàu', harbor: 'Bến tàu', museum: 'Bảo tàng', cinema: 'Rạp phim', 'shopping-mall': 'Trung tâm thương mại',
};

// Chấm / nhãn địa điểm của bản đồ nền ngay chỗ bấm (hoặc rê chuột): { name, coordinates, kindLabel, clusterCount } hoặc null.
// Goong gộp nhiều địa điểm gần nhau vào 1 chấm (clusterCount > 1) — phải phóng to mới thấy từng nơi.
// Ghim địa điểm MapMate tại chỗ bấm / rê chuột (ghim đang chọn được ưu tiên vì vẽ trên cùng)
export const placePinAt = (map, point) => {
  if (!map.getLayer(PLACE_PIN_LAYER)) return null;
  const feature = map.queryRenderedFeatures(boxAround(point), { layers: [PLACE_PIN_LAYER] })[0];
  return feature ? { id: feature.properties.id, name: feature.properties.name, coordinates: feature.geometry.coordinates } : null;
};

// Điểm dừng của 1 lộ trình đã lưu đang hiện trên bản đồ (rê chuột => tên điểm + tên lộ trình)
export const savedRouteStopAt = (map, point) => {
  if (!map.getLayer(SAVED_ROUTE_STOP_LAYER)) return null;
  const feature = map.queryRenderedFeatures(boxAround(point), { layers: [SAVED_ROUTE_STOP_LAYER] })[0];
  if (!feature) return null;
  const { label, name, routeName } = feature.properties;
  return { name: `${label}. ${name}`, coordinates: feature.geometry.coordinates, kindLabel: routeName, hint: 'bấm để xem lộ trình' };
};

export const basemapPoiAt = (map, point) => {
  const feature = map
    .queryRenderedFeatures(boxAround(point))
    .find((item) => item.layer.id.startsWith(POI_LAYER_PREFIX) && item.properties?.name && item.geometry?.type === 'Point');
  if (!feature) return null;
  const { name, maki, point_count: pointCount } = feature.properties;
  return { name, coordinates: feature.geometry.coordinates, kindLabel: POI_KIND_LABELS[maki] ?? null, clusterCount: Number(pointCount) || 1 };
};

export const nearestPlace = (places, coordinates) => {
  let best = null;
  places.forEach((place) => {
    const km = calculateDistanceKm(coordinates, place.location.coordinates);
    if (km <= SAME_PLACE_KM && (!best || km < best.km)) best = { place, km };
  });
  return best?.place ?? null;
};

export const isSameSpot = (map, a, b) => {
  const [p, q] = [map.project(a), map.project(b)];
  return Math.hypot(p.x - q.x, p.y - q.y) <= SAME_SPOT_PX;
};

export const formatCoordinates = ([lng, lat]) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
