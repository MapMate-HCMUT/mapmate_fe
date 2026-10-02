import { formatDistance } from '../../../utils/calculateDistance';
import { formatPriceRange } from '../../../utils/formatCurrencyVND';

// Dòng thông tin ngắn: ⭐ rating · giá · khoảng cách · thời gian di chuyển
export const PlaceRating = ({ rating, reviewCount }) => (
  <span className="inline-flex items-center gap-1 text-xs">
    <span className="text-accent-500" aria-hidden="true">★</span>
    <span className="font-semibold text-neutral-800">{rating.toFixed(1)}</span>
    {reviewCount !== undefined && (
      <span className="text-neutral-400">({reviewCount.toLocaleString('vi-VN')})</span>
    )}
  </span>
);

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
