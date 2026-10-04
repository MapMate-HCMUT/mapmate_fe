import { RouteSuggestionsModal } from '../../itinerary';
import { TRIP_DRAFT_MAX_PLACES } from '../../explore';
import { useHomeMap } from '../hooks/useHomeMap';
import { useMapTripPanel } from '../hooks/useMapTripPanel';
import { useQuickFilters } from '../hooks/useQuickFilters';
import { ActiveRouteBanner } from './ActiveRouteBanner';
import { ActiveRouteSidebar } from './ActiveRouteSidebar';
import { CategoryChips } from './CategoryChips';
import { FloodAlertBanner } from './FloodAlertBanner';
import { MapQuickActions } from './MapQuickActions';
import { MapTripPanel } from './MapTripPanel';
import { MapProviderBadge, MapStatusOverlay } from './MapStatusOverlay';
import { PlaceDetailCard } from './PlaceDetailCard';
import { TrendingCarousel } from './TrendingCarousel';
import { TrendingSidebar } from './TrendingSidebar';

// Trang chủ: Sidebar (desktop) + Bản đồ toàn màn hình + các lớp nổi (banner ngập, FABs, thẻ chi tiết, dẫn đường Goong).
export const MapHomePage = () => {
  const { mapContainerRef, ...home } = useHomeMap();
  const quickFilters = useQuickFilters();
  const tripPanel = useMapTripPanel(home.userCoordinates);
  const vehicleEmoji = home.vehicleInfo.emoji;
  const isNavigating = home.isNavigating && Boolean(home.activeItinerary);

  return (
    <div className="flex-1 min-h-0 flex">
      {isNavigating ? (
        <ActiveRouteSidebar
          itinerary={home.activeItinerary}
          routeData={home.routeData}
          activeStopIndex={home.activeStopIndex}
          onSelectStop={home.selectStop}
          onStopTrip={home.stopTrip}
          isLoadingRoute={home.isLoadingRoute}
          onSetVehicle={home.setVehicle}
        />
      ) : (
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
      )}

      <section className="flex-1 min-w-0 flex flex-col">
        {!isNavigating && (
          <CategoryChips
            value={home.category}
            onChange={home.setCategory}
            className="lg:hidden px-4 py-2 bg-surface border-b border-neutral-100"
          />
        )}

        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* MapLibre ép .maplibregl-map thành position: relative => cần lớp bọc absolute bên ngoài */}
          <div className="absolute inset-0">
            <div ref={mapContainerRef} className="w-full h-full" aria-label="Bản đồ TP.HCM" />
          </div>
          <MapStatusOverlay isReady={home.isMapReady} error={home.mapError} />
          <MapProviderBadge provider={home.mapProvider} />

          {/* Banner cảnh báo điểm ngập nổi trên đầu bản đồ */}
          {!isNavigating && home.floodAlert && (
            <div className="absolute z-20 top-3 left-12 right-14 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-[440px]">
              <FloodAlertBanner
                alert={home.floodAlert}
                onFocus={home.focusFloodAlert}
                onClose={home.dismissFloodBanner}
              />
            </div>
          )}

          {/* Banner dẫn đường lộ trình Goong nổi trên mobile (desktop đã có sidebar) */}
          {isNavigating && (
            <div className="lg:hidden absolute z-20 top-3 inset-x-3 sm:inset-x-auto sm:left-4 sm:right-auto sm:w-[460px]">
              <ActiveRouteBanner
                itinerary={home.activeItinerary}
                routeData={home.routeData}
                activeStopIndex={home.activeStopIndex}
                onSelectStop={home.selectStop}
                onStopTrip={home.stopTrip}
                isLoadingRoute={home.isLoadingRoute}
              />
            </div>
          )}

          {/* Giỏ chuyến đi (chung với Khám phá): gợi ý lộ trình rồi hiện thẳng lên bản đồ */}
          {!isNavigating && (
            <div className="absolute z-20 top-20 left-3 w-64 lg:top-auto lg:bottom-4 lg:left-4 lg:w-72">
              <MapTripPanel panel={tripPanel} maxPlaces={TRIP_DRAFT_MAX_PLACES} />
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
          ) : !isNavigating ? (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:hidden">
              <TrendingCarousel places={home.places} vehicleEmoji={vehicleEmoji} onSelect={home.selectPlace} />
            </div>
          ) : null}
        </div>
      </section>
      <RouteSuggestionsModal routes={tripPanel.routes} onSelect={tripPanel.selectSuggestion} onShowOnMap={tripPanel.showOnMap} />
    </div>
  );
};
