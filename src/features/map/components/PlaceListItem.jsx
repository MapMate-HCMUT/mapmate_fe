import { getCategory } from '../utils/placeCategory';
import { PlaceRating, PlaceTravelInfo } from './PlaceMeta';
import { PlaceThumb } from './PlaceThumb';

export const PlaceListItem = ({ place, isSelected, vehicleEmoji, onSelect }) => {
  const { label, soft } = getCategory(place.category);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(place.id)}
        aria-current={isSelected}
        className={`w-full flex gap-3 p-2.5 rounded-card text-left transition ${
          isSelected ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-neutral-50'
        }`}
      >
        <PlaceThumb category={place.category} />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-neutral-900 truncate">{place.name}</p>
            {place.is_trending && <span className="shrink-0 text-xs" title="Đang hot">🔥</span>}
          </div>
          <div className="flex items-center gap-2">
            <PlaceRating rating={place.rating} />
            <span className={`${soft} px-2 py-0.5 rounded-pill text-[11px] font-medium`}>{label}</span>
          </div>
          <PlaceTravelInfo place={place} vehicleEmoji={vehicleEmoji} />
        </div>
      </button>
    </li>
  );
};
