// Màu marker theo loại hình (Milestone 2: Cam = Ẩm thực, Xanh dương = Tham quan, Xanh lá = Cafe).
export const PLACE_CATEGORIES = {
  food: { label: 'Ăn uống', emoji: '🍜', marker: 'bg-warning-500', soft: 'bg-warning-100 text-warning-700', tile: 'bg-warning-100' },
  cafe: { label: 'Cà phê', emoji: '☕', marker: 'bg-primary-600', soft: 'bg-primary-100 text-primary-700', tile: 'bg-primary-100' },
  sightseeing: { label: 'Tham quan', emoji: '🏛️', marker: 'bg-info-500', soft: 'bg-info-100 text-info-700', tile: 'bg-info-100' },
  entertainment: { label: 'Giải trí', emoji: '🎭', marker: 'bg-accent-500', soft: 'bg-accent-100 text-accent-700', tile: 'bg-accent-100' },
  shopping: { label: 'Mua sắm', emoji: '🛍️', marker: 'bg-secondary-500', soft: 'bg-secondary-100 text-secondary-700', tile: 'bg-secondary-100' },
};

export const ALL_CATEGORIES = 'all';

export const CATEGORY_FILTERS = [
  { value: ALL_CATEGORIES, label: 'Tất cả', emoji: '✨' },
  ...Object.entries(PLACE_CATEGORIES).map(([value, { label, emoji }]) => ({ value, label, emoji })),
];

export const getCategory = (key) => PLACE_CATEGORIES[key] ?? PLACE_CATEGORIES.food;
