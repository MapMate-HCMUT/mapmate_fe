import { ChipGroup } from '../../../components/form/ChipGroup';
import { DualRangeSlider } from '../../../components/form/DualRangeSlider';
import { RangeSlider } from '../../../components/form/RangeSlider';
import { Icon } from '../../../components/Icon';
import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { PRICE_MAX, PRICE_MIN, PRICE_STEP } from '../utils/filterConfig';
import { FilterSection } from './FilterSection';

const ANY_RATING = { value: null, label: 'Tất cả' };
const formatPriceRange = ([low, high]) => `${formatShortVND(low)} – ${high >= PRICE_MAX ? `${formatShortVND(PRICE_MAX)}+` : formatShortVND(high)}`;

// Nhóm bộ lọc ĐỊA ĐIỂM: đi đâu, kiểu gì, giá bao nhiêu, cách bao xa.
export const PlaceFilters = ({ filters, options, onChange, origin, isLocating, onLocate }) => (
  <div className="space-y-5">
    <FilterSection title="Loại hình">
      <ChipGroup multiple options={options.categories} value={filters.categories} onChange={(value) => onChange('categories', value)} ariaLabel="Loại hình" />
    </FilterSection>

    {options.tags.length > 0 && (
      <FilterSection title="Phong cách / dịp">
        <ChipGroup multiple size="sm" options={options.tags} value={filters.tags} onChange={(value) => onChange('tags', value)} ariaLabel="Phong cách" />
      </FilterSection>
    )}

    <FilterSection title="Mức giá mỗi điểm (đ/người)" hint={formatPriceRange(filters.priceRange)}>
      <DualRangeSlider min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={filters.priceRange} onChange={(value) => onChange('priceRange', value)} ariaLabel="Mức giá" />
    </FilterSection>

    <FilterSection title="Bán kính" hint={`${filters.radiusKm} km`}>
      <RangeSlider min={options.radius.min} max={options.radius.max} value={filters.radiusKm} onChange={(value) => onChange('radiusKm', value)} ariaLabel="Bán kính tìm kiếm" />
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
        <span className="truncate">Tính từ: {origin.label}</span>
        <button type="button" onClick={onLocate} disabled={isLocating} className="shrink-0 inline-flex items-center gap-1 font-semibold text-info-700 hover:underline disabled:opacity-60">
          <Icon name="locate" className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          Vị trí của tôi
        </button>
      </div>
    </FilterSection>

    <FilterSection title="Đánh giá tối thiểu">
      <ChipGroup
        size="sm"
        options={[ANY_RATING, ...options.min_ratings.map((rating) => ({ value: rating, label: `★ ${rating}+` }))]}
        value={filters.minRating}
        onChange={(value) => onChange('minRating', value)}
        ariaLabel="Đánh giá tối thiểu"
      />
    </FilterSection>

    {options.districts.length > 0 && (
      <FilterSection title="Khu vực">
        <select
          value={filters.district}
          onChange={(event) => onChange('district', event.target.value)}
          aria-label="Khu vực"
          className="w-full py-2 px-3 bg-surface border border-neutral-300 rounded-input text-sm text-neutral-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Tất cả quận</option>
          {options.districts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </FilterSection>
    )}
  </div>
);
