import { ChipGroup } from '../../../components/form/ChipGroup';
import { CUSTOM_VEHICLE } from '../utils/filterConfig';
import { FilterSection } from './FilterSection';

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString('vi-VN');

// Phương tiện di chuyển: chọn 1 kiểu có sẵn hoặc "Tuỳ chỉnh" để tự kết hợp; kèm bảng giá vé hiện hành (thu gọn).
export const TransportFilter = ({ filters, options, onChange }) => {
  const selected = options.vehicles.find((vehicle) => vehicle.value === filters.vehicle);
  const isCustom = filters.vehicle === CUSTOM_VEHICLE;

  return (
    <FilterSection title="Phương tiện">
      <ChipGroup size="sm" options={options.vehicles} value={filters.vehicle} onChange={(value) => onChange('vehicle', value)} ariaLabel="Phương tiện" />
      {selected?.description && <p className="text-xs text-neutral-500">{selected.description}</p>}

      {isCustom && (
        <div className="p-3 rounded-input bg-neutral-50 border border-neutral-200 space-y-2">
          <p className="text-xs font-semibold text-neutral-600">Kết hợp các phương tiện:</p>
          <ChipGroup multiple size="sm" options={options.custom_modes} value={filters.customModes} onChange={(value) => onChange('customModes', value)} ariaLabel="Phương tiện kết hợp" />
          <p className="text-[11px] text-neutral-400">
            {filters.customModes.length === 0 ? 'Chưa chọn gì — sẽ chỉ đi bộ.' : 'Đi bộ luôn được dùng cho đoạn ngắn. Mỗi chặng tự chọn cách nhanh và rẻ nhất.'}
          </p>
        </div>
      )}

      {options.fares && (
        <details className="group text-xs">
          <summary className="cursor-pointer select-none font-semibold text-info-700 hover:underline list-none">
            💡 Giá vé metro hiện hành <span className="group-open:hidden">▾</span><span className="hidden group-open:inline">▴</span>
          </summary>
          <ul className="mt-2 space-y-2 text-neutral-600">
            {options.fares.items.map((item) => (
              <li key={item.mode}>
                <p className="font-semibold text-neutral-800">{item.emoji} {item.title}</p>
                {item.lines.map((line) => <p key={line}>{line}</p>)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-neutral-400">Cập nhật {formatDate(options.fares.updated_at)} · giá từng chặng trong lộ trình là ước tính theo quãng đường.</p>
        </details>
      )}
    </FilterSection>
  );
};
