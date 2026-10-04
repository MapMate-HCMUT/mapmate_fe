import { Modal } from '../../../components/Modal';
import { getVehicleLabel } from '../utils/itineraryFormat';
import { ItineraryTimeline } from './ItineraryTimeline';
import { TripSummary } from './TripSummary';

const WARNINGS = [
  { when: (summary) => !summary.within_budget, text: 'Vượt tổng ngân sách bạn đặt (đã gồm chi phí di chuyển)' },
  { when: (summary) => !summary.within_duration, text: 'Dài hơn thời lượng bạn chọn' },
  { when: (summary) => !summary.all_open, text: 'Có điểm chưa mở cửa lúc bạn đến' },
  { when: (summary) => summary.maybe_closed_stops > 0, text: (summary) => `${summary.maybe_closed_stops} điểm có người báo đã đóng cửa — nên gọi hỏi trước` },
  { when: (summary) => summary.unknown_hours_stops > 0, text: (summary) => `${summary.unknown_hours_stops} điểm chưa rõ giờ mở cửa — nên gọi hỏi trước khi đi` },
  { when: (summary) => summary.estimated_price_stops > 0, text: (summary) => `Giá của ${summary.estimated_price_stops} điểm là ước tính theo loại hình` },
];
const warningText = (warning, summary) => (typeof warning.text === 'function' ? warning.text(summary) : warning.text);

// Hộp thoại so sánh các lộ trình được gợi ý. Người dùng xem, có thể chỉnh thời gian ở lại, rồi bấm "Chọn lộ trình này" để đưa ra ngoài giỏ chuyến đi chỉnh sửa và lưu.
export const RouteSuggestionsModal = ({ routes, onSelect }) => {
  const { modal, options, criteria, selected } = routes;
  if (!selected) return null;
  const vehicle = getVehicleLabel(criteria.vehicle);
  const { summary } = selected;
  const warnings = WARNINGS.filter((warning) => warning.when(summary));

  return (
    <Modal isOpen={modal.isOpen} title="Gợi ý lộ trình" onClose={modal.close} containerRef={modal.containerRef} size="lg">
      <div className="space-y-4">
        <div className={`grid gap-1 p-1 bg-neutral-100 rounded-button ${options.length === 3 ? 'grid-cols-3' : options.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`} role="tablist">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={option.key === selected.key}
              onClick={() => routes.selectOption(option.key)}
              className={`py-2 px-1 rounded-input text-xs sm:text-sm font-semibold transition ${option.key === selected.key ? 'bg-surface text-primary-700 shadow-card' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-neutral-600">{selected.description}. Xuất phát {summary.start_time}, kết thúc khoảng {summary.end_time} · {vehicle.emoji} {vehicle.label}.</p>
        <TripSummary summary={summary} />

        {warnings.length > 0 && (
          <ul className="p-3 rounded-input bg-warning-50 border border-warning-200 text-xs text-warning-800 space-y-0.5">
            {warnings.map((warning) => <li key={warningText(warning, summary)}>⚠️ {warningText(warning, summary)}</li>)}
          </ul>
        )}

        <ItineraryTimeline stops={selected.stops} onAdjustStay={routes.adjustStay} isAdjusting={routes.isAdjusting} />

        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            Bấm <b>Chọn lộ trình này</b> để nạp vào danh sách Chuyến đi, tự do thêm/bớt điểm trước khi lưu.
          </p>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={modal.close}
              className="px-4 py-2.5 rounded-button border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-sm font-semibold transition"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => onSelect?.(selected)}
              className="px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-card transition flex items-center gap-1.5"
            >
              <span>Chọn lộ trình này</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
