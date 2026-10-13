import { useState } from 'react';
import { Compass, Navigation } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { useMyItineraries } from '../hooks/useMyItineraries';
import { ItineraryActionButton } from './ItineraryCard';
import { ItineraryFolder } from './ItineraryFolder';

// Danh sách lộ trình đã lưu của tôi (dạng thư mục, bấm mới mở). `onStart(itinerary)` chuyển sang tab Bản đồ để bắt đầu,
// `onShare(itinerary)` mở khung đăng bài chia sẻ, `onEdit(itinerary)` chuyển sang tab Địa điểm để sửa.
export const MyItinerariesPanel = ({ onShare, onEdit, onStart }) => {
  const { itineraries, isLoading, error, remove, rename, reload } = useMyItineraries();
  const [openIds, setOpenIds] = useState(() => new Set());
  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="bg-surface rounded-card shadow-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
          <Compass className="w-4.5 h-4.5 text-primary-600 shrink-0" />
          <span>Lộ trình đã lưu</span>
          <span className="text-sm font-semibold text-neutral-400">{itineraries.length}</span>
        </h2>
        {itineraries.length > 1 && (
          <button
            type="button"
            onClick={() => setOpenIds(openIds.size ? new Set() : new Set(itineraries.map((itinerary) => itinerary.id)))}
            className="text-xs font-semibold text-neutral-500 hover:text-primary-700"
          >
            {openIds.size ? 'Thu gọn tất cả' : 'Mở tất cả'}
          </button>
        )}
      </div>
      {error && <ErrorState compact error={error} title="Chưa tải được lộ trình đã lưu" onRetry={reload} />}
      {isLoading && itineraries.length === 0 && <div className="h-40 rounded-card bg-neutral-100 animate-pulse" />}
      {!isLoading && !error && itineraries.length === 0 && (
        <p className="py-6 text-center text-sm text-neutral-500">
          Chưa có lộ trình nào. Sang tab <b>Địa điểm</b>, chọn bộ lọc rồi bấm <b>Gợi ý lộ trình</b> nhé.
        </p>
      )}
      <ul className="space-y-2">
        {itineraries.map((itinerary) => (
          <ItineraryFolder
            key={itinerary.id}
            itinerary={itinerary}
            isOpen={openIds.has(itinerary.id)}
            onToggle={() => toggle(itinerary.id)}
            onRename={rename}
            actions={
              <>
                {onStart && (
                  <ItineraryActionButton icon={Navigation} tone="primary" onClick={() => onStart(itinerary)}>
                    Bắt đầu
                  </ItineraryActionButton>
                )}
                {onEdit && (
                  <ItineraryActionButton icon="edit" tone="neutral" onClick={() => onEdit(itinerary)}>
                    Sửa lộ trình
                  </ItineraryActionButton>
                )}
                <ItineraryActionButton icon="share" tone="neutral" onClick={() => onShare(itinerary)}>
                  Chia sẻ lên bảng tin
                </ItineraryActionButton>
                <ItineraryActionButton icon="close" tone="danger" onClick={() => remove(itinerary)}>
                  Xoá
                </ItineraryActionButton>
              </>
            }
          />
        ))}
      </ul>
    </section>
  );
};
