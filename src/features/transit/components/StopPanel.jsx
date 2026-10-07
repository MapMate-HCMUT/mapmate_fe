import { ErrorState } from '../../../components/ErrorState';
import { Accessibility, Bus, RefreshCw, X } from 'lucide-react';
import { useStopArrivals, useStopDetail } from '../hooks/useStopDetail';
import { formatDistance } from '../utils/transitFormat';
import { RouteBadge } from './RouteBadge';

// Khung 1 trạm: các tuyến dừng ở đây (bấm để xem tuyến) + xe sắp tới theo GPS (tự làm mới 30 giây)
export const StopPanel = ({ stopId, onClose, onOpenRoute }) => {
  const { stop, error } = useStopDetail(stopId);
  const arrivals = useStopArrivals(stopId);
  const routes = stop?.routes ?? [];

  return (
    <article className="bg-surface rounded-card shadow-modal overflow-hidden max-h-[85dvh] overflow-y-auto" aria-label="Trạm xe buýt">
      <div className="flex items-start gap-2 p-3 pb-2">
        <Bus className="w-4 h-4 mt-0.5 text-info-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-neutral-900 leading-snug">{stop?.name ?? 'Trạm xe buýt'}</h3>
          <p className="text-[11px] text-neutral-500">
            {[stop?.code, stop?.address, stop?.zone].filter(Boolean).join(' · ')}
            {stop?.wheelchair && <Accessibility className="inline w-3 h-3 ml-1 -mt-0.5" aria-label="Hỗ trợ người khuyết tật" />}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng trạm" className="p-1 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <ErrorState compact error={{ message: error }} title="Chưa tải được thông tin trạm" className="mx-3" />}

      <section className="px-3 pb-3 space-y-1.5">
        <h4 className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
          Xe sắp tới {arrivals.routes && <RefreshCw className="w-3 h-3 text-neutral-400" aria-label="Tự làm mới 30 giây" />}
        </h4>
        {arrivals.error && !arrivals.routes && <p className="text-xs text-neutral-500">{arrivals.error}</p>}
        {arrivals.routes?.length === 0 && <p className="text-xs text-neutral-500">Chưa có xe nào đang tới trạm.</p>}
        {!arrivals.routes && !arrivals.error && <p className="text-xs text-neutral-400">Đang hỏi vị trí xe…</p>}
        <ul className="space-y-1">
          {(arrivals.routes ?? []).map((route) => (
            <li key={`${route.route_id}-${route.var_id}`} className="flex items-center gap-2 text-xs">
              <RouteBadge number={route.number} color={routes.find((item) => item.route_id === route.route_id)?.color} mode={route.number?.startsWith('MRT') ? 'metro' : 'bus'} />
              <span className="flex-1 min-w-0 truncate text-neutral-600">→ {route.headsign}</span>
              <span className="shrink-0 font-bold text-neutral-900">{route.arrivals.map((arrival) => (arrival.eta_min <= 0 ? 'đang tới' : `${arrival.eta_min}′`)).join(' · ')}</span>
              <span className="shrink-0 text-[10px] text-neutral-400">{formatDistance(route.arrivals[0].distance_m)}</span>
            </li>
          ))}
        </ul>
      </section>

      {routes.length > 0 && (
        <section className="border-t border-neutral-100 p-3 space-y-1.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Tuyến dừng ở trạm ({routes.length})</h4>
          <ul className="space-y-0.5">
            {routes.map((route) => (
              <li key={`${route.route_id}-${route.var_id}`}>
                <button type="button" onClick={() => onOpenRoute(route.route_id, route.var_id)} className="w-full flex items-center gap-2 rounded-input px-1.5 py-1 text-left hover:bg-neutral-50">
                  <RouteBadge number={route.number} color={route.color} mode={route.mode} />
                  <span className="flex-1 min-w-0 truncate text-xs text-neutral-800">{route.name}</span>
                  <span className="shrink-0 text-[10px] text-neutral-500">{route.is_terminal ? 'trạm cuối' : `→ ${route.headsign}`}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="px-3 pb-2 text-[10px] text-neutral-400">{stop?.attribution ?? 'Nguồn: Trung tâm QLGT công cộng TP.HCM'}</p>
    </article>
  );
};
