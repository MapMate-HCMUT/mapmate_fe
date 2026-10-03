import { Link } from 'react-router';
import { Modal } from '../../../components/Modal';
import { getVehicleLabel } from '../utils/itineraryFormat';
import { ItineraryTimeline } from './ItineraryTimeline';
import { TripSummary } from './TripSummary';

const WARNINGS = [
  { when: (summary) => !summary.within_budget, text: 'Vượt tổng ngân sách bạn đặt (đã gồm chi phí di chuyển)' },
  { when: (summary) => !summary.within_duration, text: 'Dài hơn thời lượng bạn chọn' },
  { when: (summary) => !summary.all_open, text: 'Có điểm chưa mở cửa lúc bạn đến' },
  { when: (summary) => summary.unknown_hours_stops > 0, text: (summary) => `${summary.unknown_hours_stops} điểm chưa rõ giờ mở cửa — nên gọi hỏi trước khi đi` },
  { when: (summary) => summary.estimated_price_stops > 0, text: (summary) => `Giá của ${summary.estimated_price_stops} điểm là ước tính theo loại hình` },
];
const warningText = (warning, summary) => (typeof warning.text === 'function' ? warning.text(summary) : warning.text);

// Hộp thoại so sánh các lộ trình được gợi ý, đặt tên và lưu. `onShare(itinerary)` mở khung đăng bài.
export const RouteSuggestionsModal = ({ routes, onShare }) => {
  const { modal, options, criteria, selected, selectedName, savedItinerary, isSaving, isAuthenticated } = routes;
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

        <ItineraryTimeline stops={selected.stops} vehicleEmoji={vehicle.emoji} />

        <div className="pt-4 border-t border-neutral-100 space-y-3">
          {savedItinerary ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex-1 text-sm font-semibold text-success-700">✓ Đã lưu “{savedItinerary.name}”</p>
              <button type="button" onClick={() => onShare(savedItinerary)} className="px-4 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
                Chia sẻ lên bảng tin
              </button>
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={selectedName}
                onChange={(event) => routes.renameSelected(event.target.value)}
                maxLength={80}
                aria-label="Tên lộ trình"
                className="flex-1 py-2.5 px-3 bg-surface border border-neutral-300 rounded-input text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
              <button type="button" onClick={routes.saveSelected} disabled={isSaving} className="px-5 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-70">
                {isSaving ? 'Đang lưu…' : 'Lưu lộ trình này'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              <Link to={`/login?redirect=${encodeURIComponent('/explore')}`} className="font-semibold text-primary-700 hover:underline">Đăng nhập</Link> để lưu và chia sẻ lộ trình này.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
