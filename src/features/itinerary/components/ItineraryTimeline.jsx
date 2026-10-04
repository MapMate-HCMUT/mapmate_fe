import { AlertTriangle, Bike, Building2, Hourglass } from 'lucide-react';
import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { toTimelineStops } from '../utils/itineraryFormat';
import { StayControl } from './StayControl';

// Dòng thời gian dọc: giờ đến → tên trạm → thời gian ở lại, chi phí.
// `onAdjustStay(index, delta)` (tuỳ chọn) => hiện nút −15′ / +15′ để người dùng tự chỉnh thời gian ở lại.
export const ItineraryTimeline = ({ stops, vehicleIcon: VehicleIcon, compact = false, onAdjustStay, isAdjusting = false }) => {
  const FallbackVehicle = VehicleIcon || Bike;

  return (
    <ol className="relative">
      {toTimelineStops(stops).map((stop, index, list) => {
        const style = getCategoryStyle(stop.category);
        const CategoryIcon = style.icon;
        return (
          <li key={stop.key} className="relative flex gap-3 pb-4 last:pb-0">
            {index < list.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-neutral-200" aria-hidden="true" />}
            <span className={`relative mt-1 w-4 h-4 shrink-0 rounded-pill border-2 border-surface shadow-card ${style.dot}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              {stop.free_minutes_before > 0 && (
                <p className="mb-1 inline-flex items-center gap-1 rounded-pill bg-info-50 px-2 py-0.5 text-[11px] font-medium text-info-700">
                  <Hourglass className="w-3 h-3" />
                  {stop.venue_name ? `Dạo ${stop.venue_name} ${stop.free_minutes_before}′ rồi mới vào` : `Thời gian tự do ${stop.free_minutes_before}′ — dạo quanh rồi mới vào`}
                </p>
              )}
              <p className="text-sm font-semibold text-neutral-900">
                <span className="text-primary-700">{stop.arrival_time}</span> · {stop.name}
                {stop.role_label && <span className="ml-1.5 align-middle rounded-pill bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">{stop.role_label}</span>}
              </p>
              {stop.venue && (
                <p className="text-[11px] text-secondary-700 flex items-center gap-1"><Building2 className="w-3 h-3" /> Trong {stop.venue.name}</p>
              )}
              <p className="text-xs text-neutral-500 flex items-center gap-1 flex-wrap mt-0.5">
                <span className="inline-flex items-center gap-1">
                  {CategoryIcon ? <CategoryIcon className="w-3 h-3 text-neutral-400" /> : style.emoji}
                  {style.label}
                </span>
                {onAdjustStay ? (
                  <> · <StayControl minutes={stop.stay_minutes} range={stop.stay_range} disabled={isAdjusting} onChange={(delta) => onAdjustStay(index, delta)} /></>
                ) : (
                  stop.stay_minutes > 0 && <> · ở lại {stop.stay_minutes} phút</>
                )}
                {stop.est_cost > 0 ? <> · ~{formatShortVND(stop.est_cost)}</> : <> · miễn phí</>}
                {!stop.travel && !compact && stop.travel_minutes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    · <FallbackVehicle className="w-3 h-3 text-neutral-400 inline" /> {stop.travel_minutes} phút đi
                  </span>
                )}
              </p>
              {stop.travel && (
                <p className="text-xs text-neutral-500" title={stop.travel.label}>
                  Đến bằng: {stop.travel.segments.map((item, itemIndex) => (
                    <span key={itemIndex}>{itemIndex > 0 && ' → '}{item.label || item.emoji} {item.minutes}′</span>
                  ))}
                  {stop.travel.cost_per_person > 0 ? <> · {formatShortVND(stop.travel.cost_per_person)}</> : <> · 0đ</>}
                </p>
              )}
              {stop.closed_on_arrival && (
                <p className="text-xs font-medium text-warning-700 flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning-600 shrink-0" />
                  Có thể chưa mở cửa lúc bạn đến
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
