// Màu + biểu tượng theo loại hình (khớp Place.category của backend). Chỉ dùng design token.
const CATEGORY_STYLES = {
  food: { label: 'Ăn uống', emoji: '🍜', tile: 'bg-warning-100', badge: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500' },
  cafe: { label: 'Cà phê', emoji: '☕', tile: 'bg-primary-100', badge: 'bg-primary-100 text-primary-700', dot: 'bg-primary-600' },
  attraction: { label: 'Tham quan', emoji: '🏛️', tile: 'bg-info-100', badge: 'bg-info-100 text-info-700', dot: 'bg-info-500' },
  entertainment: { label: 'Giải trí', emoji: '🎭', tile: 'bg-accent-100', badge: 'bg-accent-100 text-accent-700', dot: 'bg-accent-500' },
  shopping: { label: 'Mua sắm', emoji: '🛍️', tile: 'bg-secondary-100', badge: 'bg-secondary-100 text-secondary-700', dot: 'bg-secondary-500' },
};
const FALLBACK_STYLE = { label: 'Địa điểm', emoji: '📍', tile: 'bg-neutral-100', badge: 'bg-neutral-100 text-neutral-700', dot: 'bg-neutral-400' };

export const getCategoryStyle = (category) => CATEGORY_STYLES[category] ?? FALLBACK_STYLE;

// "08:00 – 21:00" hoặc "Mở cả ngày"
export const formatOpeningHours = (hours) => (hours?.open ? `${hours.open} – ${hours.close}` : 'Mở cả ngày');
