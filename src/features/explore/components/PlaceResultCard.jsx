import { Star, Flame, Clock, Phone, Plus, Check, Share2, Bike, MessageSquareText, MapPin, Wallet } from 'lucide-react';
import { formatDistance } from '../../../utils/calculateDistance';
import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { formatDataMonth, formatPlaceAddress, formatPlaceHours, formatPlacePrice, getPlaceRating, isVerifiedPlace, PLACE_SOURCE_LABELS } from '../../../utils/formatPlace';
import { getCategoryStyle } from '../../../utils/placeCategoryStyle';
import { formatPhoneDisplay } from '../../../utils/phone';
import { PartnerBadge } from '../../business/components/PartnerBadge';
import { PromoChip } from '../../business/components/PromoChip';
import { PinButton } from '../../social';
import { PlaceThumb } from '../../map/components/PlaceThumb';
import { TAG_ICONS, VEHICLE_ICONS } from '../utils/exploreIcons';
import { PlaceStatusReport } from './PlaceStatusReport';

const MAX_TAGS_SHOWN = 3;
const linkClass = 'font-semibold text-primary-700 hover:underline';

const RatingText = ({ place }) => {
  const rating = getPlaceRating(place);
  if (!rating) return <span className="text-neutral-500">Chưa có đánh giá</span>;
  return (
    <span>
      <b className="text-neutral-900">{rating}</b> <span className="text-neutral-500">({place.review_count.toLocaleString('vi-VN')} đánh giá)</span>
    </span>
  );
};

// 1 ô thông tin trong lưới 2 cột: icon + nội dung (chữ 14px cho dễ đọc)
const InfoItem = ({ icon: InfoIcon, iconClass = 'text-neutral-400', children, title, muted = false }) => (
  <div className={`flex items-start gap-2 min-w-0 ${muted ? 'text-neutral-500' : 'text-neutral-700'}`} title={title}>
    <InfoIcon className={`w-4 h-4 mt-0.5 shrink-0 ${iconClass}`} aria-hidden="true" />
    <span className="min-w-0">{children}</span>
  </div>
);

// Dữ liệu mở chưa ai xác minh: ghi nguồn + liên hệ để người dùng tự hỏi giờ / giá.
const SourceLine = ({ place }) => (
  <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500 [overflow-wrap:anywhere]" title="Thông tin từ dữ liệu mở, MapMate chưa xác minh">
    <span>
      Nguồn: {PLACE_SOURCE_LABELS[place.source] ?? place.source} · chưa xác minh
      {place.data_updated_at && <> · cập nhật {formatDataMonth(place.data_updated_at)}</>}
    </span>
    {place.contact?.phone && (
      <a href={`tel:${place.contact.phone}`} className={`${linkClass} inline-flex items-center gap-1`}>
        <Phone className="w-3 h-3 text-neutral-400" /> {formatPhoneDisplay(place.contact.phone)}
      </a>
    )}
    {place.contact?.facebook && <a href={place.contact.facebook} target="_blank" rel="noreferrer" className={linkClass}>Facebook</a>}
  </p>
);

