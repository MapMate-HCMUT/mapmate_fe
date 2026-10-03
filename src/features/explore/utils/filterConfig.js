// Giá trị mặc định + chuyển đổi bộ lọc trên giao diện <-> tham số API.
export const PRICE_MIN = 0;
export const PRICE_MAX = 2000000; // kéo hết sang phải = "2.000k+" (không giới hạn)
export const PRICE_STEP = 10000;
export const PAGE_SIZE = 12;
export const SEARCH_DEBOUNCE_MS = 350;
export const DEFAULT_ORIGIN = { lat: 10.7769, lng: 106.7009, label: 'Trung tâm Quận 1', isDefault: true };

const HALF_HOUR = 30;
const pad = (value) => String(value).padStart(2, '0');

// Giờ khởi hành mặc định: làm tròn lên mốc 30 phút kế tiếp ("17:12" -> "17:30").
export const getDefaultStartTime = (now = new Date()) => {
  const minutes = Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / HALF_HOUR) * HALF_HOUR;
  return `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;
};

export const createDefaultFilters = () => ({
  categories: [],
  tags: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  radiusKm: 5,
  minRating: null,
  district: '',
  sort: 'recommended',
  // Thiết lập chuyến đi
  people: 2,
  vehicle: 'bike',
  customModes: ['bus', 'metro', 'grab_bike'], // chỉ dùng khi vehicle = 'custom'
  startTime: getDefaultStartTime(),
  durationHours: 4,
  tripBudget: null, // null = không giới hạn
  openOnly: false,
});

export const CUSTOM_VEHICLE = 'custom';

// Bộ lọc đã lưu từ bản cũ: "Metro + Grab" không còn là lựa chọn riêng => chuyển sang Tuỳ chỉnh với đúng 2 phương tiện đó.
export const migrateSavedFilters = (saved) =>
  saved.vehicle === 'metro_grab' ? { ...saved, vehicle: CUSTOM_VEHICLE, customModes: ['metro', 'grab_bike'] } : saved;

const HOUR_PERIOD = 12;
// "23:00" -> "11:00 PM" — cùng kiểu với ô chọn "Giờ khởi hành"
export const formatTime12h = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${String(hours % HOUR_PERIOD || HOUR_PERIOD).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${hours < HOUR_PERIOD ? 'AM' : 'PM'}`;
};
const getCustomModes = (filters) => (filters.vehicle === CUSTOM_VEHICLE ? filters.customModes : []);

// Dự phòng khi chưa tải được /places/filter-options (đủ để giao diện không trống).
export const FALLBACK_OPTIONS = {
  categories: [
    { value: 'food', label: 'Ăn uống', emoji: '🍜' },
    { value: 'cafe', label: 'Cà phê', emoji: '☕' },
    { value: 'attraction', label: 'Tham quan', emoji: '🏛️' },
    { value: 'entertainment', label: 'Giải trí', emoji: '🎭' },
    { value: 'park', label: 'Công viên', emoji: '🎡' },
    { value: 'shopping', label: 'Mua sắm', emoji: '🛍️' },
  ],
  tags: [],
  vehicles: [
    { value: 'bike', label: 'Xe máy', emoji: '🛵', description: 'Xe máy cá nhân (xăng + gửi xe)' },
    { value: 'car', label: 'Ô tô', emoji: '🚗', description: 'Ô tô cá nhân (xăng + gửi xe)' },
    { value: 'walk', label: 'Đi bộ', emoji: '🚶', description: 'Chỉ đi bộ' },
    { value: 'public', label: 'Công cộng', emoji: '🚍', description: 'Xe buýt (đang miễn phí) + Metro + đi bộ' },
    { value: 'custom', label: 'Tuỳ chỉnh', emoji: '⚙️', description: 'Tự chọn các phương tiện muốn kết hợp' },
  ],
  custom_modes: [
    { value: 'bus', label: 'Xe buýt', emoji: '🚌' },
    { value: 'metro', label: 'Metro', emoji: '🚇' },
    { value: 'grab_bike', label: 'Grab xe máy', emoji: '🏍️' },
    { value: 'grab_car', label: 'Grab ô tô', emoji: '🚕' },
  ],
  fares: null,
  sorts: [{ value: 'recommended', label: 'Đề xuất' }, { value: 'distance', label: 'Gần nhất' }],
  // Ghi nguồn dữ liệu mở (bắt buộc theo giấy phép ODbL / CDLA)
  attribution: [
    { label: 'Overture Maps Foundation', license: 'CDLA-Permissive-2.0', url: 'https://overturemaps.org' },
    { label: '© OpenStreetMap contributors', license: 'ODbL', url: 'https://www.openstreetmap.org/copyright' },
  ],
  trip_budget: { min: 50000, max: 2000000, step: 50000, default: 500000 },
  radius: { min: 1, max: 20, default: 5 },
  people: { min: 1, max: 20, default: 2 },
  duration: { min: 1, max: 12, default: 4 },
  min_ratings: [3, 4, 4.5],
  districts: [],
};

const hasPriceCap = (filters) => filters.priceRange[1] < PRICE_MAX;

// Bộ lọc -> query cho GET /api/places/nearby
export const buildNearbyParams = (filters, origin, keyword, page) => ({
  lat: origin.lat,
  lng: origin.lng,
  radius_km: filters.radiusKm,
  categories: filters.categories.join(',') || undefined,
  tags: filters.tags.join(',') || undefined,
  price_min: filters.priceRange[0] || undefined,
  price_max: hasPriceCap(filters) ? filters.priceRange[1] : undefined,
  min_rating: filters.minRating ?? undefined,
  district: filters.district || undefined,
  q: keyword.trim() || undefined,
  open_at: filters.openOnly ? filters.startTime : undefined,
  vehicle: filters.vehicle,
  transport_modes: getCustomModes(filters).join(',') || undefined,
  sort: filters.sort,
  page,
  limit: PAGE_SIZE,
});

/**
 * Bộ lọc -> "tiêu chí chuyến đi" gửi cho POST /api/itineraries/suggest và lưu kèm lộ trình.
 * Đây là dữ liệu đầu vào cho việc lên nhiều lộ trình (và cho AI Planner sau này).
 */
export const buildTripCriteria = (filters, origin) => ({
  origin: { lat: origin.lat, lng: origin.lng, label: origin.label },
  categories: filters.categories,
  tags: filters.tags,
  price_min: filters.priceRange[0],
  price_max: hasPriceCap(filters) ? filters.priceRange[1] : null,
  trip_budget: filters.tripBudget,
  people: filters.people,
  vehicle: filters.vehicle,
  transport_modes: getCustomModes(filters),
  radius_km: filters.radiusKm,
  min_rating: filters.minRating,
  start_time: filters.startTime,
  duration_hours: filters.durationHours,
  open_only: filters.openOnly,
  district: filters.district || null,
});

// Số bộ lọc địa điểm đang bật (hiện trên nút "Bộ lọc" ở mobile)
export const countActiveFilters = (filters) =>
  filters.categories.length +
  filters.tags.length +
  (filters.priceRange[0] > PRICE_MIN || hasPriceCap(filters) ? 1 : 0) +
  (filters.minRating ? 1 : 0) +
  (filters.district ? 1 : 0) +
  (filters.openOnly ? 1 : 0);
