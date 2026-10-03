import { Icon } from '../../../components/Icon';
import { getTripSummary, getVehicleLabel, VISIBILITY_LABELS } from '../utils/itineraryFormat';
import { ItineraryTimeline } from './ItineraryTimeline';
import { TripSummary } from './TripSummary';

// Thẻ lộ trình đã lưu (tab "Của tôi") hoặc lộ trình nhúng trong bài viết (truyền `actions` khác nhau).
export const ItineraryCard = ({ itinerary, actions, showVisibility = true }) => {
  const vehicle = getVehicleLabel(itinerary.vehicle);
  const visibility = VISIBILITY_LABELS[itinerary.visibility] ?? VISIBILITY_LABELS.private;

  return (
    <article className="bg-surface rounded-card border border-neutral-200 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 leading-snug">🧭 {itinerary.name}</h3>
          <p className="text-xs text-neutral-500">
            {vehicle.emoji} {vehicle.label}
            {itinerary.start_time && <> · xuất phát {itinerary.start_time}</>}
            {showVisibility && <> · {visibility.emoji} {visibility.label}</>}
          </p>
        </div>
      </div>
      <TripSummary summary={getTripSummary(itinerary)} />
      <ItineraryTimeline stops={itinerary.stops} vehicleEmoji={vehicle.emoji} compact />
      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
    </article>
  );
};

export const ItineraryActionButton = ({ icon, children, onClick, tone = 'neutral', disabled }) => {
  const tones = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    neutral: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    danger: 'text-danger-600 hover:bg-danger-50',
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold disabled:opacity-60 transition ${tones[tone]}`}>
      {icon && <Icon name={icon} className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
};
