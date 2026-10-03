import { useMyItineraries } from '../hooks/useMyItineraries';
import { ItineraryActionButton, ItineraryCard } from './ItineraryCard';

// Danh sách lộ trình đã lưu của tôi. `onShare(itinerary)` mở khung đăng bài chia sẻ.
export const MyItinerariesPanel = ({ onShare }) => {
  const { itineraries, isLoading, error, remove } = useMyItineraries();

  return (
    <section className="bg-surface rounded-card shadow-card p-5">
      <h2 className="text-base font-bold text-neutral-900 mb-3">🧭 Lộ trình đã lưu <span className="text-sm font-semibold text-neutral-400">{itineraries.length}</span></h2>
      {error && <p className="text-sm text-danger-600">{error.message}</p>}
      {isLoading && itineraries.length === 0 && <div className="h-40 rounded-card bg-neutral-100 animate-pulse" />}
      {!isLoading && !error && itineraries.length === 0 && (
        <p className="py-6 text-center text-sm text-neutral-500">
          Chưa có lộ trình nào. Sang tab <b>Địa điểm</b>, chọn bộ lọc rồi bấm <b>Gợi ý lộ trình</b> nhé.
        </p>
      )}
      <div className="space-y-3">
        {itineraries.map((itinerary) => (
          <ItineraryCard
            key={itinerary.id}
            itinerary={itinerary}
            actions={
              <>
                <ItineraryActionButton icon="share" tone="primary" onClick={() => onShare(itinerary)}>Chia sẻ lên bảng tin</ItineraryActionButton>
                <ItineraryActionButton icon="close" tone="danger" onClick={() => remove(itinerary)}>Xoá</ItineraryActionButton>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
};
