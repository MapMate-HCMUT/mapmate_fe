import { LngLatBounds } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_FOCUS_ZOOM, MAP_PROVIDER } from '../../../config/map';
import { useErrorRedirect } from '../../../hooks/useErrorRedirect';
import { useFeatureHint } from '../../../hooks/useFeatureHint';
import { useToast } from '../../../hooks/useToast';
import { useSearchStore } from '../../../stores/searchStore';
import { TRIP_DRAFT_MAX_PLACES, useTripDraftStore } from '../../explore';
import { useActiveRouteStore } from '../../itinerary';
import { useTransitPrefsStore } from '../../transit';
import { fetchTripRoute, getStopCoordinates, normalizeTripVehicle } from '../api/goongDirections';
import { findPlaceAt } from '../api/getMapPlaces';
import { fetchTransitTripRoute } from '../api/transitTrip';
import { useMapStore } from '../stores/mapStore';
import { enrichAndFilterPlaces } from '../utils/enrichPlaces';
import { pickMostSevere } from '../utils/floodSeverity';
import { basemapPoiAt, hitsAppLayer, isSameSpot, nearestPlace } from '../utils/mapPoint';
import { ALL_CATEGORIES } from '../utils/placeCategory';
import { getVehicle } from '../utils/quickFilters';
import { useMapData } from './useMapData';
import { useMapInstance } from './useMapInstance';
import { useMapPointInfo } from './useMapPointInfo';
import { usePoiHover } from './usePoiHover';
import { useFloodMarkers, useItineraryMarkers, useItineraryRoute, usePlaceMarkers, useUserMarker } from './useMapMarkers';
import { getStoredUserLocation, useUserLocation } from './useUserLocation';

const POINT_ZOOM_STEP = 2;
const MAX_POINT_ZOOM = 18;

