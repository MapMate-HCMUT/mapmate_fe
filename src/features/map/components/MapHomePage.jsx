import { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, X } from 'lucide-react';
import { SearchBar } from '../../../components/SearchBar';
import { useToast } from '../../../hooks/useToast';
import { useSearchStore } from '../../../stores/searchStore';
import { RouteSuggestionsModal, useActiveRouteStore } from '../../itinerary';
import { TRIP_DRAFT_MAX_PLACES } from '../../explore';
import { usePlaceReviewActions } from '../../social';
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
import { useSavedItineraries } from '../hooks/useSavedItineraries';
import { useSavedRouteLayers } from '../hooks/useSavedRouteLayers';
import { useMapStore } from '../stores/mapStore';
import { useSavedRoutesStore } from '../stores/savedRoutesStore';
import { ActiveRouteBanner } from './ActiveRouteBanner';
import { ActiveRouteSidebar } from './ActiveRouteSidebar';
import { CategoryChips } from './CategoryChips';
import { MapPointCard } from './MapPointCard';
import { MapTripPanel } from './MapTripPanel';
import { MapProviderBadge, MapStatusOverlay } from './MapStatusOverlay';
import { PlaceDetailCard } from './PlaceDetailCard';
import { SavedRoutesPanel } from './SavedRoutesPanel';
import { StartPointPicker } from './StartPointPicker';
import { TrendingCarousel } from './TrendingCarousel';
import { TrendingSidebar } from './TrendingSidebar';

