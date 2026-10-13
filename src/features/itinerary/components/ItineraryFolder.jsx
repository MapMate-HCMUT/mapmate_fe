import { useState } from 'react';
import { Check, ChevronDown, Folder, FolderOpen, Pencil, X } from 'lucide-react';
import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { formatDuration } from '../../../utils/formatTrip';
import { getTripSummary, getVehicleLabel, VISIBILITY_LABELS } from '../utils/itineraryFormat';
import { ItineraryTimeline } from './ItineraryTimeline';
import { TripSummary } from './TripSummary';

const NAME_MAX_LENGTH = 80; // khớp ITINERARY_NAME_MAX_LENGTH ở backend

// Ô đổi tên ngay tại chỗ: Enter = lưu, Esc = huỷ
const RenameForm = ({ initialName, onSave, onCancel }) => {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const trimmed = name.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (!trimmed || trimmed === initialName) return onCancel();
    setIsSaving(true);
    const ok = await onSave(trimmed);
    if (!ok) setIsSaving(false);
    return undefined;
  };

  return (
    <form onSubmit={submit} className="flex-1 min-w-0 flex items-center gap-1.5">
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onCancel()}
        maxLength={NAME_MAX_LENGTH}
        disabled={isSaving}
        aria-label="Tên lộ trình mới"
        className="flex-1 min-w-0 py-1.5 px-2.5 bg-surface border border-primary-400 rounded-input text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
      <button type="submit" disabled={isSaving || !trimmed} aria-label="Lưu tên" className="p-1.5 rounded-pill bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
        <Check className="w-4 h-4" />
      </button>
      <button type="button" onClick={onCancel} disabled={isSaving} aria-label="Huỷ đổi tên" className="p-1.5 rounded-pill text-neutral-500 hover:bg-neutral-100">
        <X className="w-4 h-4" />
      </button>
    </form>
  );
};

/**
 * Lộ trình đã lưu dạng "thư mục": thu gọn chỉ hiện tên + vài số chính; bấm vào mới mở lịch trình chi tiết và các nút.
 * `onRename(itinerary, name)` trả về true khi đổi tên thành công.
 */
export const ItineraryFolder = ({ itinerary, isOpen, onToggle, onRename, actions }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const summary = getTripSummary(itinerary);
  const vehicle = getVehicleLabel(itinerary.vehicle);
  const VehicleIcon = vehicle.icon;
  const visibility = VISIBILITY_LABELS[itinerary.visibility] ?? VISIBILITY_LABELS.private;
  const FolderIcon = isOpen ? FolderOpen : Folder;
  const stopCount = itinerary.stops?.length ?? 0;
  const panelId = `itinerary-${itinerary.id}`;

  return (
    <li className={`rounded-card border transition ${isOpen ? 'border-primary-200 bg-surface shadow-card' : 'border-neutral-200 bg-surface hover:border-neutral-300'}`}>
      <div className="flex items-center gap-2 p-3">
        {isRenaming ? (
          <>
            <FolderIcon className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" />
            <RenameForm
              initialName={itinerary.name}
              onCancel={() => setIsRenaming(false)}
              onSave={async (name) => {
                const ok = await onRename(itinerary, name);
                if (ok) setIsRenaming(false);
                return ok;
              }}
            />
          </>
        ) : (
          <>
            <button type="button" onClick={onToggle} aria-expanded={isOpen} aria-controls={panelId} className="flex-1 min-w-0 flex items-center gap-2.5 text-left">
              <FolderIcon className={`w-5 h-5 shrink-0 ${isOpen ? 'text-primary-600' : 'text-accent-500'}`} aria-hidden="true" />
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-neutral-900 truncate">{itinerary.name}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500">
                  <span>{stopCount} điểm</span>
                  {summary.total_minutes > 0 && <span>· {formatDuration(summary.total_minutes)}</span>}
                  {summary.cost_per_person > 0 && <span>· ~{formatShortVND(summary.cost_per_person)}/người</span>}
                  <span className="inline-flex items-center gap-1">· {VehicleIcon && <VehicleIcon className="w-3 h-3" />}{vehicle.label}</span>
                </span>
              </span>
            </button>
            <button type="button" onClick={() => setIsRenaming(true)} aria-label={`Đổi tên "${itinerary.name}"`} title="Đổi tên" className="p-1.5 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-primary-700">
              <Pencil className="w-4 h-4" />
            </button>
            <button type="button" onClick={onToggle} aria-label={isOpen ? 'Thu gọn' : 'Mở lộ trình'} className="p-1.5 rounded-pill text-neutral-400 hover:bg-neutral-100">
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </>
        )}
      </div>

      {isOpen && (
        <div id={panelId} className="px-3 pb-3 space-y-3 border-t border-neutral-100 pt-3">
          <p className="text-xs text-neutral-500">
            {itinerary.start_time && <>Xuất phát {itinerary.start_time} · </>}
            {visibility.label}
          </p>
          <TripSummary summary={summary} />
          <ItineraryTimeline stops={itinerary.stops} vehicleIcon={VehicleIcon} vehicleEmoji={vehicle.emoji} compact />
          {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
        </div>
      )}
    </li>
  );
};
