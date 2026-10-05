import { useState } from 'react';
import { ChevronDown, ChevronUp, Compass, ExternalLink, Sparkles, X } from 'lucide-react';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';

// Khung "Chuyến đi" nổi trên bản đồ: các điểm đã bấm "Thêm vào lộ trình" (chung với Khám phá) + gợi ý lộ trình ngay tại đây.
export const MapTripPanel = ({ panel, maxPlaces }) => {
  const [isOpen, setIsOpen] = useState(true);
  if (!panel.places.length) return null;

  return (
    <section className="bg-surface rounded-card shadow-card p-3 space-y-2.5" aria-label="Chuyến đi">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-primary-600 shrink-0" />
        <h2 className="flex-1 text-sm font-bold text-neutral-900">
          Chuyến đi <span className="font-semibold text-neutral-400">{panel.places.length}/{maxPlaces}</span>
        </h2>
        <button type="button" onClick={panel.clearPlaces} className="text-[11px] font-semibold text-neutral-500 hover:text-danger-600">Xoá hết</button>
        <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? 'Thu gọn' : 'Mở rộng'} className="p-0.5 rounded-pill text-neutral-500 hover:bg-neutral-100">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {panel.places.map((place) => (
            <li key={place.id} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 shrink-0 rounded-pill ${getCategoryStyle(place.category).dot}`} aria-hidden="true" />
              <span className="flex-1 truncate text-neutral-800">{place.name}</span>
              <button type="button" onClick={() => panel.removePlace(place.id)} aria-label={`Bỏ ${place.name}`} className="p-0.5 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-danger-600">
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={panel.suggest}
          disabled={panel.isSuggesting}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-button bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold disabled:opacity-70"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {panel.isSuggesting ? 'Đang lên lộ trình…' : 'Gợi ý lộ trình'}
        </button>
        <button type="button" onClick={panel.openExplore} title="Mở trong Khám phá" aria-label="Mở trong Khám phá" className="px-2.5 rounded-button bg-primary-100 hover:bg-primary-200 text-primary-700">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