// Trang chủ: Sidebar (desktop) + Bản đồ toàn màn hình + các lớp nổi (FABs, thẻ chi tiết, dẫn đường Goong).
export const MapHomePage = () => {
  const { mapContainerRef, ...home } = useHomeMap();
  const isNavigating = home.isNavigating && Boolean(home.activeItinerary);
  const reviewActions = usePlaceReviewActions();
  const tripPanel = useMapTripPanel(home.userCoordinates);
  // Khung nổi bên trái bản đồ (1 khung 1 lúc): trạm xe buýt | tuyến xe buýt
  const [overlay, setOverlay] = useState(null);
  // Phương tiện "Buýt & Metro" (nút lọc phương tiện / cột chỉ đường): bản đồ hiện metro, trạm buýt (bấm xem xe sắp tới);
  // chỉ đường tìm tuyến xe buýt / metro và vẽ từng chặng theo màu tuyến
  const isTransitMode = home.vehicleInfo.value === 'bus';

  // Lộ trình đã lưu hiện trên bản đồ (tối đa 5, mỗi lộ trình 1 màu); đang dẫn đường thì tạm ẩn cho đỡ rối
  const { showToast } = useToast();
  const saved = useSavedItineraries();
  const { visible: visibleSaved, focusedId, lastShownId, setFocused, prune } = useSavedRoutesStore();
  const setSidebarTab = useMapStore((state) => state.setSidebarTab);
  const [isRoutesSheetOpen, setIsRoutesSheetOpen] = useState(false); // điện thoại: bảng trượt "Lộ trình đã lưu"
  const savedById = useMemo(() => new Map(saved.itineraries.map((itinerary) => [itinerary.id, itinerary])), [saved.itineraries]);
  const savedRoutes = useMemo(
    () => visibleSaved.filter((item) => savedById.has(item.id)).map((item) => ({ itinerary: savedById.get(item.id), color: item.color })),
    [visibleSaved, savedById],
  );
  // Lộ trình đã bị xoá ở nơi khác => bỏ khỏi danh sách đang hiện
  useEffect(() => {
    if (saved.isAuthenticated && !saved.isLoading && !saved.error) prune(new Set(saved.itineraries.map((itinerary) => itinerary.id)));
  }, [saved.isAuthenticated, saved.isLoading, saved.error, saved.itineraries, prune]);
  const savedLayers = useSavedRouteLayers(home.map, savedRoutes, {
    enabled: !isNavigating,
    focusedId,
    autoFitId: lastShownId,
    coverBottom: isRoutesSheetOpen ? 0.5 : 0, // điện thoại: bảng trượt che nửa dưới bản đồ
    // Bấm 1 lộ trình trên bản đồ => chọn lộ trình đó và mở danh sách tới đúng chỗ
    onSelectRoute: (id) => {
      setFocused(id);
      setSidebarTab('routes');
      if (!window.matchMedia('(min-width: 1024px)').matches) setIsRoutesSheetOpen(true);
    },
  });
  const startSavedTrip = (itinerary) => {
    useActiveRouteStore.getState().startTrip(itinerary);
    setIsRoutesSheetOpen(false);
    showToast(`Bắt đầu chuyến đi “${itinerary.name}”`);
  };
  const savedRoutesPanel = <SavedRoutesPanel saved={saved} layers={savedLayers} onStartTrip={startSavedTrip} />;
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
  const { query, setQuery, clearQuery } = useSearchStore();
  // "Xuất phát từ ..." dùng chung cho thẻ địa điểm, thẻ điểm ghim và cột dẫn đường
  const startPicker = <StartPointPicker hasCurrentLocation={Boolean(home.userCoordinates)} onUseCurrentLocation={home.locate} />;

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
          startPicker={startPicker}
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
          featured={home.featuredPlaces}
          onSelectFeatured={home.openFeatured}
          places={home.places}
          isLoading={home.isLoading}
          selectedPlaceId={home.selectedPlace?.id}
          category={home.category}
          onCategoryChange={home.setCategory}
          onSelect={home.selectPlace}
          vehicleEmoji={vehicleEmoji}
          savedRoutes={savedRoutesPanel}
          savedRouteCount={saved.itineraries.length}
        />
      )}

      <section className="flex-1 min-w-0 flex flex-col">
        {/* Điện thoại: ô tìm kiếm + danh mục nằm trên bản đồ (desktop nằm trong cột danh sách bên trái) */}
        {!isNavigating && (
          <div className="lg:hidden px-4 pt-2.5 pb-2 space-y-2 bg-surface border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <SearchBar value={query} onChange={setQuery} onClear={clearQuery} />
              </div>
              <button
                type="button"
                onClick={() => setIsRoutesSheetOpen((open) => !open)}
                aria-expanded={isRoutesSheetOpen}
                aria-label="Lộ trình đã lưu"
                title="Lộ trình đã lưu"
                className={`relative shrink-0 w-11 h-11 rounded-pill flex items-center justify-center transition ${isRoutesSheetOpen ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700'}`}
              >
                <Route className="w-5 h-5" />
                {savedRoutes.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-pill bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface">
                    {savedRoutes.length}
                  </span>
                )}
              </button>
            </div>
            <CategoryChips value={home.category} onChange={home.setCategory} />
          </div>
        )}

        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* MapLibre ép .maplibregl-map thành position: relative => cần lớp bọc absolute bên ngoài */}
          <div className="absolute inset-0">
            <div ref={mapContainerRef} className="w-full h-full" aria-label="Bản đồ TP.HCM" />
          </div>
          <MapStatusOverlay isReady={home.isMapReady} error={home.mapError} />

          {/* Đang chọn điểm xuất phát: nhắc chạm bản đồ (Esc / Huỷ để thôi) */}
          {home.isPickingStart && (
            <div role="status" className="absolute z-30 top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-auto flex items-center gap-3 pl-4 pr-2 py-2 rounded-pill bg-ink text-white text-sm font-semibold shadow-modal">
              <span className="flex-1">📍 Chạm vào bản đồ để chọn điểm xuất phát</span>
              <button type="button" onClick={home.cancelPickingStart} className="px-3 py-1 rounded-pill bg-white/15 hover:bg-white/25 text-xs">Huỷ</button>
            </div>
          )}
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
            <div className="absolute z-20 top-3 left-3 w-64 lg:top-auto lg:bottom-4 lg:left-4 lg:w-72">
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

          {home.selectedPlace && !isNavigating ? (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96">
              <PlaceDetailCard
                place={home.selectedPlace}
                vehicleEmoji={vehicleEmoji}
                onClose={home.clearSelection}
                onDirections={home.showDirections}
                onAddToItinerary={home.addToItinerary}
                onWriteReview={reviewActions.writeReview}
                onOpenReviews={reviewActions.openReviews}
                startPicker={startPicker}
              />
            </div>
          ) : home.mapPoint && !isNavigating ? (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96">
              <MapPointCard point={home.mapPoint} vehicleEmoji={vehicleEmoji} onClose={home.closeMapPoint} onDirections={home.showPointDirections} onZoomIn={home.zoomToPoint} startPicker={startPicker} />
            </div>
          ) : !isNavigating && isRoutesSheetOpen ? (
            <div className="absolute z-30 inset-x-0 bottom-0 lg:hidden max-h-[50%] flex flex-col bg-surface rounded-t-card shadow-modal animate-[sheet-up_200ms_ease-out]">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <h2 className="text-sm font-bold text-neutral-900 inline-flex items-center gap-1.5"><Route className="w-4 h-4 text-primary-600" /> Lộ trình đã lưu</h2>
                <button type="button" onClick={() => setIsRoutesSheetOpen(false)} aria-label="Đóng" className="p-1.5 rounded-pill text-neutral-500 hover:bg-neutral-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3">{savedRoutesPanel}</div>
            </div>
          ) : !isNavigating ? (
            <div className="absolute z-20 inset-x-0 bottom-0 lg:hidden">
              <TrendingCarousel places={home.places} featured={home.featuredPlaces} onSelectFeatured={home.openFeatured} vehicleEmoji={vehicleEmoji} onSelect={home.selectPlace} />
            </div>
          ) : null}
        </div>
      </section>
      <RouteSuggestionsModal routes={tripPanel.routes} onSelect={tripPanel.selectSuggestion} onShowOnMap={tripPanel.showOnMap} />
    </div>
  );
};
