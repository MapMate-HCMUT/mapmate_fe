import { Flame, MapPin, Timer } from 'lucide-react';
import { formatCountdown } from '../hooks/useNow';

const KIND = {
  voucher: { emoji: '🎟️', label: 'Voucher giới hạn', action: 'Săn ngay', gradient: 'from-danger-500 to-warning-500' },
  checkin: { emoji: '📍', label: 'Check-in nhận quà', action: 'Check-in tại quán', gradient: 'from-secondary-600 to-primary-500' },
  lucky_wheel: { emoji: '🎡', label: 'Vòng quay may mắn', action: 'Quay ngay', gradient: 'from-violet-600 to-pink-500' },
};
const LOW_STOCK_RATIO = 0.2;

/** Thẻ 1 sự kiện săn voucher: đếm ngược, còn bao nhiêu mã, nút theo loại sự kiện / trạng thái của người xem */
export const HuntEventCard = ({ event, now, isHighlighted, isBusy, onPlay, onShowVoucher }) => {
  const kind = KIND[event.kind];
  const opensIn = new Date(event.starts_at).getTime() - now;
  const endsIn = new Date(event.ends_at).getTime() - now;
  const isScheduled = opensIn > 0;
  const soldOut = event.remaining <= 0;
  const isLow = !soldOut && event.total && event.remaining / event.total <= LOW_STOCK_RATIO;

  let button = { label: kind.action, disabled: false, onClick: () => onPlay(event) };
  if (isScheduled) button = { label: `Mở sau ${formatCountdown(opensIn)}`, disabled: true };
  else if (event.my_voucher && event.kind !== 'lucky_wheel') button = { label: 'Đã săn được · Xem mã', disabled: false, onClick: () => onShowVoucher(event.my_voucher), secondary: true };
  else if (event.kind === 'lucky_wheel' && !event.can_play) button = { label: 'Hôm nay đã quay · mai quay tiếp', disabled: true };
  else if (soldOut) button = { label: 'Đã hết mã', disabled: true };

  return (
    <li id={`event-${event.id}`} className={`bg-surface rounded-card shadow-card overflow-hidden flex flex-col ${isHighlighted ? 'ring-4 ring-accent-400' : ''}`}>
      <div className={`relative bg-gradient-to-br ${kind.gradient} text-white p-4`}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/85">{kind.emoji} {kind.label}</p>
        <p className="mt-1 text-2xl font-extrabold leading-tight">{event.label}</p>
        <p className="text-sm font-semibold text-white/95 line-clamp-2">{event.title}</p>
        <p className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-bold tabular-nums ${isScheduled ? 'bg-white text-danger-600' : 'bg-black/20'}`}>
          <Timer className="w-3 h-3" aria-hidden="true" />
          {isScheduled ? `Mở sau ${formatCountdown(opensIn)}` : `Còn ${formatCountdown(endsIn)}`}
        </p>
      </div>
      <div className="flex-1 p-4 space-y-2">
        <p className="text-sm font-bold text-neutral-900 truncate">{event.business.name}</p>
        <p className="flex items-center gap-1 text-xs text-neutral-500 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {event.place.name} · {event.place.distance_km} km
        </p>
        {event.description && <p className="text-xs text-neutral-600 line-clamp-2">{event.description}</p>}
        {event.kind === 'lucky_wheel' && (
          <p className="text-xs text-neutral-600">🏆 {event.prizes.map((prize) => `${prize.label} (còn ${prize.left})`).join(' · ')}</p>
        )}
        {event.kind === 'checkin' && <p className="text-[11px] text-neutral-500">Mở được khi bạn đứng cách quán dưới {event.checkin_radius_m} m.</p>}
        {event.total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span className={`inline-flex items-center gap-1 ${isLow ? 'font-bold text-danger-600' : ''}`}>
                {isLow && <Flame className="w-3 h-3 fill-danger-500" aria-hidden="true" />}
                {soldOut ? 'Đã hết' : `Còn ${event.remaining}/${event.total}`}
              </span>
            </div>
            <div className="h-1.5 rounded-pill bg-danger-100 overflow-hidden">
              <div className="h-full rounded-pill bg-danger-500" style={{ width: `${(event.remaining / event.total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 pt-0">
        <button
          type="button"
          disabled={button.disabled || isBusy}
          onClick={button.onClick}
          className={`w-full py-2.5 rounded-button text-sm font-bold transition disabled:cursor-not-allowed ${
            button.secondary ? 'bg-success-50 text-success-700 hover:bg-success-100' : 'bg-ink text-white hover:bg-ink/85 disabled:bg-neutral-200 disabled:text-neutral-500'
          }`}
        >
          {isBusy ? 'Đang xử lý…' : button.label}
        </button>
      </div>
    </li>
  );
};
