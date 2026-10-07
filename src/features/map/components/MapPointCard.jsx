import { ZoomIn } from 'lucide-react';
import { Icon } from '../../../components/Icon';
import { formatCoordinates } from '../utils/mapPoint';

const Skeleton = ({ className }) => <span className={`block rounded-pill bg-neutral-200 animate-pulse ${className}`} />;

// Thẻ "điểm đã ghim" khi bấm 1 chỗ bất kỳ trên bản đồ: tên, địa chỉ, đường đi từ vị trí của bạn + nút chỉ đường.
// Bottom Sheet trên mobile, thẻ nổi góc phải trên desktop (giống thẻ địa điểm).
export const MapPointCard = ({ point, vehicleEmoji, onClose, onDirections, onZoomIn }) => (
  <article className="bg-surface rounded-t-card lg:rounded-card shadow-modal p-4 animate-[sheet-up_220ms_ease-out]" aria-live="polite">
    <div className="w-10 h-1 bg-neutral-300 rounded-pill mx-auto mb-3 lg:hidden" aria-hidden="true" />
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-10 h-10 rounded-button bg-neutral-100 flex items-center justify-center" aria-hidden="true">
        <Icon name="pin" className="w-5 h-5 text-neutral-700" />
      </span>
      <div className="flex-1 min-w-0 space-y-1">
        {point.isLoadingPlace && !point.title ? (
          <Skeleton className="h-4 w-2/3 mt-1" />
        ) : (
          <h3 className="font-bold text-base leading-snug text-neutral-900 line-clamp-2 [overflow-wrap:anywhere]">{point.title ?? 'Vị trí đã ghim'}</h3>
        )}
        {point.kindLabel && <span className="inline-block px-2 py-0.5 rounded-pill bg-neutral-100 text-[11px] font-medium text-neutral-700">{point.kindLabel}</span>}
        {point.isLoadingPlace ? (
          <Skeleton className="h-3 w-5/6" />
        ) : (
          <p className="text-xs text-neutral-600 [overflow-wrap:anywhere]">{point.address ?? 'Chưa rõ địa chỉ'}</p>
        )}
        <p className="text-[11px] text-neutral-400">{formatCoordinates(point.coordinates)}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Đóng" className="-mt-1 -mr-1 p-1 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
        <Icon name="close" className="w-4.5 h-4.5" />
      </button>
    </div>

    <div className="mt-3 rounded-input bg-primary-50 px-3 py-2 text-xs text-primary-800">
      {!point.hasOrigin ? (
        <span>Bấm nút "Vị trí của tôi" để xem đường đi từ chỗ bạn tới đây.</span>
      ) : point.isLoadingRoute ? (
        <Skeleton className="h-3 w-1/2 bg-primary-100" />
      ) : point.route ? (
        <>
          <span className="font-semibold">
            {vehicleEmoji} {point.route.durationText} · {point.route.distanceText}
          </span>
          <span className="text-primary-700"> từ vị trí của bạn</span>
          {point.route.note && <span className="block mt-0.5 text-[11px] text-primary-600">{point.route.note}</span>}
        </>
      ) : (
        <span>{point.routeError ?? 'Chưa tìm được đường tới điểm này'}</span>
      )}
    </div>

    {point.nearbyCount > 0 && (
      <button
        type="button"
        onClick={onZoomIn}
        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-button border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
      >
        <ZoomIn className="w-4 h-4" />
        Phóng to xem {point.nearbyCount.toLocaleString('vi-VN')} địa điểm khác quanh đây
      </button>
    )}

    <button
      type="button"
      onClick={onDirections}
      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-button text-sm font-semibold transition"
    >
      <Icon name="navigate" className="w-4 h-4" />
      Chỉ đường tới đây
    </button>
  </article>
);
