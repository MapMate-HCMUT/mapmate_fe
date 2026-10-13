import { useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Bookmark, Check, Compass, GripVertical, Pencil, Sparkles, Wand2, X } from 'lucide-react';
import { StayControl, TripSummary } from '../../itinerary';
import { TRIP_DRAFT_MAX_PLACES } from '../stores/tripDraftStore';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';

const formatK = (amount) => `${Math.round(Math.abs(amount) / 1000).toLocaleString('vi-VN')}k`;
const arrowButton = 'p-1 rounded-pill text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent';

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
    {summary.issues?.map((issue) => <li key={issue} className="text-warning-700">⚠ {issue}</li>)}
    <li className="text-neutral-400">Gồm {formatK(summary.transport_cost_per_person)} di chuyển</li>
  </ul>
);

/**
 * Lịch trình các điểm đã chọn theo thứ tự đi (giờ đến · tên · thời gian ở lại).
 * Chế độ "Chỉnh lộ trình": kéo thả hoặc ↑ ↓ để đổi thứ tự, −15′ / +15′ thời gian ở lại, đổi giờ xuất phát.
 */
const TripStops = ({ arrange, isArranging, isUpdating, onRemove }) => {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const { stops } = arrange;

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <ol className={`mt-3 space-y-1.5 transition-opacity ${isUpdating ? 'opacity-60' : ''}`}>
      {stops.map((stop, index) => {
        const { place } = stop;
        const style = getCategoryStyle(place.category);
        return (
          <li
            key={place.id}
            draggable={isArranging}
            onDragStart={(event) => {
              setDragIndex(index);
              event.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(event) => {
              if (dragIndex === null) return;
              event.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex !== null) arrange.move(dragIndex, index);
              endDrag();
            }}
            onDragEnd={endDrag}
            className={`rounded-input transition ${isArranging ? 'border border-neutral-200 bg-surface px-2 py-1.5' : ''} ${
              overIndex === index && dragIndex !== index ? 'ring-2 ring-primary-400' : ''
            } ${dragIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-2 text-sm">
              {isArranging && <GripVertical className="w-4 h-4 shrink-0 text-neutral-300 cursor-grab" aria-hidden="true" />}
              <span className="w-11 shrink-0 text-xs font-bold tabular-nums text-primary-700">{stop.arrival_time ?? '--:--'}</span>
              <span className={`w-2.5 h-2.5 shrink-0 rounded-pill ${style.dot}`} aria-hidden="true" />
              <span className="flex-1 min-w-0 truncate text-neutral-800" title={place.name}>{place.name}</span>
              <button type="button" onClick={() => onRemove(place.id)} aria-label={`Bỏ ${place.name}`} className="p-1 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-danger-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {(isArranging || stop.stay_minutes != null) && (
              <div className={`mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-neutral-500 ${isArranging ? 'pl-6' : 'pl-[3.25rem]'}`}>
                {isArranging && (
                  <span className="inline-flex items-center">
                    <button type="button" onClick={() => arrange.move(index, index - 1)} disabled={index === 0} aria-label={`Đưa ${place.name} lên trước`} className={arrowButton}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => arrange.move(index, index + 1)} disabled={index === stops.length - 1} aria-label={`Đưa ${place.name} xuống sau`} className={arrowButton}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {stop.stay_minutes != null &&
                  (isArranging ? (
                    <StayControl minutes={stop.stay_minutes} range={stop.stay_range} disabled={isUpdating} onChange={(delta) => arrange.adjustStay(place.id, delta)} />
                  ) : (
                    <span>ở lại {stop.stay_minutes} phút</span>
                  ))}
                {stop.closed_on_arrival && (
                  <span className="inline-flex items-center gap-0.5 text-warning-700">
                    <AlertTriangle className="w-3 h-3" /> chưa mở cửa lúc đến
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};

// "Giỏ" chuyến đi: các điểm người dùng tự chọn theo thứ tự đi, chỉnh thứ tự / thời gian, bảng dự kiến, đặt tên và lưu.
export const TripDraftPanel = ({
  places,
  preview,
  arrange,
  tripName,
  onNameChange,
  onSave,
  isSaving,
  isEditing,
  onCancelEdit,
  onRemove,
  onClear,
  onSuggest,
  isSuggesting,
}) => {
  const [isArranging, setIsArranging] = useState(false);
  const canArrange = places.length > 0;

  return (
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

      {isEditing && (
        <div className="mt-2.5 flex items-center justify-between bg-primary-50 text-primary-800 text-xs px-2.5 py-1.5 rounded-input border border-primary-200">
          <span className="font-semibold flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            Đang sửa lộ trình
          </span>
          <button type="button" onClick={onCancelEdit} className="text-primary-700 hover:text-danger-600 hover:underline font-medium">
            Hủy sửa
          </button>
        </div>
      )}

      {places.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">
          Bấm <b>Thêm vào chuyến đi</b> ở những nơi bạn muốn ghé, hoặc để MapMate tự chọn theo bộ lọc.
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {arrange.isManualOrder ? 'Thứ tự bạn chọn' : 'Thứ tự MapMate gợi ý'}
            </p>
            {canArrange && (
              <button
                type="button"
                onClick={() => setIsArranging((value) => !value)}
                aria-pressed={isArranging}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold transition ${
                  isArranging ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                {isArranging ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                {isArranging ? 'Xong' : 'Chỉnh lộ trình'}
              </button>
            )}
          </div>

          {isArranging && (
            <div className="mt-2.5 rounded-input bg-neutral-50 border border-neutral-200 p-2.5 space-y-2">
              <label className="flex items-center justify-between gap-2 text-xs font-semibold text-neutral-600">
                Giờ xuất phát
                <input
                  type="time"
                  value={arrange.startTime}
                  onChange={(event) => event.target.value && arrange.setStartTime(event.target.value)}
                  className="py-1 px-2 bg-surface border border-neutral-300 rounded-input text-sm font-semibold tabular-nums text-neutral-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </label>
              <p className="text-[11px] text-neutral-500">Kéo thả hoặc bấm ↑ ↓ để đổi thứ tự · −/+ để chỉnh thời gian ở lại từng điểm.</p>
              {arrange.isManualOrder && (
                <button type="button" onClick={arrange.autoArrange} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline">
                  <Wand2 className="w-3.5 h-3.5" /> Để MapMate sắp xếp lại cho thuận đường
                </button>
              )}
            </div>
          )}

          <TripStops arrange={arrange} isArranging={isArranging} isUpdating={preview.isUpdating} onRemove={onRemove} />

          {preview.summary && (
            <div className={`mt-3 pt-3 border-t border-neutral-100 transition-opacity ${preview.isUpdating ? 'opacity-50' : ''}`}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Dự kiến</p>
              <TripSummary summary={preview.summary} compact />
              <PreviewNotes summary={preview.summary} />
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
            <label htmlFor="trip-name" className="block text-xs font-semibold text-neutral-600">
              Tên lộ trình
            </label>
            <input
              id="trip-name"
              type="text"
              value={tripName || ''}
              onChange={(event) => onNameChange?.(event.target.value)}
              placeholder={`Chuyến đi ${places.length} điểm`}
              maxLength={80}
              className="w-full py-2 px-3 bg-surface border border-neutral-300 rounded-input text-sm text-neutral-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-card disabled:opacity-70 transition"
            >
              {isEditing ? <Pencil className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isSaving ? 'Đang lưu…' : isEditing ? 'Cập nhật lộ trình' : 'Lưu lộ trình'}
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onSuggest}
        disabled={isSuggesting}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-button text-sm font-bold shadow-card disabled:opacity-70 transition ${
          places.length > 0
            ? 'mt-2 border border-accent-400 bg-accent-50 hover:bg-accent-100 text-accent-700'
            : 'mt-4 bg-accent-500 hover:bg-accent-600 text-white'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        {isSuggesting ? 'Đang lên lộ trình…' : 'Gợi ý lộ trình'}
      </button>
      <p className="mt-2 text-[11px] text-neutral-400 text-center">
        {places.length > 0
          ? 'MapMate gợi ý thêm điểm phù hợp & tối ưu thứ tự'
          : 'Tạo tối đa 3 lộ trình từ bộ lọc và các điểm bạn đã chọn'}
      </p>
    </section>
  );
};
