import { Flame } from 'lucide-react';
import { PlaceRating, PlaceTravelInfo } from './PlaceMeta';
import { PlaceThumb } from './PlaceThumb';

// Bottom Sheet "peek" trên mobile: các quán đang hot, vuốt ngang — không che bản đồ.
export const TrendingCarousel = ({ places, vehicleEmoji, onSelect }) => (
  <section className="bg-surface rounded-t-card shadow-modal pt-2 pb-3">
    <div className="w-10 h-1 bg-neutral-300 rounded-pill mx-auto mb-2" aria-hidden="true" />
    <h2 className="px-4 text-sm font-bold text-neutral-900 flex items-center gap-1.5">
      <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
      <span>Đang hot gần bạn</span>
    </h2>
    {places.length === 0 ? (
      <p className="px-4 py-3 text-xs text-neutral-500">Không có địa điểm phù hợp với bộ lọc hiện tại.</p>
    ) : (
      <ul className="flex gap-3 overflow-x-auto scrollbar-none snap-x px-4 pt-2">
        {places.map((place) => (
          <li key={place.id} className="snap-start shrink-0 w-72">
            <button
              type="button"
              onClick={() => onSelect(place.id)}
              className="w-full flex gap-3 p-2 rounded-card border border-neutral-200 text-left hover:border-primary-300 transition"
            >
              <PlaceThumb place={place} />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-sm text-neutral-900 truncate">{place.name}</p>
                <PlaceRating rating={place.rating} />
                <PlaceTravelInfo place={place} vehicleEmoji={vehicleEmoji} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
);
