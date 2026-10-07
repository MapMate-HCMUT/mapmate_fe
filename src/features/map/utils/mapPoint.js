import { calculateDistanceKm } from '../../../utils/calculateDistance';

// Bấm vào bản đồ: điểm đó là gì?
// - Trúng lớp riêng của MapMate (trạm buýt, tuyến đang vẽ...) => lớp đó tự xử lý
// - Trúng nhãn địa điểm của bản đồ nền (Goong / OpenFreeMap đều đặt id lớp "poi...") => lấy tên nhãn
// - Sát 1 địa điểm của MapMate => mở thẻ địa điểm đó (đủ giá, giờ, đánh giá) thay vì thẻ toạ độ
const APP_LAYER_PREFIXES = ['transit-', 'goong-itinerary-', 'map-point-'];
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
