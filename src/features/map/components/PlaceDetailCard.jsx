import { MessageSquareText, PenSquare } from 'lucide-react';
import { Icon } from '../../../components/Icon';
import { formatPlaceHours } from '../../../utils/formatPlace';
import { getCategory } from '../utils/placeCategory';
import { PlaceRating, PlaceTravelInfo } from './PlaceMeta';
import { PlaceThumb } from './PlaceThumb';

// Thẻ chi tiết địa điểm: Bottom Sheet trên mobile, thẻ nổi góc phải trên desktop.
export const PlaceDetailCard = ({ place, vehicleEmoji, onClose, onDirections, onAddToItinerary, onWriteReview, onOpenReviews }) => {
  const { label, soft } = getCategory(place.category);
  const community = place.community_rating ?? { average: 0, count: 0 };

  return (
    <article className="bg-surface rounded-t-card lg:rounded-card shadow-modal p-4 animate-[sheet-up_220ms_ease-out]">
      <div className="w-10 h-1 bg-neutral-300 rounded-pill mx-auto mb-3 lg:hidden" aria-hidden="true" />
      <div className="flex gap-3">
        <PlaceThumb place={place} size="md" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 min-w-0 font-bold text-base leading-snug text-neutral-900 line-clamp-3 [overflow-wrap:anywhere]">{place.name}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="-mt-1 -mr-1 p-1 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <Icon name="close" className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <PlaceRating rating={place.rating} reviewCount={place.review_count} />
            <span className={`${soft} px-2 py-0.5 rounded-pill text-[11px] font-medium`}>{label}</span>
          </div>
          <PlaceTravelInfo place={place} vehicleEmoji={vehicleEmoji} />
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-xs text-neutral-600">
        <div className="flex gap-2">
          <dt><Icon name="pin" className="w-4 h-4 text-neutral-400" /></dt>
          <dd className="flex-1 min-w-0 [overflow-wrap:anywhere]">{place.address}</dd>
        </div>
        <div className="flex gap-2">
          <dt><Icon name="clock" className="w-4 h-4 text-neutral-400" /></dt>
          <dd className="flex-1 min-w-0">Giờ mở cửa: {formatPlaceHours(place)}</dd>
        </div>
      </dl>

      {/* Đánh giá của người dùng MapMate (chữ, ảnh, video) – tách với điểm của nguồn dữ liệu */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-input bg-neutral-50 px-3 py-2 text-xs">
        <span className="flex-1 min-w-0 text-neutral-600">
          {community.count > 0 ? (
            <>👥 <b className="text-neutral-900">{community.average.toFixed(1)}★</b> · {community.count} đánh giá MapMate</>
          ) : (
            'Chưa có đánh giá từ người dùng MapMate'
          )}
        </span>
        <button type="button" onClick={() => onOpenReviews(place)} className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline">
          <MessageSquareText className="w-3.5 h-3.5" /> Xem
        </button>
        <button type="button" onClick={() => onWriteReview(place)} className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline">
          <PenSquare className="w-3.5 h-3.5" /> Viết đánh giá
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(`${place.name} ${place.address || ''}`.trim())}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-primary-600 hover:underline transition-colors"
          title={`Tìm "${place.name}" trên Google`}
        >
          <Icon name="search" className="w-3.5 h-3.5 text-neutral-400" />
          <span>Tìm kiếm trên Google</span>
          <span className="text-[10px] text-neutral-400">↗</span>
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
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
