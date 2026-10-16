import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, Eye, EyeOff, Info, LoaderCircle, Maximize2, Navigation, Route, Search, X } from 'lucide-react';
import { getTripSummary, getVehicleLabel } from '../../itinerary';
import { formatDuration } from '../../../utils/formatTrip';
import { savedRouteStops } from '../api/savedRouteGeometry';
import { MAX_VISIBLE_ROUTES, useSavedRoutesStore } from '../stores/savedRoutesStore';

const SEARCH_FROM = 6; // nhiều lộ trình hơn mức này => hiện ô lọc theo tên

const Dot = ({ color, className = 'w-3 h-3' }) => <span className={`${className} shrink-0 rounded-pill`} style={{ backgroundColor: color }} aria-hidden="true" />;

// Đã hiện đủ 5 lộ trình: hỏi ẩn lộ trình nào để nhường chỗ (không tự ẩn ngầm lộ trình người dùng đang xem)
const ReplacePrompt = ({ pending, visibleRoutes, onReplace, onCancel }) => (
  <div role="alertdialog" aria-label="Chọn lộ trình để ẩn" className="rounded-card border border-accent-300 bg-accent-50 p-3 space-y-2">
    <p className="text-xs text-accent-800">
      Bản đồ đang hiện tối đa <b>{MAX_VISIBLE_ROUTES} lộ trình</b>. Chọn 1 lộ trình để ẩn, nhường chỗ cho <b>“{pending.name}”</b>:
    </p>
    <ul className="space-y-1">
      {visibleRoutes.map(({ itinerary, color }) => (
        <li key={itinerary.id}>
          <button type="button" onClick={() => onReplace(itinerary.id)} className="group w-full flex items-center gap-2 px-2.5 py-1.5 rounded-input bg-surface hover:bg-danger-50 text-left text-xs font-semibold text-neutral-800">
            <Dot color={color} />
            <span className="flex-1 truncate">{itinerary.name}</span>
            <span className="inline-flex items-center gap-1 text-neutral-400 group-hover:text-danger-600"><EyeOff className="w-3.5 h-3.5" /> Ẩn</span>
          </button>
        </li>
      ))}
    </ul>
    <button type="button" onClick={onCancel} className="text-xs font-semibold text-neutral-500 hover:text-neutral-800">Thôi, giữ nguyên</button>
  </div>
);

