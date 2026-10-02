import { Icon } from '../../../components/Icon';
import { formatDistance } from '../../../utils/calculateDistance';
import { formatPriceRange, formatShortVND } from '../../../utils/formatCurrencyVND';
import { PinButton } from '../../social';
import { formatOpeningHours, getCategoryStyle } from '../../../utils/placeCategoryStyle';

const MAX_TAGS_SHOWN = 3;

export const PlaceResultCard = ({ place, tagLabels, vehicleEmoji, inDraft, onToggleDraft, onShare }) => {
  const style = getCategoryStyle(place.category);

  return (
    <li className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow p-4 flex gap-3.5">
      <div className={`${style.tile} w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-button flex items-center justify-center text-3xl`} aria-hidden="true">
        {style.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 font-bold text-neutral-900 leading-snug">
            {place.name} {place.is_trending && <span title="Đang hot">🔥</span>}
          </h3>
          <span className={`${style.badge} shrink-0 px-2 py-0.5 rounded-pill text-[11px] font-semibold`}>{style.label}</span>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500 truncate">{place.address}, {place.district}</p>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-neutral-600">
          <span><span className="text-accent-500">★</span> <b className="text-neutral-800">{place.rating.toFixed(1)}</b> ({place.review_count.toLocaleString('vi-VN')})</span>
          <span className="font-semibold text-neutral-800">{formatPriceRange(place.price_range)}</span>
          <span>{formatDistance(place.distance_km)}</span>
          <span className="font-semibold text-primary-700" title={place.travel?.label}>
            {place.travel?.emoji ?? vehicleEmoji} {place.travel_minutes} phút{place.travel?.cost_per_person > 0 && <> · {formatShortVND(place.travel.cost_per_person)}</>}
          </span>
          <span>🕒 {formatOpeningHours(place.opening_hours)}</span>
        </p>

        {place.tags.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-1">
            {place.tags.slice(0, MAX_TAGS_SHOWN).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-pill bg-neutral-100 text-[11px] text-neutral-600">{tagLabels[tag] ?? tag}</span>
            ))}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleDraft(place)}
            aria-pressed={inDraft}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold transition ${
              inDraft ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <Icon name={inDraft ? 'close' : 'plus'} className="w-3.5 h-3.5" />
            {inDraft ? 'Bỏ khỏi chuyến đi' : 'Thêm vào chuyến đi'}
          </button>
          <PinButton placeId={place.id} initialStatus={place.my_pin} />
          <button type="button" onClick={() => onShare(place)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold text-neutral-600 hover:bg-neutral-100">
            <Icon name="share" className="w-3.5 h-3.5" />
            Chia sẻ
          </button>
        </div>
      </div>
    </li>
  );
};
