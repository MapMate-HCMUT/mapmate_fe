import { Star, Flame, Clock, Phone, Plus, Check, Share2, Bike } from 'lucide-react';
import { formatDistance } from '../../../utils/calculateDistance';
import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { formatDataMonth, formatPlaceAddress, formatPlaceHours, formatPlacePrice, getPlaceRating, isVerifiedPlace, PLACE_SOURCE_LABELS } from '../../../utils/formatPlace';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { PinButton } from '../../social';
import { PlaceThumb } from '../../map/components/PlaceThumb';
import { TAG_ICONS, VEHICLE_ICONS } from '../utils/exploreIcons';
import { PlaceStatusReport } from './PlaceStatusReport';

const MAX_TAGS_SHOWN = 3;
const linkClass = 'font-semibold text-primary-700 hover:underline';

const RatingText = ({ place }) => {
  const rating = getPlaceRating(place);
  if (!rating) return <span className="text-neutral-400">Chưa có đánh giá</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <b className="text-neutral-800">{rating}</b>
      <span className="text-neutral-400">({place.review_count.toLocaleString('vi-VN')})</span>
    </span>
  );
};

// Dữ liệu mở chưa ai xác minh: ghi nguồn + liên hệ để người dùng tự hỏi giờ / giá.
const SourceLine = ({ place }) => (
  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-neutral-400 [overflow-wrap:anywhere]" title="Thông tin từ dữ liệu mở, MapMate chưa xác minh">
    <span>
      Nguồn: {PLACE_SOURCE_LABELS[place.source] ?? place.source} · chưa xác minh
      {place.data_updated_at && <> · cập nhật {formatDataMonth(place.data_updated_at)}</>}
    </span>
    {place.contact?.phone && (
      <a href={`tel:${place.contact.phone}`} className={`${linkClass} inline-flex items-center gap-1`}>
        <Phone className="w-3 h-3 text-neutral-400" /> {place.contact.phone}
      </a>
    )}
    {place.contact?.facebook && <a href={place.contact.facebook} target="_blank" rel="noreferrer" className={linkClass}>Facebook</a>}
  </p>
);

export const PlaceResultCard = ({ place, tagLabels, inDraft, onToggleDraft, onShare }) => {
  const style = getCategoryStyle(place.category);
  const VehicleIcon = VEHICLE_ICONS[place.travel?.mode] || Bike;

  return (
    <li className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow p-3 sm:p-4 flex gap-3 sm:gap-3.5 min-w-0">
      <PlaceThumb place={place} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 min-w-0 font-bold text-neutral-900 leading-snug flex items-start gap-1.5">
            <span className="min-w-0 line-clamp-2 [overflow-wrap:anywhere]" title={place.name}>{place.name}</span>
            {place.is_trending && (
              <span className="inline-flex items-center text-orange-500 shrink-0" title="Đang hot">
                <Flame className="w-4 h-4 fill-orange-500" />
              </span>
            )}
          </h3>
          <span className={`${style.badge} shrink-0 px-2 py-0.5 rounded-pill text-[11px] font-semibold`}>{style.label}</span>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500 truncate" title={formatPlaceAddress(place)}>{formatPlaceAddress(place)}</p>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-neutral-600">
          <RatingText place={place} />
          <span className="font-semibold text-neutral-800" title={place.price_estimated ? 'Giá ước tính theo loại hình, chưa ai xác nhận' : undefined}>
            {formatPlacePrice(place)}
          </span>
          <span>{formatDistance(place.distance_km)}</span>
          <span className="font-semibold text-primary-700 inline-flex items-center gap-1" title={place.travel?.label}>
            <VehicleIcon className="w-3.5 h-3.5 shrink-0" />
            {place.travel_minutes} phút{place.travel?.cost_per_person > 0 && <> · {formatShortVND(place.travel.cost_per_person)}</>}
          </span>
          <span className={`inline-flex items-center gap-1 ${place.hours_known === false ? 'text-neutral-400' : ''}`}>
            <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            {formatPlaceHours(place)}
          </span>
        </p>

        {(place.tags.length > 0 || place.cuisines?.length > 0) && (
          <p className="mt-2 flex flex-wrap gap-1">
            {place.cuisines?.slice(0, 1).map((cuisine) => (
              <span key={cuisine} className="px-2 py-0.5 rounded-pill bg-warning-50 text-[11px] text-warning-700 font-medium">{cuisine}</span>
            ))}
            {place.tags.slice(0, MAX_TAGS_SHOWN).map((tag) => {
              const TagIcon = TAG_ICONS[tag];
              return (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-neutral-100 text-[11px] text-neutral-600 font-medium">
                  {TagIcon && <TagIcon className="w-3 h-3 text-neutral-400 shrink-0" />}
                  <span>{tagLabels[tag] ?? tag}</span>
                </span>
              );
            })}
          </p>
        )}

        {!isVerifiedPlace(place) && <SourceLine place={place} />}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleDraft(place)}
            aria-pressed={inDraft}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold transition ${
              inDraft ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {inDraft ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {inDraft ? 'Bỏ khỏi chuyến đi' : 'Thêm vào chuyến đi'}
          </button>
          <PinButton placeId={place.id} initialStatus={place.my_pin} />
          <button type="button" onClick={() => onShare(place)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold text-neutral-600 hover:bg-neutral-100">
            <Share2 className="w-3.5 h-3.5" />
            Chia sẻ
          </button>
        </div>
        <PlaceStatusReport place={place} />
      </div>
    </li>
  );
};
