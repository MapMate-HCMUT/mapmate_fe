import { Link } from 'react-router';
import { Eye, MapPinned, Megaphone, Navigation, PenLine, Trash2 } from 'lucide-react';
import { formatPlaceHours } from '../../../utils/formatPlace';
import { formatPriceRange } from '../../../utils/formatCurrencyVND';
import { getCategory, PlaceThumb } from '../../map';
import { formatCompact } from '../utils/businessConfig';

const Stat = ({ icon: Icon, label, value }) => (
  <span className="inline-flex items-center gap-1" title={label}>
    <Icon className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
    <b className="text-neutral-800 tabular-nums">{formatCompact(value)}</b>
    <span className="sr-only">{label}</span>
  </span>
);

// 1 cửa hàng trong trang quản lý: thông tin chính + số liệu 7 ngày + sửa / xem trên bản đồ / gỡ
export const BusinessPlaceCard = ({ place, onRemove, onNotice, isRemoving }) => {
  const { label, soft } = getCategory(place.category);
  const stats = place.stats_7d;
  return (
    <li className="bg-surface rounded-card shadow-card p-3 sm:p-4 flex gap-3 min-w-0">
      <PlaceThumb place={place} size="md" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 min-w-0 font-bold text-neutral-900 leading-snug line-clamp-2 [overflow-wrap:anywhere]">{place.name}</h3>
          <span className={`${soft} shrink-0 px-2 py-0.5 rounded-pill text-[11px] font-medium`}>{label}</span>
        </div>
        <p className="text-xs text-neutral-500 truncate" title={place.address}>{place.address}</p>
        <p className="text-xs text-neutral-600">
          {formatPriceRange(place.price_range)} · {formatPlaceHours(place)} · {place.gallery.length} ảnh / video
        </p>
        {(place.notice || place.promotion) && (
          <p className="flex flex-wrap gap-1.5 text-[11px]">
            {place.notice && <span className="px-2 py-0.5 rounded-pill bg-warning-50 text-warning-800 font-medium">📢 {place.notice.text}</span>}
            {place.promotion && <span className="px-2 py-0.5 rounded-pill bg-danger-50 text-danger-700 font-semibold">🏷️ {place.promotion.label} · {place.promotion.title}</span>}
          </p>
        )}
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
          <span className="text-neutral-400">7 ngày:</span>
          <Stat icon={MapPinned} label="lượt hiển thị" value={stats.impressions} />
          <Stat icon={Eye} label="lượt xem" value={stats.views} />
          <Stat icon={Navigation} label="lượt chỉ đường" value={stats.directions} />
        </p>
        <div className="flex flex-wrap gap-2 pt-1.5">
          <button type="button" onClick={() => onNotice(place)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-warning-50 hover:bg-warning-100 text-warning-800 text-xs font-semibold">
            <Megaphone className="w-3.5 h-3.5" /> Thông báo nhanh
          </button>
          <Link to={`/business/stores/${place.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold">
            <PenLine className="w-3.5 h-3.5" /> Sửa & ảnh
          </Link>
          <Link
            to={`/map?place=${place.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
          >
            <MapPinned className="w-3.5 h-3.5" /> Xem trên bản đồ
          </Link>
          <button
            type="button"
            onClick={() => onRemove(place)}
            disabled={isRemoving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-danger-600 hover:bg-danger-50 text-xs font-semibold disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Gỡ
          </button>
        </div>
      </div>
    </li>
  );
};
