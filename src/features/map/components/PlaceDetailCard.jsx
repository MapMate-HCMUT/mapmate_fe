import { Icon } from '../../../components/Icon';
import { getCategory } from '../utils/placeCategory';
import { PlaceRating, PlaceTravelInfo } from './PlaceMeta';
import { PlaceThumb } from './PlaceThumb';

// Thẻ chi tiết địa điểm: Bottom Sheet trên mobile, thẻ nổi góc phải trên desktop.
export const PlaceDetailCard = ({ place, vehicleEmoji, onClose, onDirections, onAddToItinerary }) => {
  const { label, soft } = getCategory(place.category);

  return (
    <article className="bg-surface rounded-t-card lg:rounded-card shadow-modal p-4 animate-[sheet-up_220ms_ease-out]">
      <div className="w-10 h-1 bg-neutral-300 rounded-pill mx-auto mb-3 lg:hidden" aria-hidden="true" />
      <div className="flex gap-3">
        <PlaceThumb place={place} size="md" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 font-bold text-base leading-snug text-neutral-900">{place.name}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="-mt-1 -mr-1 p-1 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <Icon name="close" className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <PlaceRating rating={place.rating} reviewCount={place.review_count} />
            <span className={`${soft} px-2 py-0.5 rounded-pill text-[11px] font-medium`}>{label}</span>
          </div>
          <PlaceTravelInfo place={place} vehicleEmoji={vehicleEmoji} />
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-xs text-neutral-600">
        <div className="flex gap-2">
          <dt><Icon name="pin" className="w-4 h-4 text-neutral-400" /></dt>
          <dd className="flex-1">{place.address}</dd>
        </div>
        <div className="flex gap-2">
          <dt><Icon name="clock" className="w-4 h-4 text-neutral-400" /></dt>
          <dd className="flex-1">Giờ mở cửa: {place.opening_hours}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          onClick={() => onDirections(place)}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-button text-sm font-semibold transition"
        >
          <Icon name="navigate" className="w-4 h-4" />
          Chỉ đường
        </button>
        <button
          type="button"
          onClick={() => onAddToItinerary(place)}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-button text-sm font-semibold transition"
        >
          <Icon name="plus" className="w-4 h-4" />
          Thêm hành trình
        </button>
      </div>
    </article>
  );
};