// Hook điều phối toàn bộ trang chủ bản đồ: dữ liệu, bộ lọc, lựa chọn, marker, hành động & dẫn đường Goong.
export const useHomeMap = () => {
  // Lỗi làm cả trang không dùng được (bản đồ không tải, mất mạng, máy chủ lỗi) => trang lỗi riêng
  const redirectOnError = useErrorRedirect();
  const redirectMapError = useCallback((error) => redirectOnError(error, { force: true }), [redirectOnError]);
  const { containerRef, map, error: mapError } = useMapInstance(redirectMapError);
  const query = useSearchStore((state) => state.query);
  const { category, budgetMax, radiusKm, vehicle, selectedPlaceId, activeFloodId } = useMapStore();
  const { setCategory, setSelectedPlaceId, setActiveFloodId, setVehicle: setMapVehicle } = useMapStore();
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
  // Nút "Vị trí của tôi": lần đầu vào có lời nhắc giải thích; bấm thử hoặc "Đã hiểu" là thôi hiện
  const locateHint = useFeatureHint('locate');
  const { dismiss: dismissLocateHint } = locateHint;
  const locateMe = useCallback(() => {
    dismissLocateHint();
    locate();
  }, [dismissLocateHint, locate]);
  // Địa điểm thật quanh vị trí người dùng (chưa có thì quanh trung tâm), tìm theo từ khoá trên Navbar ở server
  const { places, floodAlerts, isLoading } = useMapData(userCoordinates || getStoredUserLocation() || MAP_DEFAULT_CENTER, query, redirectOnError);

  const visiblePlaces = useMemo(
    // Từ khoá đã được server lọc (khớp cả món / địa chỉ) => không lọc lại theo tên ở đây
    () => enrichAndFilterPlaces(places, { origin: userCoordinates, vehicle, category, query: '', budgetMax, radiusKm }),
    [places, userCoordinates, vehicle, category, budgetMax, radiusKm],
  );
  const { point, open: openPoint, close: closePoint } = useMapPointInfo(map, { origin: userCoordinates, vehicle });
  // Địa điểm MapMate tìm được khi bấm 1 nhãn trên bản đồ nền (có thể không nằm trong 40 điểm đang hiện)
  const [pickedPlace, setPickedPlace] = useState(null);
  const pickedView = useMemo(
    () => (pickedPlace ? enrichAndFilterPlaces([pickedPlace], { origin: userCoordinates, vehicle, category: ALL_CATEGORIES, query: '', budgetMax: null, radiusKm: null })[0] : null),
    [pickedPlace, userCoordinates, vehicle],
  );
  const selectedPlace = visiblePlaces.find((place) => place.id === selectedPlaceId) ?? (pickedView?.id === selectedPlaceId ? pickedView : null);
  const markerPlaces = useMemo(
    () => (pickedView && pickedView.id === selectedPlaceId && !visiblePlaces.some((place) => place.id === pickedView.id) ? [...visiblePlaces, pickedView] : visiblePlaces),
    [visiblePlaces, pickedView, selectedPlaceId],
  );
  const floodAlert = floodAlerts.find((alert) => alert.id === activeFloodId) ?? pickMostSevere(floodAlerts);

  // Bấm 1 địa điểm (ghim đỏ / danh sách) => mở thẻ; bấm lại đúng địa điểm đang mở => ẩn thẻ (bật / tắt)
  const selectPlace = useCallback(
    (placeId) => {
      closePoint();
      if (placeId === useMapStore.getState().selectedPlaceId) {
        setSelectedPlaceId(null);
        return;
      }
      setSelectedPlaceId(placeId);
      const place = places.find((item) => item.id === placeId);
      if (place) flyTo(place.location.coordinates);
    },
    [places, flyTo, setSelectedPlaceId, closePoint],
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

  // Đồng bộ phương tiện: đổi ở nút lọc bản đồ (Xe máy / Đi bộ...) khi đang dẫn đường => tính lại đường theo phương tiện mới
  const tripVehicle = activeItinerary ? normalizeTripVehicle(activeItinerary.vehicle || vehicle) : null;
  const lastMapVehicleRef = useRef(vehicle);
  useEffect(() => {
    if (lastMapVehicleRef.current === vehicle) return;
    lastMapVehicleRef.current = vehicle;
    if (isNavigating && normalizeTripVehicle(vehicle) !== tripVehicle) setVehicle(normalizeTripVehicle(vehicle));
  }, [vehicle, isNavigating, tripVehicle, setVehicle]);

  // Đổi ở cột chỉ đường => cập nhật luôn nút lọc bản đồ (thời gian tới các địa điểm khác cũng theo phương tiện đó)
  const setTripVehicle = useCallback(
    (next) => {
      setVehicle(next);
      const mapValue = { bike: 'motorbike', taxi: 'car' }[next] ?? next;
      lastMapVehicleRef.current = mapValue;
      setMapVehicle(mapValue);
    },
    [setVehicle, setMapVehicle],
  );

  const fetchRequestIdRef = useRef(0);
  // Chế độ "Công cộng": tìm tuyến xe buýt / metro ở backend (đổi ưu tiên / cách ra trạm => tìm lại)
  const transitPrefs = useTransitPrefsStore((state) => state.prefs);
  const isTransitTrip = normalizeTripVehicle(activeItinerary?.vehicle || vehicle) === 'bus';
  const transitKey = isTransitTrip ? JSON.stringify(transitPrefs) : '';

  // 1. Tính toán lộ trình từ Goong Directions API (hoặc tuyến xe công cộng) khi có lộ trình đang dẫn đường
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
    const request = transitKey
      ? fetchTransitTripRoute(effectiveOrigin, activeItinerary.stops, places, JSON.parse(transitKey))
      : fetchTripRoute(effectiveOrigin, activeItinerary.stops, currentVehicle, places);
    request
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
          showToast(transitKey ? `Chưa tìm được tuyến xe buýt / metro: ${err.message}` : err.message, 'warning');
        }
      });

    return undefined;
  }, [
    isNavigating,
    activeItinerary,
    userCoordinates,
    vehicle,
    places,
    transitKey,
    setIsLoadingRoute,
    setRouteData,
    setRouteError,
    showToast,
  ]);

  // 2. Tự động căn góc nhìn bao quát toàn bộ lộ trình khi có routeData và map đã sẵn sàng
  useEffect(() => {
    if (!map || !routeData?.coordinates?.length || routeData.coordinates.length < 2 || routeData.transit) return; // xe công cộng: căn theo từng chặng
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
  usePlaceMarkers(map, isNavigating ? [] : markerPlaces, selectedPlaceId, selectPlace);
  useItineraryMarkers(
    map,
    isNavigating ? activeItinerary?.stops : [],
    activeStopIndex,
    selectStop,
    isNavigating ? userCoordinates : null,
    isNavigating ? routeData : null,
    places,
  );
  // Đi xe công cộng: lớp riêng vẽ từng chặng theo màu tuyến (MapHomePage) thay cho đường xanh của Goong
  useItineraryRoute(map, isNavigating && !routeData?.transit ? routeData?.coordinates : null);
  useFloodMarkers(map, isNavigating ? [] : floodAlerts, selectFloodAlert);
  useUserMarker(map, isNavigating ? null : userCoordinates);

  // Bấm 1 địa điểm / điểm bất kỳ trên bản đồ => thẻ thông tin; bấm lại đúng chỗ đó => ẩn thẻ (bật / tắt).
  // - Quán / nơi có trong dữ liệu MapMate => thẻ đầy đủ (đánh giá, giá, giờ mở cửa, thêm vào chuyến đi)
  // - Không có => thẻ điểm: tên nhãn bản đồ / địa chỉ, đường đi từ vị trí của bạn
  usePoiHover(map, !isNavigating);
  const lookupIdRef = useRef(0);
  const openedAtRef = useRef(null); // chỗ đã bấm để mở thẻ đang hiện (nhãn Goong và dữ liệu MapMate lệch nhau vài chục mét)
  const hasOpenCard = Boolean(selectedPlaceId || point);
  useEffect(() => {
    if (!map || isNavigating) return undefined;
    const closeCards = () => {
      lookupIdRef.current += 1; // bỏ kết quả tra cứu đang chờ
      setSelectedPlaceId(null);
      closePoint();
    };
    const onClick = (event) => {
      if (hitsAppLayer(map, event.point)) return; // trạm buýt... đã có thẻ riêng
      const poi = basemapPoiAt(map, event.point);
      const coordinates = poi?.coordinates ?? [event.lngLat.lng, event.lngLat.lat];
      const openedAt = [openedAtRef.current, point?.coordinates, selectedPlace?.location.coordinates].filter(Boolean);
      const isOpenHere = hasOpenCard && openedAt.some((spot) => isSameSpot(map, spot, coordinates));
      // Bấm lại đúng chỗ đang mở, hoặc đang mở thẻ mà bấm ra chỗ trống => ẩn thẻ
      if (isOpenHere || (hasOpenCard && !poi)) return closeCards();
      openedAtRef.current = coordinates;
      const place = nearestPlace(visiblePlaces, coordinates);
      if (place) {
        closePoint();
        setSelectedPlaceId(place.id);
        return undefined;
      }
      setSelectedPlaceId(null);
      openPoint(coordinates, poi); // hiện ngay thẻ điểm, có dữ liệu MapMate thì đổi sang thẻ đầy đủ
      const lookupId = ++lookupIdRef.current;
      findPlaceAt(coordinates, poi?.name ?? null)
        .then((found) => {
          if (!found || lookupId !== lookupIdRef.current) return;
          setPickedPlace(found);
          closePoint();
          setSelectedPlaceId(found.id);
        })
        .catch(() => {}); // tra không được thì giữ thẻ điểm
      return undefined;
    };
    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [map, isNavigating, hasOpenCard, point, selectedPlace, visiblePlaces, openPoint, closePoint, setSelectedPlaceId]);
  // Bắt đầu dẫn đường => bỏ ghim
  useEffect(() => {
    if (isNavigating) closePoint();
  }, [isNavigating, closePoint]);

  // "Thêm vào lộ trình" => thêm thật vào giỏ chuyến đi DÙNG CHUNG với trang Khám phá
  const draftPlaces = useTripDraftStore((state) => state.places);
  const addDraftPlace = useTripDraftStore((state) => state.addPlace);
  const addToItinerary = useCallback(
    (place) => {
      if (draftPlaces.some((item) => item.id === place.id)) return showToast(`"${place.name}" đã có trong chuyến đi`, 'info');
      if (!addDraftPlace(place)) return showToast(`Mỗi chuyến đi tối đa ${TRIP_DRAFT_MAX_PLACES} điểm`, 'warning');
      return showToast(`Đã thêm "${place.name}" vào chuyến đi (${draftPlaces.length + 1}/${TRIP_DRAFT_MAX_PLACES})`);
    },
    [draftPlaces, addDraftPlace, showToast],
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
      setSelectedPlaceId(null); // đóng thẻ địa điểm để không che bản đồ khi dẫn đường
      useActiveRouteStore.getState().startTrip(singleTrip);
      showToast(`Đang tìm đường đến ${place.name}…`);
    },
    [vehicle, showToast, setSelectedPlaceId],
  );

  // Chấm Goong đang gộp nhiều địa điểm => "Phóng to xem quanh đây" thay cho tự kéo / chụm tay phóng to
  const zoomToPoint = useCallback(() => {
    if (!map || !point) return;
    closePoint();
    map.flyTo({ center: point.coordinates, zoom: Math.min(map.getZoom() + POINT_ZOOM_STEP, MAX_POINT_ZOOM), essential: true });
  }, [map, point, closePoint]);

  // Chỉ đường tới điểm đã ghim (không phải địa điểm trong dữ liệu MapMate)
  const showPointDirections = useCallback(() => {
    if (!point) return;
    const name = point.title ?? 'Vị trí đã ghim';
    showDirections({ id: null, name, category: 'other', address: point.address ?? '', location: { type: 'Point', coordinates: point.coordinates } });
  }, [point, showDirections]);

  return {
    mapContainerRef: containerRef,
    map,
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
    locate: locateMe,
    showLocateHint: locateHint.isVisible && Boolean(map),
    dismissLocateHint,
    userCoordinates,
    addToItinerary,
    showDirections,
    mapPoint: point,
    closeMapPoint: closePoint,
    zoomToPoint,
    showPointDirections,
    // Trạng thái dẫn đường lộ trình từ Khám phá / Của tôi
    activeItinerary,
    isNavigating,
    activeStopIndex,
    routeData,
    isLoadingRoute,
    stopTrip,
    selectStop,
    setVehicle: setTripVehicle,
  };
};

