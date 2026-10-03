import { formatPlaceAddress, formatPlacePrice, getPlaceRating } from '../../../utils/formatPlace';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { PinButton } from './PinButton';

// Thẻ địa điểm nhúng trong bài viết / danh sách ghim.
export const PlaceEmbed = ({ place, footer, showPin = true }) => {
  const style = getCategoryStyle(place.category);
  return (
    <div className="flex gap-3 p-3 rounded-card border border-neutral-200 bg-neutral-50">
      <div className={`${style.tile} w-14 h-14 shrink-0 rounded-button flex items-center justify-center text-2xl`} aria-hidden="true">{style.emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-neutral-900 truncate">{place.name}</p>
        <p className="text-xs text-neutral-500 truncate">{formatPlaceAddress(place)}</p>
        <p className="mt-0.5 text-xs text-neutral-600">
          <span className={`${style.badge} px-1.5 py-0.5 rounded-pill font-medium`}>{style.label}</span>{' '}
          {getPlaceRating(place) ? <><span className="text-accent-500">★</span> {getPlaceRating(place)}</> : 'Chưa có đánh giá'} · {formatPlacePrice(place)}
        </p>
        {footer}
      </div>
      {showPin && <div className="shrink-0 self-start"><PinButton placeId={place.id} initialStatus={place.my_pin ?? null} /></div>}
    </div>
  );
};
