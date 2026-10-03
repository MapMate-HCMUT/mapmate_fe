import { PlaceFilters } from './PlaceFilters';
import { TripFilters } from './TripFilters';

// Toàn bộ bộ lọc: dùng cho cột trái (desktop) và hộp thoại "Bộ lọc" (mobile).
export const FilterPanel = ({ filters, options, onChange, onReset, origin, isLocating, onLocate, activeCount }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-neutral-900">
        Bộ lọc {activeCount > 0 && <span className="text-sm font-semibold text-primary-700">({activeCount})</span>}
      </h2>
      <button type="button" onClick={onReset} className="text-xs font-semibold text-neutral-500 hover:text-danger-600">
        Đặt lại
      </button>
    </div>
    <PlaceFilters filters={filters} options={options} onChange={onChange} origin={origin} isLocating={isLocating} onLocate={onLocate} />
    <div className="pt-5 border-t border-neutral-100">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Chuyến đi của bạn</p>
      <TripFilters filters={filters} options={options} onChange={onChange} />
    </div>
  </div>
);
