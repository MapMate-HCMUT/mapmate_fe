import { useHomeMap } from '../hooks/useHomeMap';
import { useQuickFilters } from '../hooks/useQuickFilters';
import { CategoryChips } from './CategoryChips';
import { FloodAlertBanner } from './FloodAlertBanner';
import { MapQuickActions } from './MapQuickActions';
import { MapProviderBadge, MapStatusOverlay } from './MapStatusOverlay';
import { PlaceDetailCard } from './PlaceDetailCard';
import { TrendingCarousel } from './TrendingCarousel';
import { TrendingSidebar } from './TrendingSidebar';

// Trang chủ: Sidebar (desktop) + Bản đồ toàn màn hình + các lớp nổi (banner ngập, FABs, thẻ chi tiết).
export const MapHomePage = () => {
  const { mapContainerRef, ...home } = useHomeMap();
  const quickFilters = useQuickFilters();
  const vehicleEmoji = home.vehicleInfo.emoji;

  return (
    <div className="flex-1 min-h-0 flex">
      <TrendingSidebar
        places={home.places}
        isLoading={home.isLoading}
        selectedPlaceId={home.selectedPlace?.id}
        category={home.category}
        onCategoryChange={home.setCategory}
        onSelect={home.selectPlace}
        vehicleEmoji={vehicleEmoji}
        floodAlertCount={home.floodAlertCount}
        onFloodClick={home.focusFloodAlert}
      />

      <section className="flex-1 min-w-0 flex flex-col">
        <CategoryChips
          value={home.category}
          onChange={home.setCategory}
          className="lg:hidden px-4 py-2 bg-surface border-b border-neutral-100"
        />

        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* MapLibre ép .maplibregl-map thành position: relative => cần lớp bọc absolute bên ngoài */}
          <div className="absolute inset-0">
            <div ref={mapContainerRef} className="w-full h-full" aria-label="Bản đồ TP.HCM" />
          </div>
          <MapStatusOverlay isReady={home.isMapReady} error={home.mapError} />
          <MapProviderBadge provider={home.mapProvider} />

          {home.floodAlert && (
            <div className="absolute z-20 top-3 left-12 right-14 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-[440px]">
              <FloodAlertBanner
                alert={home.floodAlert}
                onFocus={home.focusFloodAlert}
                onClose={home.dismissFloodBanner}
              />
            </div>
          )}

          <MapQuickActions
            filters={quickFilters.filters}
            openKey={quickFilters.openKey}
            onToggle={quickFilters.toggleMenu}
            onSelectOption={quickFilters.selectOption}
            onLocate={home.locate}
            isLocating={home.isLocating}
          />

          {home.selectedPlace ? (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96">
              <PlaceDetailCard
                place={home.selectedPlace}
                vehicleEmoji={vehicleEmoji}
                onClose={home.clearSelection}
                onDirections={home.showDirections}
                onAddToItinerary={home.addToItinerary}
              />
            </div>
          ) : (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:hidden">
              <TrendingCarousel places={home.places} vehicleEmoji={vehicleEmoji} onSelect={home.selectPlace} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
