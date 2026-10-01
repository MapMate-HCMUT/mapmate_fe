import { useCallback, useEffect, useMemo, useState } from 'react';
import { MAP_DEFAULT_ZOOM, MAP_FOCUS_ZOOM, MAP_PROVIDER } from '../../../config/map';
import { useToast } from '../../../hooks/useToast';
import { useSearchStore } from '../../../stores/searchStore';
import { useMapStore } from '../stores/mapStore';
import { enrichAndFilterPlaces } from '../utils/enrichPlaces';
import { pickMostSevere } from '../utils/floodSeverity';
import { getVehicle } from '../utils/quickFilters';
import { useMapData } from './useMapData';
import { useMapInstance } from './useMapInstance';
import { useFloodMarkers, usePlaceMarkers, useUserMarker } from './useMapMarkers';
import { useUserLocation } from './useUserLocation';

// Hook điều phối toàn bộ trang chủ bản đồ: dữ liệu, bộ lọc, lựa chọn, marker, hành động.
export const useHomeMap = () => {
  const { containerRef, map, error: mapError } = useMapInstance();
  const { places, floodAlerts, isLoading } = useMapData();
  const query = useSearchStore((state) => state.query);
  const { category, budgetMax, radiusKm, vehicle, selectedPlaceId, activeFloodId } = useMapStore();
  const { setCategory, setSelectedPlaceId, setActiveFloodId } = useMapStore();
  const { showToast } = useToast();
  const [isFloodBannerVisible, setIsFloodBannerVisible] = useState(true);

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

  usePlaceMarkers(map, visiblePlaces, selectedPlaceId, selectPlace);
  useFloodMarkers(map, floodAlerts, selectFloodAlert);
  useUserMarker(map, userCoordinates);

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
  const showDirections = useCallback(
    (place) => showToast(`Chỉ đường tới ${place.name} sẽ dùng Goong Directions API khi có key`, 'info'),
    [showToast],
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
  };
};
