import { X, Compass } from 'lucide-react';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { POST_TYPES } from '../utils/socialConfig';
import { PlaceEmbed } from './PlaceEmbed';

const inputClass = 'w-full py-2.5 px-3 bg-surface border border-neutral-300 rounded-input text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

const ClearButton = ({ onClick, label }) => (
  <button type="button" onClick={onClick} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-danger-600">
    <X className="w-3.5 h-3.5" /> {label}
  </button>
);

// Phần đính kèm của bài viết: chọn địa điểm (tìm theo tên) hoặc chọn 1 lộ trình đã lưu.
export const ComposerAttachment = ({ draft, sources, onUpdate, isLocked }) => {
  if (draft.type === POST_TYPES.PLACE) {
    if (draft.place) {
      return (
        <div>
          <PlaceEmbed place={draft.place} showPin={false} />
          {!isLocked && <ClearButton onClick={() => onUpdate({ place: null })} label="Chọn địa điểm khác" />}
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        <input type="search" value={sources.placeQuery} onChange={(event) => sources.setPlaceQuery(event.target.value)} placeholder="Tìm địa điểm theo tên… (VD: pho hoa)" aria-label="Tìm địa điểm" className={inputClass} />
        <ul className="max-h-44 overflow-y-auto">
          {sources.placeResults.map((place) => {
            const CatIcon = getCategoryStyle(place.category).icon;
            return (
              <li key={place.id}>
                <button type="button" onClick={() => onUpdate({ place })} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-input text-left text-sm hover:bg-neutral-100">
                  {CatIcon ? <CatIcon className="w-4 h-4 text-neutral-500 shrink-0" /> : <span aria-hidden="true">{getCategoryStyle(place.category).emoji}</span>}
                  <span className="flex-1 truncate">{place.name}</span>
                  <span className="text-xs text-neutral-400">{place.district}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (draft.type === POST_TYPES.ITINERARY) {
    if (isLocked && draft.itinerary) {
      return (
        <p className="p-3 rounded-card border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-primary-600 shrink-0" />
          <span>{draft.itinerary.name}</span>
          <span className="font-normal text-neutral-500">· {draft.itinerary.stops.length} điểm dừng</span>
        </p>
      );
    }
    if (sources.itineraries.length === 0) {
      return <p className="text-sm text-neutral-500">Bạn chưa lưu lộ trình nào. Sang tab <b>Địa điểm</b> và bấm <b>Gợi ý lộ trình</b> trước nhé.</p>;
    }
    return (
      <select
        value={draft.itinerary?.id ?? ''}
        onChange={(event) => onUpdate({ itinerary: sources.itineraries.find((item) => item.id === event.target.value) ?? null })}
        aria-label="Chọn lộ trình"
        className={inputClass}
      >
        <option value="">— Chọn lộ trình đã lưu —</option>
        {sources.itineraries.map((itinerary) => (
          <option key={itinerary.id} value={itinerary.id}>{itinerary.name} ({itinerary.stops.length} điểm)</option>
        ))}
      </select>
    );
  }
  return null;
};
