import { useState } from 'react';
import { Crosshair, LoaderCircle, MapPin, Search } from 'lucide-react';
import { useLocationPicker } from '../hooks/useLocationPicker';

/**
 * Bản đồ chọn vị trí cửa hàng (dùng khi đăng ký + thêm / sửa cửa hàng).
 * value = { lat, lng } | null; onPick nhận toạ độ + địa chỉ gợi ý từ Goong.
 */
export const LocationPicker = ({ value, onPick, error }) => {
  const { containerRef, isMapReady, status, locateMe, searchAddress } = useLocationPicker(value, onPick);
  const [query, setQuery] = useState('');
  const isBusy = status.isGeocoding || status.isLocating;

  // Không dùng <form>: ô này nằm trong form đăng ký / sửa cửa hàng (form lồng form không hợp lệ)
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    searchAddress(query);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2" role="search">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Tìm địa chỉ cửa hàng</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm địa chỉ, VD 42 Nguyễn Huệ, Quận 1"
            className="w-full pl-9 pr-3 py-2.5 bg-surface border border-neutral-300 rounded-input text-sm focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
          />
        </label>
        <button type="button" onClick={() => searchAddress(query)} disabled={isBusy || !query.trim()} className="px-3.5 rounded-button bg-ink text-white text-sm font-semibold disabled:opacity-50">
          Tìm
        </button>
      </div>

      <div className={`relative h-72 sm:h-80 rounded-card overflow-hidden border ${error ? 'border-danger-500' : 'border-neutral-200'}`}>
        {/* MapLibre ép phần tử bản đồ thành position: relative => bọc 1 lớp absolute bên ngoài */}
        <div className="absolute inset-0">
          <div ref={containerRef} className="w-full h-full" />
        </div>
        {!isMapReady && <div className="absolute inset-0 bg-neutral-100 animate-pulse" aria-hidden="true" />}
        <button
          type="button"
          onClick={locateMe}
          disabled={status.isLocating}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-surface shadow-card text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
        >
          {status.isLocating ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4 text-primary-600" />}
          Vị trí của tôi
        </button>
        {!value && isMapReady && (
          <p className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-pill bg-ink/80 text-white text-xs font-medium whitespace-nowrap pointer-events-none">
            Bấm vào bản đồ để đặt ghim cửa hàng
          </p>
        )}
      </div>

      <p className="flex items-start gap-1.5 text-xs text-neutral-500" aria-live="polite">
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        {status.isGeocoding
          ? 'Đang lấy địa chỉ…'
          : status.message || (value ? 'Kéo ghim để chỉnh chính xác cửa ra vào của quán.' : 'Ghim đặt đúng cửa quán giúp khách chỉ đường tới nơi.')}
      </p>
      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
    </div>
  );
};
