import { LocateFixed, LoaderCircle } from 'lucide-react';

const fabClass =
  'relative w-11 h-11 bg-surface rounded-pill shadow-card-hover flex items-center justify-center text-lg hover:bg-surface-hover transition';
// Nhãn chữ dưới mỗi nút: icon / emoji đứng một mình thì người dùng không đoán được nút làm gì
const captionClass = 'mt-1 px-1.5 rounded-pill bg-surface/90 text-[10px] font-semibold leading-4 text-neutral-700 shadow-card whitespace-nowrap pointer-events-none';

// Lời nhắc lần đầu cho nút "Vị trí của tôi" (chỉ sang nút, bấm "Đã hiểu" là thôi hiện)
const LocateHint = ({ onDismiss }) => (
  <div role="note" className="absolute right-14 top-0 w-56 rounded-card bg-neutral-900 text-white p-3 shadow-modal animate-[toast-in_200ms_ease-out]">
    <span className="absolute -right-1.5 top-4 w-3 h-3 rotate-45 bg-neutral-900" aria-hidden="true" />
    <p className="text-xs font-bold">📍 Vị trí của tôi</p>
    <p className="mt-1 text-[11px] leading-snug text-neutral-200">
      Bấm để đưa bản đồ về chỗ bạn đang đứng. MapMate dùng vị trí này để tính khoảng cách, thời gian và chỉ đường.
    </p>
    <button type="button" onClick={onDismiss} className="mt-2 rounded-pill bg-white/15 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/25">
      Đã hiểu
    </button>
  </div>
);

// Bộ nút lọc nhanh (FABs) bên phải bản đồ — thao tác một tay trên điện thoại.
// Điện thoại: đặt ngay dưới nút phóng to / thu nhỏ để thẻ địa điểm (bottom sheet) không che mất.
export const MapQuickActions = ({ filters, openKey, onToggle, onSelectOption, onLocate, isLocating, showLocateHint, onDismissLocateHint }) => (
  <div className="absolute right-3 top-24 lg:top-1/2 lg:-translate-y-1/2 z-20 flex flex-col items-end gap-2">
    {filters.map((filter) => (
      <div key={filter.key} className="relative flex flex-col items-end">
        <button
          type="button"
          onClick={() => onToggle(filter.key)}
          title={filter.title}
          aria-label={filter.title}
          aria-expanded={openKey === filter.key}
          className={`${fabClass} ${openKey === filter.key ? 'ring-2 ring-primary-500' : ''}`}
        >
          <span aria-hidden="true">{filter.emoji}</span>
          {filter.badge && (
            <span className="absolute -top-1 -left-2 px-1.5 py-px rounded-pill bg-primary-600 text-white text-[10px] font-bold shadow-card">
              {filter.badge}
            </span>
          )}
        </button>
        <span className={captionClass} aria-hidden="true">{filter.title}</span>

        {openKey === filter.key && (
          <div className="absolute right-14 top-0 w-44 bg-surface rounded-card shadow-modal p-1.5" role="menu">
            <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              {filter.title}
            </p>
            {filter.options.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                role="menuitemradio"
                aria-checked={option.value === filter.value}
                onClick={() => onSelectOption(filter, option.value)}
                className={`w-full text-left px-2.5 py-2 rounded-input text-sm transition ${
                  option.value === filter.value
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    ))}

    <div className="relative flex flex-col items-end">
      <button
        type="button"
        onClick={onLocate}
        title="Vị trí của tôi — đưa bản đồ về chỗ bạn đang đứng"
        aria-label="Vị trí của tôi"
        className={`${fabClass} ${showLocateHint ? 'ring-2 ring-info-500 ring-offset-2' : ''}`}
      >
        {isLocating ? <LoaderCircle className="w-5 h-5 text-info-600 animate-spin" /> : <LocateFixed className="w-5 h-5 text-info-600" />}
      </button>
      <span className={captionClass} aria-hidden="true">{isLocating ? 'Đang tìm…' : 'Vị trí của tôi'}</span>
      {showLocateHint && <LocateHint onDismiss={onDismissLocateHint} />}
    </div>
  </div>
);
