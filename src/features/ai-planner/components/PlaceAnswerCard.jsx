import { BookOpen, Navigation } from 'lucide-react';
import { formatPlaceAddress, formatPlaceHours, formatPlacePrice, getPlaceRating } from '../../../utils/formatPlace';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { PinButton } from '../../social';
import { PlaceThumb } from '../../map/components/PlaceThumb';
import { FACT_SOURCE_LABELS, PLACE_TOPIC_LABELS } from '../utils/aiFormat';
import { WeatherChip } from './WeatherChip';

// Trả lời câu hỏi về 1 địa điểm: dữ liệu MapMate (giờ, giá) + nguồn bổ sung ghi rõ (Wikipedia, Open-Meteo, ước tính).
export const PlaceAnswerCard = ({ answer }) => {
  const { place, wikipedia, weather, travel, facts_used: facts = [], unknown_topics: unknown = [] } = answer;
  const style = place ? getCategoryStyle(place.category) : null;
  const rating = place ? getPlaceRating(place) : null;

  return (
    <div className="rounded-card border border-neutral-200 bg-surface p-3 space-y-2.5">
      {place && (
        <div className="flex gap-3">
          <PlaceThumb place={place} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{place.name}</p>
            <p className="text-[11px] text-neutral-500 truncate">{formatPlaceAddress(place)}</p>
            <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-neutral-600">
              <span className={`${style.badge} px-1.5 rounded-pill font-medium`}>{style.label}</span>
              <span>{rating ? `★ ${rating}` : 'Chưa có đánh giá'}</span>
              <span>{formatPlacePrice(place)}</span>
              <span className={place.hours_known === false ? 'text-neutral-400' : ''}>{formatPlaceHours(place)}</span>
            </p>
          </div>
          <div className="shrink-0 self-start"><PinButton placeId={place.id} initialStatus={place.my_pin ?? null} /></div>
        </div>
      )}
      {travel && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-600">
          <Navigation className="w-3.5 h-3.5 text-neutral-400" /> Ước tính: {travel.label} ~{travel.minutes} phút · {travel.distance_km} km
        </p>
      )}
      {weather && <WeatherChip weather={weather} />}
      {wikipedia && (
        <p className="flex items-start gap-1.5 text-xs text-neutral-600">
          <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-400" />
          <span>
            Theo Wikipedia: <a href={wikipedia.url} target="_blank" rel="noreferrer" className="font-semibold text-primary-700 hover:underline">{wikipedia.title}</a>
            <span className="text-neutral-400"> · {wikipedia.license} · chỉ dùng cho phần giới thiệu, giờ & giá lấy từ MapMate</span>
          </span>
        </p>
      )}
      {facts.length > 0 && (
        <ul className="space-y-1 border-t border-neutral-100 pt-2 text-[11px] text-neutral-600">
          {facts.map((item) => (
            <li key={`${item.source}-${item.fact}`} className="flex gap-1.5">
              <span className="shrink-0 rounded-pill bg-neutral-100 px-1.5 font-semibold text-neutral-700">{FACT_SOURCE_LABELS[item.source] ?? item.source}</span>
              <span className="line-clamp-2">{item.fact}</span>
            </li>
          ))}
        </ul>
      )}
      {unknown.length > 0 && (
        <p className="text-[11px] text-warning-700">Chưa có dữ liệu về: {unknown.map((topic) => PLACE_TOPIC_LABELS[topic] ?? topic).join(', ')} — nên gọi hỏi hoặc xem trang chính thức.</p>
      )}
    </div>
  );
};
