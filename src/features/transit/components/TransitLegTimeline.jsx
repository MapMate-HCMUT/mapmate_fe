import { Copy, ExternalLink, MapPin } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useStopArrivals } from '../hooks/useStopDetail';
import { formatDistance, formatFare, grabBookingUrl, isMobileDevice, legColor, legMode } from '../utils/transitFormat';
import { RouteBadge } from './RouteBadge';

// Xe thật sắp tới trạm lên (GPS) — các tuyến của chặng xe đầu tiên trong phương án đang chọn (gộp nhiều tuyến: xe nào tới trước)
const LiveArrival = ({ stopId, routeNumbers }) => {
  const { routes } = useStopArrivals(stopId, routeNumbers);
  const next = (routes ?? [])
    .flatMap((route) => route.arrivals.map((arrival) => ({ number: route.number, eta: arrival.eta_min })))
    .sort((a, b) => a.eta - b.eta)
    .slice(0, 3);
  if (!next.length) return null;
  return (
    <p className="mt-0.5 inline-flex items-center gap-1 rounded-pill bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700">
      <span className="w-1.5 h-1.5 rounded-pill bg-success-500 animate-pulse" />
      {next.map((item) => `${item.number} ${item.eta <= 0 ? 'đang tới' : `còn ${item.eta}′`}`).join(' · ')}
    </p>
  );
};

// Gọi xe cho chặng ra / rời trạm: mở app Grab với điểm đến điền sẵn (điện thoại) hoặc sao chép điểm đến
const RideHailActions = ({ to }) => {
  const { showToast } = useToast();
  const copy = () => {
    navigator.clipboard?.writeText(`${to.name} (${to.coordinates[1].toFixed(6)}, ${to.coordinates[0].toFixed(6)})`);
    showToast('Đã sao chép điểm đến — dán vào app gọi xe');
  };
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {isMobileDevice() && (
        <a href={grabBookingUrl(to)} className="inline-flex items-center gap-1 rounded-button bg-[#00b14f] px-2 py-1 text-[11px] font-bold text-white">
          <ExternalLink className="w-3 h-3" /> Mở Grab
        </a>
      )}
      <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-button bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-200">
        <Copy className="w-3 h-3" /> Sao chép điểm đến
      </button>
    </div>
  );
};

// Dòng cuối: tới nơi (ghim đỏ, tên điểm đến)
const DestinationRow = ({ name }) => (
  <li className="flex items-center gap-2.5 pl-1 pb-2">
    <span className="flex w-6 shrink-0 justify-center"><MapPin className="w-4 h-4 fill-rose-500 text-rose-500" /></span>
    <span className="text-xs font-bold text-rose-700">Tới {name}</span>
  </li>
);

const LegRow = ({ leg, isFirstTransit, onOpenStop }) => {
  const mode = legMode(leg.mode);
  const Icon = mode.icon;
  const color = legColor(leg);
  if (!leg.route) {
    return (
      <li className="relative flex gap-2.5 pl-1">
        <span className="mt-0.5 flex w-6 shrink-0 justify-center"><Icon className="w-4 h-4" style={{ color }} /></span>
        <div className="flex-1 min-w-0 pb-2 text-xs">
          <p className="font-semibold text-neutral-800">
            {mode.label} {formatDistance(leg.distance_m)} tới {leg.to.name}
          </p>
          <p className="text-[11px] text-neutral-500">
            {leg.start_time} · ~{leg.duration_min} phút{leg.mode === 'ride' ? ` · ~${formatFare(leg.cost_vnd)} (tham khảo)` : ''}
          </p>
          {leg.mode === 'ride' && <RideHailActions to={leg.to} />}
        </div>
      </li>
    );
  }
  return (
    <li className="relative flex gap-2.5 pl-1">
      <span className="flex w-6 shrink-0 flex-col items-center">
        <span className="w-3 h-3 rounded-pill border-[3px] bg-surface" style={{ borderColor: color }} />
        <span className="w-1 flex-1 rounded-pill" style={{ backgroundColor: color }} />
        <span className="w-3 h-3 rounded-pill border-[3px] bg-surface" style={{ borderColor: color }} />
      </span>
      <div className="flex-1 min-w-0 pb-2 text-xs space-y-0.5">
        <button type="button" onClick={() => onOpenStop?.(leg.from.stop_id)} className="text-left font-semibold text-neutral-900 hover:underline">
          Lên ở {leg.from.name}
        </button>
        <div className="flex flex-wrap items-center gap-1">
          <RouteBadge number={leg.route.number} color={leg.route.color} mode={leg.mode} />
          {(leg.alternatives ?? []).slice(0, 2).map((alt) => <RouteBadge key={alt.route.number} number={alt.route.number} color={alt.route.color} mode={leg.mode} />)}
          {(leg.alternatives?.length ?? 0) > 2 && <span className="text-[10px] font-bold text-neutral-500">+{leg.alternatives.length - 2}</span>}
          {!leg.alternatives?.length && <span className="text-neutral-600">hướng {leg.headsign}</span>}
        </div>
        <p className="text-[11px] text-neutral-500">
          {leg.alternatives?.length
            ? `Xe qua trạm: ${[{ route: leg.route, departure_time: leg.departure_time }, ...leg.alternatives].map((item) => `${item.route.number} lúc ${item.departure_time}`).join(' · ')}`
            : `${leg.scheduled ? 'Xe qua trạm' : 'Khoảng'} ${leg.departure_time} (chờ ~${leg.wait_min}′${leg.scheduled ? ', theo lịch' : `, ${leg.headway_min ?? '?'} phút/chuyến`})`}
          {' · '}
          {leg.stops_count} trạm · {formatFare(leg.cost_vnd)}
        </p>
        {isFirstTransit && <LiveArrival stopId={leg.from.stop_id} routeNumbers={[leg.route.number, ...(leg.alternatives ?? []).map((alt) => alt.route.number)]} />}
        <button type="button" onClick={() => onOpenStop?.(leg.to.stop_id)} className="block text-left font-semibold text-neutral-900 hover:underline">
          Xuống ở {leg.to.name} <span className="font-normal text-neutral-500">· {leg.arrival_time}</span>
        </button>
      </div>
    </li>
  );
};

// Các chặng của 1 phương án: đi bộ / gọi xe → lên tuyến → (đổi tuyến) → rời trạm
export const TransitLegTimeline = ({ option, onOpenStop }) => {
  const firstTransit = option.legs.findIndex((leg) => leg.route);
  return (
    <ol className="space-y-0.5">
      {option.legs.map((leg, index) => (
        <LegRow key={`${leg.mode}-${index}`} leg={leg} isFirstTransit={index === firstTransit} onOpenStop={onOpenStop} />
      ))}
      {option.legs.length > 0 && <DestinationRow name={option.legs.at(-1).to.name} />}
    </ol>
  );
};
