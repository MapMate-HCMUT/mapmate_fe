import { Sparkles } from 'lucide-react';
import { formatDistance } from '../../../utils/calculateDistance';
import { formatPlaceAddress, formatPlaceHours, formatPlacePrice, getPlaceRating } from '../../../utils/formatPlace';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { PinButton } from '../../social';
import { PlaceThumb } from '../../map/components/PlaceThumb';

// Địa điểm tìm được (dữ liệu thật) — nơi AI đánh dấu "nên thử" lên đầu.
export const AiPlaceList = ({ places }) => {
  const sorted = [...places].sort((a, b) => Number(Boolean(b.ai_recommended)) - Number(Boolean(a.ai_recommended)));
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {sorted.map((place) => {
        const style = getCategoryStyle(place.category);
        const rating = getPlaceRating(place);
        return (
          <li key={place.id} className="flex gap-3 rounded-card border border-neutral-200 bg-surface p-2.5">
            <PlaceThumb place={place} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1 text-sm font-semibold text-neutral-900">
                <span className="truncate">{place.name}</span>
                {place.ai_recommended && <Sparkles className="w-3.5 h-3.5 shrink-0 text-accent-500" aria-label="AI gợi ý" />}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">{formatPlaceAddress(place)}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-neutral-600">
                <span className={`${style.badge} px-1.5 rounded-pill font-medium`}>{style.label}</span>
                <span>{rating ? `★ ${rating}` : 'Chưa có đánh giá'}</span>
                <span>{formatPlacePrice(place)}</span>
                {place.distance_km != null && <span>{formatDistance(place.distance_km)}</span>}
                <span className={place.hours_known === false ? 'text-neutral-400' : ''}>{formatPlaceHours(place)}</span>
              </p>
            </div>
            <div className="shrink-0 self-start"><PinButton placeId={place.id} initialStatus={place.my_pin ?? null} /></div>
          </li>
        );
      })}
    </ul>
  );
};
