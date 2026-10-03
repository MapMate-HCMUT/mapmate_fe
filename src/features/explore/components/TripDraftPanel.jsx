import { Compass, Sparkles, X } from 'lucide-react';
import { TripSummary } from '../../itinerary';
import { TRIP_DRAFT_MAX_PLACES } from '../stores/tripDraftStore';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';

const formatK = (amount) => `${Math.round(Math.abs(amount) / 1000).toLocaleString('vi-VN')}k`;

// 1–2 dòng nhận xét nhanh: còn dư hay vượt ngân sách / thời lượng.
const PreviewNotes = ({ summary }) => (
  <ul className="mt-2 space-y-0.5 text-xs">
    {summary.budget_left != null && (
      <li className={summary.budget_left >= 0 ? 'text-success-700' : 'text-danger-600'}>
        {summary.budget_left >= 0 ? `✓ Còn dư ${formatK(summary.budget_left)} ngân sách` : `⚠ Vượt ngân sách ${formatK(summary.budget_left)}`}
      </li>
    )}
    {summary.time_left_minutes != null && summary.time_left_minutes < 0 && <li className="text-danger-600">⚠ Dài hơn thời lượng dự định {-summary.time_left_minutes} phút</li>}
    {!summary.all_open && <li className="text-warning-700">⚠ Có điểm chưa mở cửa lúc bạn đến</li>}
    {summary.unknown_hours_stops > 0 && <li className="text-warning-700">⚠ {summary.unknown_hours_stops} điểm chưa rõ giờ mở cửa</li>}
    {summary.maybe_closed_stops > 0 && <li className="text-danger-600">⚠ {summary.maybe_closed_stops} điểm có người báo đã đóng cửa</li>}
    <li className="text-neutral-400">Gồm {formatK(summary.transport_cost_per_person)} di chuyển · bấm Gợi ý lộ trình để xem chi tiết</li>
  </ul>
);

// "Giỏ" chuyến đi: các điểm người dùng tự chọn, bảng tổng hợp dự kiến (tính lại khi đổi bộ lọc) và nút lên lộ trình.
export const TripDraftPanel = ({ places, preview, onRemove, onClear, onSuggest, isSuggesting }) => (
  <section className="bg-surface rounded-card shadow-card p-4">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-neutral-900 inline-flex items-center gap-1.5">
        <Compass className="w-4 h-4 text-primary-600" />
        Chuyến đi <span className="text-sm font-semibold text-neutral-400">{places.length}/{TRIP_DRAFT_MAX_PLACES}</span>
      </h2>
      {places.length > 0 && (
        <button type="button" onClick={onClear} className="text-xs font-semibold text-neutral-500 hover:text-danger-600">Xoá hết</button>
      )}
    </div>

    {places.length === 0 ? (
      <p className="mt-2 text-sm text-neutral-500">
        Bấm <b>Thêm vào chuyến đi</b> ở những nơi bạn muốn ghé, hoặc để MapMate tự chọn theo bộ lọc.
      </p>
    ) : (
      <>
        <ul className="mt-3 space-y-1.5">
          {places.map((place) => (
            <li key={place.id} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 shrink-0 rounded-pill ${getCategoryStyle(place.category).dot}`} aria-hidden="true" />
              <span className="flex-1 truncate text-neutral-800">{place.name}</span>
              <button type="button" onClick={() => onRemove(place.id)} aria-label={`Bỏ ${place.name}`} className="p-1 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-danger-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
        {preview.summary && (
          <div className={`mt-3 pt-3 border-t border-neutral-100 transition-opacity ${preview.isUpdating ? 'opacity-50' : ''}`}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Dự kiến</p>
            <TripSummary summary={preview.summary} compact />
            <PreviewNotes summary={preview.summary} />
          </div>
        )}
      </>
    )}

    <button
      type="button"
      onClick={onSuggest}
      disabled={isSuggesting}
      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-button bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold shadow-card disabled:opacity-70 transition"
    >
      <Sparkles className="w-4 h-4" />
      {isSuggesting ? 'Đang lên lộ trình…' : 'Gợi ý lộ trình'}
    </button>
    <p className="mt-2 text-[11px] text-neutral-400 text-center">Tạo tối đa 3 lộ trình từ bộ lọc và các điểm bạn đã chọn</p>
  </section>
);
