import { getVehicleLabel } from '../../itinerary';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';

const THOUSAND = 1000;
const formatK = (amount) => `${Math.round(amount / THOUSAND).toLocaleString('vi-VN')}k`;

export const TAG_LABELS = {
  'hen-ho': 'Hẹn hò', 'gia-dinh': 'Gia đình', 'nhom-ban': 'Nhóm bạn', 'mot-minh': 'Một mình', 'song-ao': 'Sống ảo', 'yen-tinh': 'Yên tĩnh',
  'ngoai-troi': 'Ngoài trời', 'may-lanh': 'Máy lạnh', 've-dem': 'Về đêm', 'dac-san': 'Đặc sản', 'binh-dan': 'Bình dân', 'sang-trong': 'Sang trọng',
};

export const INTENT_LABELS = {
  plan_trip: 'Lên lộ trình',
  refine_trip: 'Chỉnh lộ trình',
  find_places: 'Tìm địa điểm',
  ask_place: 'Hỏi về địa điểm',
  ask_info: 'Hỏi thông tin',
  smalltalk: 'Trò chuyện',
  out_of_scope: 'Ngoài phạm vi',
};

// Tiêu chí AI hiểu được -> các "chip" ngắn gọn để người dùng kiểm tra nhanh: "📍 Trung tâm Quận 1 · 2 người · 500k/người..."
export const describeCriteria = (criteria) => {
  const chips = [
    { key: 'origin', label: `📍 ${criteria.origin?.label ?? 'Điểm xuất phát'} · ${criteria.radius_km} km` },
    { key: 'people', label: `👥 ${criteria.people} người` },
    { key: 'budget', label: criteria.trip_budget == null ? '💰 Không giới hạn' : `💰 ${formatK(criteria.trip_budget)}/người` },
    { key: 'time', label: `🕒 ${criteria.start_time} · ${criteria.duration_hours} giờ` },
    { key: 'vehicle', label: `${getVehicleLabel(criteria.vehicle).emoji} ${getVehicleLabel(criteria.vehicle).label}` },
  ];
  if (criteria.price_max) chips.push({ key: 'price', label: `≤ ${formatK(criteria.price_max)}/điểm` });
  if (criteria.min_rating) chips.push({ key: 'rating', label: `★ ${criteria.min_rating}+` });
  if (criteria.open_only) chips.push({ key: 'open', label: 'Đang mở cửa' });
  criteria.categories?.forEach((category) => chips.push({ key: `c-${category}`, label: getCategoryStyle(category).label, tone: 'category' }));
  criteria.tags?.forEach((tag) => chips.push({ key: `t-${tag}`, label: TAG_LABELS[tag] ?? tag, tone: 'tag' }));
  return chips;
};

export const TRACE_STATUS = {
  ok: { label: 'Xong', className: 'text-success-700' },
  fallback: { label: 'Dự phòng', className: 'text-warning-700' },
  empty: { label: 'Không có kết quả', className: 'text-warning-700' },
};

export const describeSource = (step) => {
  if (step.model) return `AI · ${step.model}`;
  if (step.source === 'rules') return 'Bộ hiểu câu theo luật';
  if (step.source === 'template') return 'Mẫu có sẵn';
  return null;
};

// Nguồn của từng dữ kiện trong câu trả lời về địa điểm
export const FACT_SOURCE_LABELS = { mapmate: 'MapMate', wikipedia: 'Wikipedia', open_meteo: 'Open-Meteo', estimate: 'Ước tính' };
export const PLACE_TOPIC_LABELS = {
  hours: 'giờ mở cửa', price: 'giá', address: 'địa chỉ', contact: 'liên hệ', about: 'giới thiệu', rating: 'đánh giá', weather: 'thời tiết', directions: 'đường đi', other: 'câu hỏi khác',
};

// Ghi nhớ của AI -> các dòng ngắn để hiển thị (bỏ mục trống)
const MEMORY_VEHICLES = { bike: 'Xe máy', car: 'Ô tô', walk: 'Đi bộ', public: 'Xe buýt / metro' };
export const describeMemoryFacts = (facts = {}) =>
  [
    { key: 'diet', label: 'Chế độ ăn', value: facts.diet === 'chay' ? 'Ăn chay' : facts.diet },
    { key: 'vehicle', label: 'Phương tiện', value: MEMORY_VEHICLES[facts.vehicle] ?? facts.vehicle },
    { key: 'people', label: 'Số người', value: facts.people ? `${facts.people} người` : null },
    { key: 'budget_per_person', label: 'Ngân sách', value: facts.budget_per_person ? `${formatK(facts.budget_per_person)}/người` : null },
    { key: 'favorite_areas', label: 'Hay đi', value: facts.favorite_areas?.join(', ') },
    { key: 'favorite_foods', label: 'Món thích', value: facts.favorite_foods?.join(', ') },
    { key: 'likes', label: 'Phong cách', value: facts.likes?.map((tag) => TAG_LABELS[tag] ?? tag).join(', ') },
  ].filter((fact) => fact.value);
