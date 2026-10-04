import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bookmark, Check, Pencil, Sparkles } from 'lucide-react';
import { useTripDraftStore } from '../../explore';
import { ItineraryTimeline, TripSummary, useStayAdjust } from '../../itinerary';
import { useSaveAiItinerary } from '../hooks/useSaveAiItinerary';

// Các phương án lộ trình (dữ liệu thật từ DB) + ghi chú của AI cho từng phương án; lưu được vào "Của tôi" hoặc sửa ở Khám phá.
export const AiRouteOptions = ({ options, criteria }) => {
  const navigate = useNavigate();
  const setDraftPlaces = useTripDraftStore((state) => state.setPlaces);
  const startEditing = useTripDraftStore((state) => state.startEditing);
  const [selectedKey, setSelectedKey] = useState(options[0].key);
  const { save, saved, savingKey } = useSaveAiItinerary(criteria);
  const stays = useStayAdjust(criteria);
  // Phương án đang xem — đã áp thời gian ở lại người dùng tự chỉnh ±15′ (nếu có)
  const selected = stays.view(options.find((option) => option.key === selectedKey) ?? options[0]);

  const handleEditInExplore = (option) => {
    const places = (option.stops || []).map((stop) => {
      if (stop.place) {
        return {
          ...stop.place,
          id: stop.place.id || stop.place_id,
          name: stop.place.name || stop.place_name,
          category: stop.place.category || stop.category,
        };
      }
      return {
        id: stop.place_id,
        name: stop.place_name,
        category: stop.category,
        address: stop.address,
        coordinates: stop.coordinates,
      };
    });
    const savedItinerary = saved[option.key];
    if (savedItinerary?.id) {
      startEditing(savedItinerary.id, places, option.suggested_name || option.label);
    } else {
      setDraftPlaces(places, option.suggested_name || option.label);
    }
    navigate('/explore?tab=places');
  };

  return (
    <div className="rounded-card border border-neutral-200 bg-surface p-3 space-y-3">
      {options.length > 1 && (
        <div role="tablist" aria-label="Phương án lộ trình" className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={option.key === selected.key}
              onClick={() => setSelectedKey(option.key)}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition ${option.key === selected.key ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              {option.emoji} {option.ai_note?.headline || option.label}
            </button>
          ))}
        </div>
      )}
      <p className="flex items-start gap-1.5 text-sm text-neutral-700">
        <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-accent-500" />
        <span><b className="text-neutral-900">{selected.label}.</b> {selected.ai_note?.why || selected.description}</span>
      </p>
      <TripSummary summary={selected.summary} />
      {selected.summary.issues?.length > 0 && (
        <ul className="space-y-0.5 text-[11px] text-warning-700">
          {selected.summary.issues.map((issue) => <li key={issue}>⚠ {issue}</li>)}
        </ul>
      )}
      <ItineraryTimeline
        stops={selected.stops}
        compact
        onAdjustStay={saved[selected.key] ? undefined : (index, delta) => stays.adjust(selected, index, delta)}
        isAdjusting={stays.adjustingKey === selected.key}
      />
      {selected.adjusted && !saved[selected.key] && (
        <button type="button" onClick={() => stays.reset(selected.key)} className="text-xs font-semibold text-primary-700 hover:underline">Về thời gian gợi ý ban đầu</button>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => save(selected)}
          disabled={Boolean(saved[selected.key]) || savingKey === selected.key}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-button bg-primary-600 hover:bg-primary-700 disabled:bg-primary-100 disabled:text-primary-700 text-white text-sm font-semibold transition"
        >
          {saved[selected.key] ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {saved[selected.key] ? 'Đã lưu vào "Của tôi"' : savingKey === selected.key ? 'Đang lưu…' : 'Lưu lộ trình này'}
        </button>
        <button
          type="button"
          onClick={() => handleEditInExplore(selected)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-button border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-sm font-semibold transition"
          title="Đưa lộ trình sang tab Khám phá để tự do thêm, bớt điểm"
        >
          <Pencil className="w-4 h-4" />
          <span>Sửa ở Khám phá</span>
        </button>
      </div>
    </div>
  );
};