const RouteRow = ({ itinerary, color, isFocused, isLoading, isApprox, onActivate, onToggle, onFit, onStart }) => {
  const summary = getTripSummary(itinerary);
  const vehicle = getVehicleLabel(itinerary.vehicle);
  const VehicleIcon = vehicle.icon;
  const isVisible = Boolean(color);
  const stops = savedRouteStops(itinerary);

  return (
    <li
      className={`rounded-card border transition ${
        isFocused ? 'border-primary-300 bg-primary-50/60 shadow-card' : isVisible ? 'border-neutral-200 bg-surface' : 'border-transparent hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-start gap-2.5 p-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isVisible}
          aria-label={isVisible ? `Ẩn "${itinerary.name}" khỏi bản đồ` : `Hiện "${itinerary.name}" trên bản đồ`}
          title={isVisible ? 'Ẩn khỏi bản đồ' : 'Hiện trên bản đồ'}
          className={`mt-0.5 w-8 h-8 shrink-0 rounded-pill flex items-center justify-center transition ${isVisible ? 'text-white shadow-card' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
          style={isVisible ? { backgroundColor: color } : undefined}
        >
          {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button type="button" onClick={onActivate} aria-expanded={isVisible ? isFocused : undefined} className="flex-1 min-w-0 text-left">
          <span className="block text-sm font-semibold text-neutral-900 truncate" title={itinerary.name}>{itinerary.name}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-neutral-500">
            <span>{stops.length} điểm</span>
            {summary.total_minutes > 0 && <span>· {formatDuration(summary.total_minutes)}</span>}
            {summary.total_distance_km > 0 && <span>· {summary.total_distance_km.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km</span>}
            <span className="inline-flex items-center gap-1">· {VehicleIcon && <VehicleIcon className="w-3 h-3" />}{vehicle.label}</span>
          </span>
        </button>
        {isVisible && <ChevronDown className={`mt-2 w-4 h-4 shrink-0 text-neutral-400 transition ${isFocused ? 'rotate-180' : ''}`} aria-hidden="true" />}
      </div>

      {/* Chỉ lộ trình đang chọn mở chi tiết => 5 lộ trình đang hiện vẫn gọn */}
      {isVisible && isFocused && (
        <div className="px-2.5 pb-2.5 pl-[3.25rem] space-y-2">
          <ol className="relative space-y-1 text-xs text-neutral-700">
            {stops.length > 1 && <span className="absolute left-[7px] top-2 bottom-2 w-0.5 rounded-pill opacity-40" style={{ backgroundColor: color }} aria-hidden="true" />}
            {stops.map((stop, index) => (
              <li key={stop.index} className="relative flex items-center gap-2 min-w-0">
                <span className="w-4 h-4 shrink-0 rounded-pill text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-surface" style={{ backgroundColor: color }}>{index + 1}</span>
                <span className="truncate" title={stop.name}>{stop.name}</span>
              </li>
            ))}
          </ol>
          {isApprox && (
            <p className="flex items-center gap-1 text-[11px] text-warning-700"><Info className="w-3 h-3" /> Có chặng chưa tìm được đường — vẽ nét đứt (ước lượng)</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={onFit} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-neutral-100 hover:bg-neutral-200 text-[11px] font-semibold text-neutral-700">
              <Maximize2 className="w-3 h-3" /> Xem vừa khung
            </button>
            <button type="button" onClick={onStart} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-primary-600 hover:bg-primary-700 text-[11px] font-semibold text-white">
              <Navigation className="w-3 h-3" /> Dẫn đường
            </button>
            <button type="button" onClick={onToggle} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-[11px] font-semibold text-neutral-500 hover:bg-neutral-100">
              <X className="w-3 h-3" /> Ẩn
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

/**
 * Tab "Lộ trình đã lưu" trên bản đồ: bấm 1 lộ trình => hiện lên bản đồ (mỗi lộ trình 1 màu, tối đa 5 cùng lúc).
 * Lộ trình đang hiện xếp lên đầu; bấm lại => chọn & thu phóng tới; đủ 5 mà bật thêm => hỏi ẩn lộ trình nào.
 */
export const SavedRoutesPanel = ({ saved, layers, onStartTrip }) => {
  const { visible, pendingId, focusedId, show, hide, setFocused, replaceWithPending, cancelPending, hideAll } = useSavedRoutesStore();
  const [query, setQuery] = useState('');
  const colorOf = useMemo(() => new Map(visible.map((item) => [item.id, item.color])), [visible]);

  const byId = useMemo(() => new Map(saved.itineraries.map((itinerary) => [itinerary.id, itinerary])), [saved.itineraries]);
  const visibleRoutes = visible.filter((item) => byId.has(item.id)).map((item) => ({ itinerary: byId.get(item.id), color: item.color }));
  const keyword = query.trim().toLowerCase();
  const others = saved.itineraries.filter((itinerary) => !colorOf.has(itinerary.id) && (!keyword || itinerary.name.toLowerCase().includes(keyword)));
  const shown = visibleRoutes.filter(({ itinerary }) => !keyword || itinerary.name.toLowerCase().includes(keyword));
  const pending = pendingId ? byId.get(pendingId) : null;

  const activate = (id) => {
    if (!colorOf.has(id)) return show(id);
    setFocused(focusedId === id ? null : id);
    if (focusedId !== id) layers.fitRoute(id);
    return undefined;
  };
  const toggle = (id) => (colorOf.has(id) ? hide(id) : show(id));
  const row = (itinerary) => (
    <RouteRow
      key={itinerary.id}
      itinerary={itinerary}
      color={colorOf.get(itinerary.id) ?? null}
      isFocused={focusedId === itinerary.id}
      isLoading={layers.loadingIds.includes(itinerary.id)}
      isApprox={layers.geometries[itinerary.id]?.exact === false}
      onActivate={() => activate(itinerary.id)}
      onToggle={() => toggle(itinerary.id)}
      onFit={() => layers.fitRoute(itinerary.id)}
      onStart={() => onStartTrip(itinerary)}
    />
  );

  if (!saved.isAuthenticated) {
    return (
      <div className="text-center py-10 px-6">
        <Route className="w-9 h-9 mx-auto text-primary-600" />
        <p className="mt-2 text-sm font-semibold text-neutral-800">Xem lại lộ trình bạn đã lưu</p>
        <p className="mt-1 text-xs text-neutral-500">Đăng nhập để hiện tối đa {MAX_VISIBLE_ROUTES} lộ trình cùng lúc trên bản đồ và so sánh chúng.</p>
        <Link to="/login?redirect=%2Fmap" className="mt-3 inline-block px-4 py-2 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">Đăng nhập</Link>
      </div>
    );
  }
  if (saved.isLoading && !saved.itineraries.length) {
    return <div className="space-y-2 p-1 animate-pulse">{[0, 1, 2].map((key) => <div key={key} className="h-14 rounded-card bg-neutral-100" />)}</div>;
  }
  if (saved.error && !saved.itineraries.length) {
    return (
      <div className="text-center py-10 px-6">
        <p className="text-sm font-semibold text-neutral-800">Chưa tải được lộ trình đã lưu</p>
        <button type="button" onClick={saved.reload} className="mt-2 text-sm font-semibold text-primary-700 hover:underline">Thử lại</button>
      </div>
    );
  }
  if (!saved.itineraries.length) {
    return (
      <div className="text-center py-10 px-6">
        <Route className="w-9 h-9 mx-auto text-neutral-400" />
        <p className="mt-2 text-sm font-semibold text-neutral-800">Bạn chưa lưu lộ trình nào</p>
        <p className="mt-1 text-xs text-neutral-500">Chọn vài địa điểm ở Khám phá rồi bấm “Gợi ý lộ trình” hoặc hỏi AI Gợi ý nhé.</p>
        <Link to="/" className="mt-3 inline-block px-4 py-2 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">Tạo lộ trình</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="flex items-center gap-1.5 text-xs text-neutral-600">
          <span className="font-semibold text-neutral-800">Đang hiện {visibleRoutes.length}/{MAX_VISIBLE_ROUTES}</span>
          <span className="flex -space-x-1">{visibleRoutes.map(({ itinerary, color }) => <Dot key={itinerary.id} color={color} className="w-3 h-3 ring-2 ring-surface" />)}</span>
        </p>
        {visibleRoutes.length > 0 && (
          <button type="button" onClick={hideAll} className="text-xs font-semibold text-neutral-500 hover:text-danger-600">Ẩn tất cả</button>
        )}
      </div>

      {pending && <ReplacePrompt pending={pending} visibleRoutes={visibleRoutes} onReplace={replaceWithPending} onCancel={cancelPending} />}

      {saved.itineraries.length > SEARCH_FROM && (
        <label className="relative block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Lọc theo tên lộ trình…"
            aria-label="Lọc lộ trình đã lưu"
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 border border-transparent rounded-input text-xs text-neutral-800 focus:outline-none focus:bg-surface focus:border-primary-500"
          />
        </label>
      )}

      {shown.length > 0 && (
        <section aria-label="Đang hiện trên bản đồ">
          <ul className="space-y-1.5">{shown.map(({ itinerary }) => row(itinerary))}</ul>
        </section>
      )}
      {others.length > 0 && (
        <section aria-label="Lộ trình khác">
          {shown.length > 0 && <p className="px-1 pt-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Lộ trình khác — bấm để hiện</p>}
          <ul className="space-y-0.5">{others.map(row)}</ul>
        </section>
      )}
      {keyword && !shown.length && !others.length && <p className="py-6 text-center text-xs text-neutral-500">Không có lộ trình nào tên chứa “{query}”.</p>}
    </div>
  );
};
