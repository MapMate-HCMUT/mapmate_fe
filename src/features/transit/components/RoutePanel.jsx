import { ErrorState } from '../../../components/ErrorState';
import { ArrowLeftRight, Clock, X } from 'lucide-react';
import { formatDistance } from '../utils/transitFormat';
import { RouteBadge } from './RouteBadge';

// Khung 1 tuyến: giờ hoạt động, giãn cách, giá vé, các trạm theo chiều đang xem (đường đi vẽ trên bản đồ)
export const RoutePanel = ({ detail, onClose, onSelectStop }) => {
  const { route, variant, setVarId, error } = detail;

  return (
    <article className="bg-surface rounded-card shadow-modal overflow-hidden max-h-[85dvh] flex flex-col" aria-label="Tuyến xe buýt">
      <div className="flex items-start gap-2 p-3 pb-2">
        {route && <RouteBadge number={route.number} color={route.color} mode={route.mode} size="md" />}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-neutral-900 leading-snug">{route?.name ?? 'Đang tải tuyến…'}</h3>
          <p className="text-[11px] text-neutral-500">{route?.type}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng tuyến" className="p-1 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <ErrorState compact error={{ message: error }} title="Chưa tải được thông tin tuyến" className="mx-3" />}

      {route && (
        <div className="px-3 pb-2 space-y-1.5 text-xs text-neutral-700">
          <p className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            {route.operation_time} · {route.headway_text} phút/chuyến{route.trip_minutes ? ` · ${route.trip_minutes} phút/lượt` : ''}
          </p>
          {route.tickets?.length > 0 && <p className="text-[11px] text-neutral-500">{route.tickets.slice(0, 2).join(' · ')}</p>}
          {route.variants.length > 1 && (
            <div className="flex gap-1" role="tablist" aria-label="Chiều đi">
              {route.variants.map((item) => (
                <button key={item.var_id} type="button" role="tab" aria-selected={item.var_id === variant?.var_id} onClick={() => setVarId(item.var_id)} className={`flex-1 inline-flex items-center justify-center gap-1 rounded-input px-2 py-1 text-[11px] font-semibold ${item.var_id === variant?.var_id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>
                  <ArrowLeftRight className="w-3 h-3" /> {item.headsign}
                </button>
              ))}
            </div>
          )}
          {variant && (
            <p className="text-[11px] text-neutral-500">
              {variant.stops.length} trạm · {formatDistance(variant.distance_m)}
              {variant.first_departure ? ` · chuyến đầu ${variant.first_departure}, cuối ${variant.last_departure}` : ''}
            </p>
          )}
        </div>
      )}

      {variant && (
        <ol className="flex-1 overflow-y-auto border-t border-neutral-100 px-3 py-2 space-y-0.5">
          {variant.stops.map((stop, index) => (
            <li key={`${stop.id}-${index}`}>
              <button type="button" onClick={() => onSelectStop(stop.id)} className="w-full flex items-center gap-2 rounded-input px-1 py-0.5 text-left text-xs hover:bg-neutral-50">
                <span className="w-2.5 h-2.5 shrink-0 rounded-pill border-2 bg-surface" style={{ borderColor: route.color || '#0284c7' }} />
                <span className="truncate text-neutral-800">{stop.name}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <p className="px-3 py-2 text-[10px] text-neutral-400">{route?.attribution ?? 'Nguồn: Trung tâm QLGT công cộng TP.HCM'}</p>
    </article>
  );
};
