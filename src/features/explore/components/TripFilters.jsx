import { RangeSlider } from '../../../components/form/RangeSlider';
import { Stepper } from '../../../components/form/Stepper';
import { ToggleSwitch } from '../../../components/form/ToggleSwitch';
import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { formatTime12h } from '../utils/filterConfig';
import { FilterSection } from './FilterSection';
import { TransportFilter } from './TransportFilter';

// Nhóm thiết lập CHUYẾN ĐI: mấy người, đi bằng gì, lúc nào, bao lâu, tổng ngân sách — dùng để lên lộ trình.
export const TripFilters = ({ filters, options, onChange }) => {
  const budget = options.trip_budget;
  const hasBudget = filters.tripBudget !== null;

  return (
    <div className="space-y-5">
      <FilterSection title="Số người">
        <Stepper value={filters.people} min={options.people.min} max={options.people.max} onChange={(value) => onChange('people', value)} ariaLabel="Số người" suffix=" người" />
      </FilterSection>

      <TransportFilter filters={filters} options={options} onChange={onChange} />

      <FilterSection title="Giờ khởi hành">
        <input
          type="time"
          value={filters.startTime}
          onChange={(event) => event.target.value && onChange('startTime', event.target.value)}
          aria-label="Giờ khởi hành"
          className="w-full py-2 px-3 bg-surface border border-neutral-300 rounded-input text-sm text-neutral-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </FilterSection>

      <FilterSection title="Thời lượng chuyến đi" hint={`${filters.durationHours} giờ`}>
        <RangeSlider min={options.duration.min} max={options.duration.max} value={filters.durationHours} onChange={(value) => onChange('durationHours', value)} ariaLabel="Thời lượng chuyến đi (giờ)" />
        <div className="flex justify-between text-[11px] text-neutral-400">
          <span>{options.duration.min} giờ</span>
          <span>{options.duration.max} giờ</span>
        </div>
      </FilterSection>

      {/* Kéo hết sang phải = không giới hạn (giống thanh mức giá) */}
      <FilterSection title="Tổng ngân sách / người" hint={hasBudget ? formatShortVND(filters.tripBudget) : 'Không giới hạn'}>
        <RangeSlider
          min={budget.min}
          max={budget.max}
          step={budget.step}
          value={filters.tripBudget ?? budget.max}
          onChange={(value) => onChange('tripBudget', value >= budget.max ? null : value)}
          ariaLabel="Tổng ngân sách mỗi người"
        />
        <div className="flex justify-between text-[11px] text-neutral-400">
          <span>{formatShortVND(budget.min)}</span>
          <span>{formatShortVND(budget.max)}+</span>
        </div>
      </FilterSection>

      <ToggleSwitch checked={filters.openOnly} onChange={(value) => onChange('openOnly', value)} label={`Chỉ nơi mở cửa lúc ${formatTime12h(filters.startTime)}`} />
    </div>
  );
};
