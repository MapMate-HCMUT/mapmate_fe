import { SearchBar } from '../../../components/SearchBar';
import { useSearchStore } from '../../../stores/searchStore';
import { CategoryChips } from './CategoryChips';
import { PlaceListItem } from './PlaceListItem';
import { PlaceListSkeleton } from './PlaceListSkeleton';

// Cột trái trên desktop: ô tìm kiếm + lọc danh mục + danh sách địa điểm đang hot.
export const TrendingSidebar = ({
  featured = [],
  onSelectFeatured,
  places,
  isLoading,
  selectedPlaceId,
  category,
  onCategoryChange,
  onSelect,
  vehicleEmoji,
}) => {
  const { query, setQuery, clearQuery } = useSearchStore();
  return (
    <aside className="hidden lg:flex w-[360px] shrink-0 flex-col bg-surface border-r border-neutral-200">
      <div className="p-4 space-y-4 border-b border-neutral-100">
        <SearchBar value={query} onChange={setQuery} onClear={clearQuery} />
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
        {featured.length > 0 && (
          <section className="mb-2 pb-2 border-b border-neutral-100" aria-label="Nổi bật gần bạn">
            <p className="px-2.5 pt-1 pb-1.5 text-xs font-semibold text-accent-800">✨ Nổi bật gần bạn</p>
            <ul className="space-y-1">
              {featured.map((place) => (
                <PlaceListItem key={place.id} place={place} isSelected={place.id === selectedPlaceId} vehicleEmoji={vehicleEmoji} onSelect={onSelectFeatured} />
              ))}
            </ul>
          </section>
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
};
