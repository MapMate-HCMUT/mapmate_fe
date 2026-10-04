import { LngLatBounds } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_FOCUS_ZOOM, MAP_PROVIDER } from '../../../config/map';
import { useToast } from '../../../hooks/useToast';
import { useSearchStore } from '../../../stores/searchStore';
import { useActiveRouteStore } from '../../itinerary';
import { fetchTripRoute, getStopCoordinates } from '../api/goongDirections';
import { useMapStore } from '../stores/mapStore';
import { enrichAndFilterPlaces } from '../utils/enrichPlaces';
import { pickMostSevere } from '../utils/floodSeverity';
import { getVehicle } from '../utils/quickFilters';
import { useMapData } from './useMapData';
import { useMapInstance } from './useMapInstance';
import { useFloodMarkers, useItineraryMarkers, useItineraryRoute, usePlaceMarkers, useUserMarker } from './useMapMarkers';
import { getStoredUserLocation, useUserLocation } from './useUserLocation';

// Hook điều phối toàn bộ trang chủ bản đồ: dữ liệu, bộ lọc, lựa chọn, marker, hành động & dẫn đường Goong.
export const useHomeMap = () => {
  const { containerRef, map, error: mapError } = useMapInstance();
  const { places, floodAlerts, isLoading } = useMapData();
  const query = useSearchStore((state) => state.query);
  const { category, budgetMax, radiusKm, vehicle, selectedPlaceId, activeFloodId } = useMapStore();
  const { setCategory, setSelectedPlaceId, setActiveFloodId } = useMapStore();
  const { showToast } = useToast();
  const [isFloodBannerVisible, setIsFloodBannerVisible] = useState(true);

  // Lộ trình đang được dẫn đường từ tab Khám phá / Của tôi
  const {
    activeItinerary,
    isNavigating,
    activeStopIndex,
    routeData,
    isLoadingRoute,
    stopTrip,
    setActiveStopIndex,
    setVehicle,
    setRouteData,
    setIsLoadingRoute,
    setRouteError,
  } = useActiveRouteStore();

  const flyTo = useCallback(
    (coordinates, zoom = MAP_FOCUS_ZOOM) => map?.flyTo({ center: coordinates, zoom, essential: true }),
    [map],
  );
  const { coordinates: userCoordinates, isLocating, locate } = useUserLocation(flyTo);

  const visiblePlaces = useMemo(
    () => enrichAndFilterPlaces(places, { origin: userCoordinates, vehicle, category, query, budgetMax, radiusKm }),
    [places, userCoordinates, vehicle, category, query, budgetMax, radiusKm],
  );
  const selectedPlace = visiblePlaces.find((place) => place.id === selectedPlaceId) ?? null;
  const floodAlert = floodAlerts.find((alert) => alert.id === activeFloodId) ?? pickMostSevere(floodAlerts);

  const selectPlace = useCallback(
    (placeId) => {
      setSelectedPlaceId(placeId);
      const place = places.find((item) => item.id === placeId);
      if (place) flyTo(place.location.coordinates);
    },
    [places, flyTo, setSelectedPlaceId],
  );

  const clearSelection = useCallback(() => setSelectedPlaceId(null), [setSelectedPlaceId]);

  const selectFloodAlert = useCallback(
    (alertId) => {
      setActiveFloodId(alertId);
      setIsFloodBannerVisible(true);
      const alert = floodAlerts.find((item) => item.id === alertId);
      if (alert) flyTo(alert.location.coordinates, MAP_DEFAULT_ZOOM);
    },
    [floodAlerts, flyTo, setActiveFloodId],
  );

  // Tự động tìm vị trí người dùng đúng 1 lần duy nhất khi bắt đầu một lộ trình mới
  const navigatedTripIdRef = useRef(null);
  useEffect(() => {
    if (isNavigating && activeItinerary) {
      const tripKey = activeItinerary.id || activeItinerary.name;
      if (navigatedTripIdRef.current !== tripKey) {
        navigatedTripIdRef.current = tripKey;
        locate({ silent: true, fly: false });
      }
    } else {
      navigatedTripIdRef.current = null;
    }
  }, [isNavigating, activeItinerary, locate]);

  const fetchRequestIdRef = useRef(0);

  // 1. Tính toán lộ trình từ Goong Directions API khi có lộ trình đang dẫn đường
  useEffect(() => {
    if (!isNavigating || !activeItinerary?.stops?.length) return undefined;

    const requestId = ++fetchRequestIdRef.current;

    // Điểm xuất phát ưu tiên: vị trí GPS đã lưu / hiện tại -> điểm xuất phát của lộ trình -> mặc định Q.1
    const effectiveOrigin =
      userCoordinates ||
      getStoredUserLocation() ||
      (activeItinerary.criteria?.origin
        ? [activeItinerary.criteria.origin.lng, activeItinerary.criteria.origin.lat]
        : null) ||
      MAP_DEFAULT_CENTER;

    const currentVehicle = activeItinerary.vehicle || vehicle;

    setIsLoadingRoute(true);
    fetchTripRoute(effectiveOrigin, activeItinerary.stops, currentVehicle, places)
      .then((data) => {
        // Chỉ cập nhật nếu đây vẫn là request mới nhất
        if (requestId !== fetchRequestIdRef.current) return;
        if (!data) {
          setIsLoadingRoute(false);
          setRouteError('Không xác định được toạ độ các điểm trong lộ trình');
          return;
        }
        setRouteData(data);
      })
      .catch((err) => {
        if (requestId === fetchRequestIdRef.current) {
          setIsLoadingRoute(false);
          setRouteError(err.message);
          showToast('Lỗi tải đường đi từ Goong: ' + err.message, 'warning');
        }
      });

    return undefined;
  }, [
    isNavigating,
    activeItinerary,
    userCoordinates,
    vehicle,
    places,
    setIsLoadingRoute,
    setRouteData,
    setRouteError,
    showToast,
  ]);

  // 2. Tự động căn góc nhìn bao quát toàn bộ lộ trình khi có routeData và map đã sẵn sàng
  useEffect(() => {
    if (!map || !routeData?.coordinates?.length || routeData.coordinates.length < 2) return;
    const bounds = routeData.coordinates.reduce(
      (b, coord) => b.extend(coord),
      new LngLatBounds(routeData.coordinates[0], routeData.coordinates[0]),
    );
    map.fitBounds(bounds, {
      padding: { top: 90, bottom: 90, left: 400, right: 60 },
      maxZoom: 16,
      duration: 800,
    });
  }, [map, routeData]);

  const selectStop = useCallback(
    (index, stop) => {
      setActiveStopIndex(index);
      const coords = getStopCoordinates(stop, places);
      if (coords) flyTo(coords, MAP_FOCUS_ZOOM);
    },
    [setActiveStopIndex, flyTo, places],
  );

  // Hiển thị marker: Nếu đang đi theo lộ trình thì ưu tiên hiện POI của lộ trình
  usePlaceMarkers(map, isNavigating ? [] : visiblePlaces, selectedPlaceId, selectPlace);
  useItineraryMarkers(
    map,
    isNavigating ? activeItinerary?.stops : [],
    activeStopIndex,
    selectStop,
    isNavigating ? userCoordinates : null,
    isNavigating ? routeData : null,
    places,
  );
  useItineraryRoute(map, isNavigating ? routeData?.coordinates : null);
  useFloodMarkers(map, isNavigating ? [] : floodAlerts, selectFloodAlert);
  useUserMarker(map, isNavigating ? null : userCoordinates);

  // Bấm vào vùng trống trên bản đồ => đóng thẻ chi tiết.
  useEffect(() => {
    if (!map) return undefined;
    map.on('click', clearSelection);
    return () => map.off('click', clearSelection);
  }, [map, clearSelection]);

  const addToItinerary = useCallback(
    (place) => showToast(`Đã thêm "${place.name}" vào hành trình`),
    [showToast],
  );

  // Chỉ đường nhanh tới 1 điểm cụ thể bằng Goong Directions API
  const showDirections = useCallback(
    (place) => {
      const singleTrip = {
        name: `Đến ${place.name}`,
        vehicle,
        stops: [
          {
            place_id: place.id,
            place_name: place.name,
            category: place.category,
            address: place.address,
            coordinates: place.location.coordinates,
          },
        ],
      };
      useActiveRouteStore.getState().startTrip(singleTrip);
      showToast(`Đang tìm đường đến ${place.name} qua Goong Maps`);
    },
    [vehicle, showToast],
  );

  return {
    mapContainerRef: containerRef,
    isMapReady: Boolean(map),
    mapError,
    mapProvider: MAP_PROVIDER,
    isLoading,
    places: visiblePlaces,
    selectedPlace,
    selectPlace,
    clearSelection,
    category,
    setCategory,
    vehicleInfo: getVehicle(vehicle),
    floodAlert: isFloodBannerVisible ? floodAlert : null,
    floodAlertCount: floodAlerts.length,
    focusFloodAlert: () => floodAlert && selectFloodAlert(floodAlert.id),
    dismissFloodBanner: () => setIsFloodBannerVisible(false),
    isLocating,
    locate,
    addToItinerary,
    showDirections,
    // Trạng thái dẫn đường lộ trình từ Khám phá / Của tôi
    activeItinerary,
    isNavigating,
    activeStopIndex,
    routeData,
    isLoadingRoute,
    stopTrip,
    selectStop,
    setVehicle,
  };
};

