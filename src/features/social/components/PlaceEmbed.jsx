import { Star } from 'lucide-react';
import { formatPlaceAddress, formatPlacePrice, getPlaceRating } from '../../../utils/formatPlace';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { PinButton } from './PinButton';
import { PlaceThumb } from '../../map/components/PlaceThumb';

// Thẻ địa điểm nhúng trong bài viết / danh sách ghim.
export const PlaceEmbed = ({ place, footer, showPin = true }) => {
  const style = getCategoryStyle(place.category);
  return (
    <div className="flex gap-3 p-3 rounded-card border border-neutral-200 bg-neutral-50">
      <PlaceThumb place={place} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-neutral-900 truncate">{place.name}</p>
        <p className="text-xs text-neutral-500 truncate">{formatPlaceAddress(place)}</p>
        <p className="mt-0.5 text-xs text-neutral-600 flex items-center gap-1.5 flex-wrap">
          <span className={`${style.badge} px-1.5 py-0.5 rounded-pill font-medium`}>{style.label}</span>
          {getPlaceRating(place) ? (
            <span className="inline-flex items-center gap-0.5 font-medium text-neutral-700">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {getPlaceRating(place)}
            </span>
          ) : 'Chưa có đánh giá'} · {formatPlacePrice(place)}
        </p>
        {footer}
      </div>
      {showPin && <div className="shrink-0 self-start"><PinButton placeId={place.id} initialStatus={place.my_pin ?? null} /></div>}
    </div>
  );
};
