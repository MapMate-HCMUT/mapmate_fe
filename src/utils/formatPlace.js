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

// "~60k – 200k" = ước tính; công viên / tượng đài miễn phí thì không cần dấu ~
export const formatPlacePrice = (place) => `${place.price_estimated && place.price_range.max > 0 ? '~' : ''}${formatPriceRange(place.price_range)}`;

// Lần cuối lấy dữ liệu từ nguồn mở: "10/2026"
export const formatDataMonth = (date) => {
  if (!date) return null;
  const value = new Date(date);
  return `${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()}`;
};

export const formatPlaceAddress = (place) => [place.address, place.district].filter(Boolean).join(', ');

// "08:00 – 21:00" · "Mở cả ngày" · "Chưa rõ giờ"
export const formatPlaceHours = (place) => {
  if (place.hours_known === false) return 'Chưa rõ giờ';
  return place.opening_hours?.open ? `${place.opening_hours.open} – ${place.opening_hours.close}` : 'Mở cả ngày';
};
