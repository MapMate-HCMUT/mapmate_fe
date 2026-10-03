import { formatPriceRange } from './formatCurrencyVND';

// Hiển thị địa điểm — dữ liệu mở (OpenStreetMap / Overture) thường chưa có đánh giá, giá chỉ là ước tính, có thể chưa rõ giờ.
export const PLACE_SOURCE_LABELS = {
  mapmate: 'MapMate',
  overture: 'Overture Maps',
  osm: 'OpenStreetMap',
  community: 'Cộng đồng',
};

export const isVerifiedPlace = (place) => !place.source || place.source === 'mapmate';

// null = chưa có đánh giá (không hiện "★ 0.0" gây hiểu nhầm là quán dở)
export const getPlaceRating = (place) => (place.review_count > 0 || place.rating > 0 ? place.rating.toFixed(1) : null);

export const formatPlacePrice = (place) => `${place.price_estimated ? '~' : ''}${formatPriceRange(place.price_range)}`;

export const formatPlaceAddress = (place) => [place.address, place.district].filter(Boolean).join(', ');

// "08:00 – 21:00" · "Mở cả ngày" · "Chưa rõ giờ"
export const formatPlaceHours = (place) => {
  if (place.hours_known === false) return 'Chưa rõ giờ';
  return place.opening_hours?.open ? `${place.opening_hours.open} – ${place.opening_hours.close}` : 'Mở cả ngày';
};
