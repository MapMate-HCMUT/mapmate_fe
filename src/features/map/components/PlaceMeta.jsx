import { Star } from 'lucide-react';
import { formatDistance } from '../../../utils/calculateDistance';
import { formatPriceRange } from '../../../utils/formatCurrencyVND';

// Dòng thông tin ngắn: ⭐ rating · giá · khoảng cách · thời gian di chuyển
// Chưa có điểm (VD cửa hàng vừa đăng) => "Mới", không hiện "0.0" dễ hiểu nhầm là quán dở
export const PlaceRating = ({ rating, reviewCount }) => (!rating && !reviewCount ? (
  <span className="text-xs font-semibold text-secondary-700">Mới</span>
) : (
  <span className="inline-flex items-center gap-1 text-xs">
    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
    <span className="font-semibold text-neutral-800">{rating.toFixed(1)}</span>
    {reviewCount !== undefined && (
      <span className="text-neutral-400">({reviewCount.toLocaleString('vi-VN')})</span>
    )}
  </span>
));

export const PlaceTravelInfo = ({ place, vehicleEmoji }) => (
  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500 whitespace-nowrap">
    <span>{formatPriceRange(place.price_range)}</span>
    <span aria-hidden="true">·</span>
    <span>{formatDistance(place.distanceKm)}</span>
    <span aria-hidden="true">·</span>
    <span className="font-semibold text-primary-700">
      {vehicleEmoji} {place.travelMinutes} phút
    </span>
  </p>
);
