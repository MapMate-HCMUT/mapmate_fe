import { useCallback, useMemo, useState } from 'react';
import { RouteSuggestionsModal, useActiveRouteStore } from '../../itinerary';
import { TRIP_DRAFT_MAX_PLACES } from '../../explore';
import {
  buildTransitRouteData,
  RoutePanel,
  StopPanel,
  TransitLegend,
  TransitTripPanel,
  useRouteDetail,
  useTransitJourneyLayer,
  useTransitLayer,
  useTransitPrefsStore,
} from '../../transit';
import { fetchLegDirections } from '../api/goongDirections';
import { useHomeMap } from '../hooks/useHomeMap';
import { useMapTripPanel } from '../hooks/useMapTripPanel';
import { useQuickFilters } from '../hooks/useQuickFilters';
import { ActiveRouteBanner } from './ActiveRouteBanner';
import { ActiveRouteSidebar } from './ActiveRouteSidebar';
import { CategoryChips } from './CategoryChips';
import { MapPointCard } from './MapPointCard';
import { MapQuickActions } from './MapQuickActions';
import { MapTripPanel } from './MapTripPanel';
import { MapProviderBadge, MapStatusOverlay } from './MapStatusOverlay';
import { PlaceDetailCard } from './PlaceDetailCard';
import { TrendingCarousel } from './TrendingCarousel';
import { TrendingSidebar } from './TrendingSidebar';

// Trang chủ: Sidebar (desktop) + Bản đồ toàn màn hình + các lớp nổi (FABs, thẻ chi tiết, dẫn đường Goong).
export const MapHomePage = () => {
  const { mapContainerRef, ...home } = useHomeMap();
  const isNavigating = home.isNavigating && Boolean(home.activeItinerary);
  const quickFilters = useQuickFilters();
  const tripPanel = useMapTripPanel(home.userCoordinates);
  // Khung nổi bên trái bản đồ (1 khung 1 lúc): trạm xe buýt | tuyến xe buýt
  const [overlay, setOverlay] = useState(null);
  // Phương tiện "Buýt & Metro" (nút lọc phương tiện / cột chỉ đường): bản đồ hiện metro, trạm buýt (bấm xem xe sắp tới);
  // chỉ đường tìm tuyến xe buýt / metro và vẽ từng chặng theo màu tuyến
  const isTransitMode = home.vehicleInfo.value === 'bus';
  const openStop = useCallback((id) => setOverlay({ type: 'stop', id }), []);
  const openRoute = useCallback((routeId, varId) => setOverlay({ type: 'route', routeId, varId }), []);
  const routeDetail = useRouteDetail(overlay?.type === 'route' ? overlay.routeId : null, overlay?.varId ?? null);
  const selectedRoute = useMemo(
    () => (routeDetail.variant ? { path: routeDetail.variant.path, stops: routeDetail.variant.stops, color: routeDetail.route?.color } : null),
    [routeDetail.variant, routeDetail.route],
  );
  // Đang dẫn đường: chỉ vẽ cách đi đã chọn (ẩn trạm / tuyến chung cho đỡ rối)
  const transitLayer = useTransitLayer(home.map, isTransitMode && !isNavigating, openStop, selectedRoute);
  useTransitJourneyLayer(home.map, isNavigating ? home.routeData?.transit : null, {
    fetchRoadGeometry: fetchLegDirections,
    activeLeg: home.activeStopIndex,
    waypoints: home.routeData?.waypoints,
  });
  const transitPrefs = useTransitPrefsStore((state) => state.prefs);
  const setTransitPref = useTransitPrefsStore((state) => state.setPref);
  const routeError = useActiveRouteStore((state) => state.routeError);
  const retryRoute = useActiveRouteStore((state) => state.retryRoute);
  // Chọn phương án khác cho 1 chặng => dựng lại lộ trình (không tìm lại)
  const selectTransitOption = useCallback((legIndex, optionIndex) => {
    const { routeData, setRouteData } = useActiveRouteStore.getState();
    if (!routeData?.transit) return;
    const selected = [...routeData.transit.selected];
    selected[legIndex] = optionIndex;
    setRouteData(buildTransitRouteData(routeData.transit.plans, selected, routeData.waypoints));
  }, []);
  const vehicleEmoji = home.vehicleInfo.emoji;

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
          routeError={home.routeData?.transit ? null : routeError}
          onRetryRoute={retryRoute}
          onSetVehicle={home.setVehicle}
          transitPanel={
            <TransitTripPanel
              routeData={home.routeData}
              isLoading={home.isLoadingRoute}
              error={routeError}
              prefs={transitPrefs}
              onChangePref={setTransitPref}
              onSelectOption={selectTransitOption}
              activeStopIndex={home.activeStopIndex}
              onSelectLeg={(index) => home.selectStop(index, home.activeItinerary.stops[index])}
              onOpenStop={openStop}
            />
          }
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
                routeError={isTransitMode ? null : routeError}
                onRetryRoute={retryRoute}
              />
            </div>
          )}

          {/* Giỏ chuyến đi (chung với Khám phá): gợi ý lộ trình rồi hiện thẳng lên bản đồ */}
          {!isNavigating && (
            <div className="absolute z-20 top-20 left-3 w-64 lg:top-auto lg:bottom-4 lg:left-4 lg:w-72">
              <MapTripPanel panel={tripPanel} maxPlaces={TRIP_DRAFT_MAX_PLACES} />
            </div>
          )}

          {isTransitMode && !isNavigating && (
            <div className="absolute z-20 top-3 right-14">
              <TransitLegend stopCount={transitLayer.stopCount} tooFar={transitLayer.tooFar} />
            </div>
          )}
          {/* Khung trạm / tuyến chỉ có ý nghĩa khi đang chọn Buýt & Metro */}
          {overlay && isTransitMode && (
            <div className="absolute z-30 inset-x-0 bottom-0 lg:inset-x-auto lg:left-4 lg:top-4 lg:bottom-auto lg:w-80">
              {overlay.type === 'stop' && <StopPanel key={overlay.id} stopId={overlay.id} onClose={() => setOverlay(null)} onOpenRoute={openRoute} />}
              {overlay.type === 'route' && <RoutePanel detail={routeDetail} onClose={() => setOverlay(null)} onSelectStop={openStop} />}
            </div>
          )}

          <MapQuickActions
            filters={quickFilters.filters}
            openKey={quickFilters.openKey}
            onToggle={quickFilters.toggleMenu}
            onSelectOption={quickFilters.selectOption}
            onLocate={home.locate}
            isLocating={home.isLocating}
            showLocateHint={home.showLocateHint && !isNavigating}
            onDismissLocateHint={home.dismissLocateHint}
          />

          {home.selectedPlace && !isNavigating ? (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96">
              <PlaceDetailCard
                place={home.selectedPlace}
                vehicleEmoji={vehicleEmoji}
                onClose={home.clearSelection}
                onDirections={home.showDirections}
                onAddToItinerary={home.addToItinerary}
              />
            </div>
          ) : home.mapPoint && !isNavigating ? (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96">
              <MapPointCard point={home.mapPoint} vehicleEmoji={vehicleEmoji} onClose={home.closeMapPoint} onDirections={home.showPointDirections} onZoomIn={home.zoomToPoint} />
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
