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

// Server tự nới bộ lọc khi không có kết quả (auto_relax) => trả { keys, labels, radius_km? }.
// relaxParams: tham số đã nới (để "Xem thêm" lấy đúng trang kế); relaxFilters: bỏ hẳn các bộ lọc đó trong bảng bộ lọc.
export const relaxParams = (params, relaxed) => {
  const next = { ...params };
  relaxed.keys.forEach((key) => delete next[key]);
  return relaxed.radius_km ? { ...next, radius_km: relaxed.radius_km } : next;
};

const RELAX_TO_FILTERS = {
  tags: () => ({ tags: [] }),
  min_rating: () => ({ minRating: null }),
  open_at: () => ({ openOnly: false }),
  price_min: () => ({ priceRange: [PRICE_MIN, PRICE_MAX] }),
  price_max: () => ({ priceRange: [PRICE_MIN, PRICE_MAX] }),
  district: () => ({ district: '' }),
  categories: () => ({ categories: [] }),
  radius_km: (relaxed) => ({ radiusKm: relaxed.radius_km }),
};
export const relaxFilters = (filters, relaxed) =>
  relaxed.keys.reduce((next, key) => ({ ...next, ...(RELAX_TO_FILTERS[key]?.(relaxed) ?? {}) }), filters);

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

const EXPLORE_VEHICLES = ['bike', 'car', 'walk', 'public', CUSTOM_VEHICLE];

// Ngược của buildTripCriteria: "tiêu chí chuyến đi" (VD do AI Planner hiểu từ câu chat) -> bộ lọc trên giao diện Khám phá.
export const criteriaToFilters = (criteria, current) => ({
  ...current,
  categories: criteria.categories ?? [],
  tags: criteria.tags ?? [],
  priceRange: [criteria.price_min ?? PRICE_MIN, criteria.price_max ?? PRICE_MAX],
  radiusKm: criteria.radius_km ?? current.radiusKm,
  minRating: criteria.min_rating ?? null,
  district: criteria.district ?? '',
  people: criteria.people ?? current.people,
  vehicle: EXPLORE_VEHICLES.includes(criteria.vehicle) ? criteria.vehicle : current.vehicle,
  customModes: criteria.transport_modes?.length ? criteria.transport_modes : current.customModes,
  startTime: criteria.start_time ?? current.startTime,
  durationHours: criteria.duration_hours ?? current.durationHours,
  tripBudget: criteria.trip_budget ?? null,
  openOnly: Boolean(criteria.open_only),
});

// Số bộ lọc địa điểm đang bật (hiện trên nút "Bộ lọc" ở mobile)
export const countActiveFilters = (filters) =>
  filters.categories.length +
  filters.tags.length +
  (filters.priceRange[0] > PRICE_MIN || hasPriceCap(filters) ? 1 : 0) +
  (filters.minRating ? 1 : 0) +
  (filters.district ? 1 : 0) +
  (filters.openOnly ? 1 : 0);
