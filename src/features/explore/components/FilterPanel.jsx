import { PlaceFilters } from './PlaceFilters';
import { TripFilters } from './TripFilters';

// Toàn bộ bộ lọc — nằm trong hộp thoại "Bộ lọc" (tiêu đề do hộp thoại hiện) mở từ nút trên danh sách địa điểm.
export const FilterPanel = ({ filters, options, onChange, onReset, origin, isLocating, onLocate, activeCount }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between -mt-2">
      <p className={`text-sm font-semibold ${activeCount > 0 ? 'text-primary-700' : 'text-neutral-500'}`}>
        {activeCount > 0 ? `Đang bật ${activeCount} bộ lọc` : 'Chưa bật bộ lọc nào'}
      </p>
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
