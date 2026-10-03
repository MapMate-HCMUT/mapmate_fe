import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { toTimelineStops } from '../utils/itineraryFormat';

// Dòng thời gian dọc: giờ đến → tên trạm → thời gian ở lại, chi phí.
export const ItineraryTimeline = ({ stops, vehicleEmoji = '🛵', compact = false }) => (
  <ol className="relative">
    {toTimelineStops(stops).map((stop, index, list) => {
      const style = getCategoryStyle(stop.category);
      return (
        <li key={stop.key} className="relative flex gap-3 pb-4 last:pb-0">
          {index < list.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-neutral-200" aria-hidden="true" />}
          <span className={`relative mt-1 w-4 h-4 shrink-0 rounded-pill border-2 border-surface shadow-card ${style.dot}`} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900">
              <span className="text-primary-700">{stop.arrival_time}</span> · {stop.name}
            </p>
            <p className="text-xs text-neutral-500">
              {style.emoji} {style.label}
              {stop.stay_minutes > 0 && <> · ở lại {stop.stay_minutes} phút</>}
              {stop.est_cost > 0 ? <> · ~{formatShortVND(stop.est_cost)}</> : <> · miễn phí</>}
              {!stop.travel && !compact && stop.travel_minutes > 0 && <> · {vehicleEmoji} {stop.travel_minutes} phút đi</>}
            </p>
            {stop.travel && (
              <p className="text-xs text-neutral-500" title={stop.travel.label}>
                Đến bằng: {stop.travel.segments.map((item, itemIndex) => (
                  <span key={itemIndex}>{itemIndex > 0 && ' → '}{item.emoji} {item.minutes}′</span>
                ))}
                {stop.travel.cost_per_person > 0 ? <> · {formatShortVND(stop.travel.cost_per_person)}</> : <> · 0đ</>}
              </p>
            )}
            {stop.closed_on_arrival && <p className="text-xs font-medium text-warning-700">⚠️ Có thể chưa mở cửa lúc bạn đến</p>}
          </div>
        </li>
      );
    })}
  </ol>
);