// Thẻ địa điểm: ảnh bên trái (điện thoại: dải ảnh phía trên), tên to, thông tin xếp lưới 2 cột chữ 14px —
// đủ gọn để 1 màn hình máy tính thấy ~3 quán mà vẫn dễ đọc
// "Đánh giá" mở danh sách đánh giá cộng đồng (trong đó có nút Viết đánh giá) => 1 nút thay cho 2, hàng nút luôn vừa 1 dòng
export const PlaceResultCard = ({ place, tagLabels, inDraft, onToggleDraft, onShare, onOpenReviews }) => {
  const community = place.community_rating ?? { average: 0, count: 0 };
  const style = getCategoryStyle(place.category);
  const VehicleIcon = VEHICLE_ICONS[place.travel?.mode] || Bike;
  const secondaryButton = 'inline-flex items-center gap-1.5 px-2 py-1.5 rounded-button text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition';

  return (
    <li className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow overflow-hidden min-w-0 flex flex-col sm:flex-row">
      <div className="relative shrink-0 aspect-[16/7] sm:aspect-auto sm:w-40 lg:w-44 bg-neutral-100">
        <PlaceThumb place={place} size="cover" />
        <div className="absolute top-2 left-2 right-2 flex flex-wrap items-start justify-between gap-1.5 pointer-events-none">
          <span className={`${style.badge} px-2 py-0.5 rounded-pill text-[11px] font-bold shadow-card`}>{style.label}</span>
          {place.is_trending && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-orange-500 text-white text-[11px] font-bold shadow-card">
              <Flame className="w-3 h-3 fill-white" /> Hot
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 p-4">
        <h3 className="text-base sm:text-lg font-bold leading-snug text-neutral-900 line-clamp-1 [overflow-wrap:anywhere]" title={place.name}>{place.name}</h3>
        {(place.business || place.promotion) && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <PartnerBadge business={place.business} />
            <PromoChip promotion={place.promotion} />
            {place.notice && <span className="text-xs text-warning-700">📢 {place.notice.text}</span>}
          </p>
        )}
        <p className="mt-1 flex items-start gap-1.5 text-sm text-neutral-500">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
          <span className="truncate" title={formatPlaceAddress(place)}>{formatPlaceAddress(place)}</span>
        </p>

        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 text-sm">
          <InfoItem icon={Star} iconClass="fill-amber-400 text-amber-400">
            <RatingText place={place} />
          </InfoItem>
          <InfoItem icon={Wallet} title={place.price_estimated ? 'Giá ước tính theo loại hình, chưa ai xác nhận' : undefined}>
            <b className="text-neutral-900">{formatPlacePrice(place)}</b>
            {place.price_estimated && <span className="text-neutral-500"> (ước tính)</span>}
          </InfoItem>
          <InfoItem icon={VehicleIcon} iconClass="text-primary-600" title={place.travel?.label}>
            <span className="font-semibold text-primary-700">{place.travel_minutes} phút</span>
            <span className="text-neutral-500"> · {formatDistance(place.distance_km)}</span>
            {place.travel?.cost_per_person > 0 && <span className="text-neutral-500"> · {formatShortVND(place.travel.cost_per_person)}</span>}
          </InfoItem>
          <InfoItem icon={Clock} muted={place.hours_known === false}>
            {formatPlaceHours(place)}
          </InfoItem>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {place.cuisines?.slice(0, 1).map((cuisine) => (
            <span key={cuisine} className="px-2 py-0.5 rounded-pill bg-warning-50 text-xs text-warning-700 font-medium">{cuisine}</span>
          ))}
          {place.tags.slice(0, MAX_TAGS_SHOWN).map((tag) => {
            const TagIcon = TAG_ICONS[tag];
            return (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-neutral-100 text-xs text-neutral-700 font-medium">
                {TagIcon && <TagIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
                <span>{tagLabels[tag] ?? tag}</span>
              </span>
            );
          })}
          <PlaceStatusReport place={place} inline />
        </div>

        {!isVerifiedPlace(place) && !place.business && <SourceLine place={place} />}
        {place.business && (
          <p className="mt-2 text-xs text-neutral-500">
            Thông tin do chủ cửa hàng cập nhật{place.data_updated_at && <> · {formatDataMonth(place.data_updated_at)}</>}
            {place.contact?.phone && (
              <> · <a href={`tel:${place.contact.phone}`} className={linkClass}>{formatPhoneDisplay(place.contact.phone)}</a></>
            )}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleDraft(place)}
            aria-pressed={inDraft}
            className={`mr-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-[13px] font-semibold transition ${
              inDraft ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {inDraft ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {inDraft ? 'Bỏ khỏi chuyến đi' : 'Thêm vào chuyến đi'}
          </button>
          <PinButton placeId={place.id} initialStatus={place.my_pin} size="md" />
          <button type="button" onClick={() => onShare(place)} className={secondaryButton}>
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </button>
          <button type="button" onClick={() => onOpenReviews(place)} className={secondaryButton} title="Xem & viết đánh giá">
            <MessageSquareText className="w-4 h-4" />
            Đánh giá{community.count > 0 && <span className="text-neutral-500 font-medium"> · {community.average.toFixed(1)}★ ({community.count})</span>}
          </button>
        </div>
      </div>
    </li>
  );
};
