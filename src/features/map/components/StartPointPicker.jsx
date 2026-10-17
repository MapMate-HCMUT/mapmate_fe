import { useState } from 'react';
import { ChevronDown, LoaderCircle, LocateFixed, MapPin, MousePointerClick, Search } from 'lucide-react';
import { searchAddresses } from '../api/goongGeocode';
import { useMapStore } from '../stores/mapStore';

const optionClass = 'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-input text-left text-sm transition hover:bg-neutral-100';

/**
 * "Xuất phát từ ...": chọn điểm bắt đầu khi chỉ đường — vị trí hiện tại (GPS), chạm 1 điểm trên bản đồ, hoặc tìm địa chỉ.
 * Lựa chọn lưu chung (mapStore) => thẻ địa điểm và cột dẫn đường luôn khớp nhau; đang dẫn đường thì đổi là tìm đường lại.
 * Mở rộng ngay bên dưới (không phải menu nổi) để không bị khung thẻ / cột che mất.
 */
export const StartPointPicker = ({ hasCurrentLocation, onUseCurrentLocation, compact = false }) => {
  const startPoint = useMapStore((state) => state.startPoint);
  const setStartPoint = useMapStore((state) => state.setStartPoint);
  const setPickingStart = useMapStore((state) => state.setPickingStart);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState({ status: 'idle', results: [], error: '' });

  const label = startPoint?.label ?? (hasCurrentLocation ? 'Vị trí hiện tại' : 'Vị trí hiện tại (chưa bật định vị)');
  const close = () => {
    setIsOpen(false);
    setSearch({ status: 'idle', results: [], error: '' });
    setQuery('');
  };

  const useCurrent = () => {
    setStartPoint(null);
    onUseCurrentLocation?.();
    close();
  };
  const pickOnMap = () => {
    setPickingStart(true);
    close();
  };
  const runSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearch({ status: 'loading', results: [], error: '' });
    try {
      const results = await searchAddresses(query.trim());
      setSearch({ status: 'done', results, error: results.length ? '' : 'Không tìm thấy địa chỉ này — thử ghi rõ hơn (số nhà, tên đường, quận).' });
    } catch {
      setSearch({ status: 'done', results: [], error: 'Chưa tìm được địa chỉ, thử lại sau nhé.' });
    }
  };

  return (
    <div className={compact ? '' : 'rounded-input border border-neutral-200 bg-neutral-50/70'}>
      <button
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        className={`w-full flex items-center gap-2 text-left ${compact ? 'py-0.5' : 'px-2.5 py-2'}`}
      >
        <span className="w-3.5 h-3.5 shrink-0 rounded-pill border-[3px] border-slate-900 bg-white shadow-xs" aria-hidden="true" />
        <span className="flex-1 min-w-0">
          {!compact && <span className="block text-[11px] text-neutral-500 leading-tight">Xuất phát từ</span>}
          <span className="block text-xs font-semibold text-neutral-800 truncate" title={label}>{label}</span>
        </span>
        <span className="shrink-0 inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary-700">
          Đổi <ChevronDown className={`w-3.5 h-3.5 transition ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className={`space-y-1 ${compact ? 'mt-2' : 'px-1.5 pb-1.5'}`}>
          <button type="button" onClick={useCurrent} className={`${optionClass} ${!startPoint ? 'text-primary-700 font-semibold' : 'text-neutral-700'}`}>
            <LocateFixed className="w-4 h-4 shrink-0 text-info-600" /> Vị trí hiện tại của tôi
          </button>
          <button type="button" onClick={pickOnMap} className={`${optionClass} text-neutral-700`}>
            <MousePointerClick className="w-4 h-4 shrink-0 text-accent-600" /> Chọn 1 điểm trên bản đồ
          </button>
          <form onSubmit={runSearch} className="flex gap-1.5 px-1 pt-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hoặc nhập địa chỉ, VD: 268 Lý Thường Kiệt"
              aria-label="Tìm địa chỉ xuất phát"
              className="flex-1 min-w-0 py-1.5 px-2.5 bg-surface border border-neutral-300 rounded-input text-sm text-neutral-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <button type="submit" disabled={search.status === 'loading' || !query.trim()} aria-label="Tìm địa chỉ" className="px-2.5 rounded-input bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
              {search.status === 'loading' ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>
          {search.error && <p className="px-2 text-[11px] text-warning-700">{search.error}</p>}
          {search.results.length > 0 && (
            <ul className="max-h-48 overflow-y-auto">
              {search.results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setStartPoint({ coordinates: result.coordinates, label: result.name });
                      close();
                    }}
                    className={`${optionClass} items-start`}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-danger-500" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-neutral-800 truncate">{result.name}</span>
                      <span className="block text-[11px] text-neutral-500 truncate">{result.address}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
