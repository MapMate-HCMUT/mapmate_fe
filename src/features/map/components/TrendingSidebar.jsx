import { CategoryChips } from './CategoryChips';
import { PlaceListItem } from './PlaceListItem';
import { PlaceListSkeleton } from './PlaceListSkeleton';

// Cột trái trên desktop: lọc danh mục + danh sách địa điểm đang hot.
export const TrendingSidebar = ({
  places,
  isLoading,
  selectedPlaceId,
  category,
  onCategoryChange,
  onSelect,
  vehicleEmoji,
  floodAlertCount,
  onFloodClick,
}) => (
  <aside className="hidden lg:flex w-[360px] shrink-0 flex-col bg-surface border-r border-neutral-200">
    <div className="p-4 space-y-4 border-b border-neutral-100">
      {floodAlertCount > 0 && (
        <button
          type="button"
          onClick={onFloodClick}
          className="w-full flex items-center gap-3 p-3 rounded-card bg-danger-50 border border-danger-100 text-left hover:bg-danger-100 transition"
        >
          <span className="text-xl" aria-hidden="true">🌊</span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-danger-700">{floodAlertCount} điểm ngập đang hoạt động</span>
            <span className="block text-xs text-danger-600">Bấm để xem trên bản đồ</span>
          </span>
          <span className="text-danger-500" aria-hidden="true">›</span>
        </button>
      )}
      <div>
        <h2 className="text-base font-bold tracking-tight text-neutral-900">🔥 Đang hot tại TP.HCM</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Gợi ý quanh vị trí của bạn</p>
      </div>
      <CategoryChips value={category} onChange={onCategoryChange} className="flex-wrap" />
    </div>

    <div className="flex-1 overflow-y-auto scrollbar-none p-2">
      {isLoading && <PlaceListSkeleton />}
      {!isLoading && places.length === 0 && (
        <div className="text-center py-12 px-6">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-semibold text-neutral-700">Không tìm thấy địa điểm phù hợp</p>
          <p className="text-xs text-neutral-500 mt-1">Thử đổi từ khóa, danh mục hoặc nới bộ lọc ngân sách / bán kính.</p>
        </div>
      )}
      {!isLoading && places.length > 0 && (
        <>
          <p className="px-2.5 pt-1 pb-2 text-xs text-neutral-500">{places.length} địa điểm</p>
          <ul className="space-y-1">
            {places.map((place) => (
              <PlaceListItem
                key={place.id}
                place={place}
                isSelected={place.id === selectedPlaceId}
                vehicleEmoji={vehicleEmoji}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  </aside>
);
