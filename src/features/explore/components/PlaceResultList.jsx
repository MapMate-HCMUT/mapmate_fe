import { PlaceResultCard } from './PlaceResultCard';

const SKELETON_ROWS = 4;

export const PlaceResultList = ({ places, isLoading, error, hasMore, onLoadMore, onReset, draftIds, tagLabels, vehicleEmoji, onToggleDraft, onShare }) => {
  if (error) {
    return <p className="bg-surface rounded-card shadow-card p-8 text-center text-sm text-danger-600">{error.message}</p>;
  }
  if (isLoading && places.length === 0) {
    return (
      <ul className="space-y-3 animate-pulse" aria-label="Đang tải địa điểm">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="h-32 bg-surface rounded-card shadow-card" />
        ))}
      </ul>
    );
  }
  if (places.length === 0) {
    return (
      <div className="bg-surface rounded-card shadow-card p-10 text-center">
        <p className="text-4xl mb-2" aria-hidden="true">🔍</p>
        <p className="font-semibold text-neutral-800">Không có địa điểm nào khớp bộ lọc</p>
        <p className="mt-1 text-sm text-neutral-500">Thử nới bán kính, tăng mức giá hoặc bỏ bớt phong cách.</p>
        <button type="button" onClick={onReset} className="mt-4 px-4 py-2 rounded-button bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm font-semibold">
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }
  return (
    <>
      <ul className={`space-y-3 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
        {places.map((place) => (
          <PlaceResultCard
            key={place.id}
            place={place}
            tagLabels={tagLabels}
            vehicleEmoji={vehicleEmoji}
            inDraft={draftIds.has(place.id)}
            onToggleDraft={onToggleDraft}
            onShare={onShare}
          />
        ))}
      </ul>
      {hasMore && (
        <button type="button" onClick={onLoadMore} disabled={isLoading} className="mt-3 w-full py-2.5 rounded-button bg-surface shadow-card text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-60">
          {isLoading ? 'Đang tải…' : 'Xem thêm địa điểm'}
        </button>
      )}
    </>
  );
};
