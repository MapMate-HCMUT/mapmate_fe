import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { ChipGroup } from '../../../components/form/ChipGroup';
import { useMyPins } from '../hooks/useSocialLists';
import { PIN_OPTIONS } from '../utils/socialConfig';
import { PlaceEmbed } from './PlaceEmbed';
import { StarRating } from './StarRating';

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString('vi-VN');

// Danh sách ghim của 1 người; dùng cho tab "Của tôi" và hồ sơ công khai.
export const PinList = ({ pins, emptyText, showPin = true }) => {
  if (pins.length === 0) return <p className="py-6 text-center text-sm text-neutral-500">{emptyText}</p>;
  return (
    <ul className="space-y-2.5">
      {pins.map((pin) => (
        <li key={pin.id}>
          <PlaceEmbed
            place={{ ...pin.place, my_pin: pin.status }}
            showPin={showPin}
            footer={(pin.rating || pin.note || pin.visited_on) && (
              <p className="mt-1 text-xs text-neutral-600">
                {pin.rating && <StarRating value={pin.rating} size="w-3.5 h-3.5" />} {pin.visited_on && <span className="text-neutral-400">· {formatDate(pin.visited_on)}</span>}
                {pin.note && <span className="block italic">“{pin.note}”</span>}
              </p>
            )}
          />
        </li>
      ))}
    </ul>
  );
};

export const PinsPanel = () => {
  const [status, setStatus] = useState('visited'); // tab đang xem — trạng thái hiển thị thuần UI
  const { pins, isLoading, error } = useMyPins(status);

  return (
    <section className="bg-surface rounded-card shadow-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
          <Bookmark className="w-4.5 h-4.5 text-primary-600 shrink-0" />
          <span>Địa điểm đã ghim</span>
        </h2>
        <ChipGroup size="sm" options={PIN_OPTIONS} value={status} onChange={setStatus} ariaLabel="Loại ghim" />
      </div>
      {error && <p className="text-sm text-danger-600">{error.message}</p>}
      {isLoading ? <div className="h-24 rounded-card bg-neutral-100 animate-pulse" /> : (
        <PinList pins={pins} emptyText={status === 'visited' ? 'Chưa ghim nơi nào đã đi. Bấm Ghim trên thẻ địa điểm để lưu lại.' : 'Chưa có nơi nào trong danh sách muốn đi.'} />
      )}
    </section>
  );
};
