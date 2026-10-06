import { Marker } from 'maplibre-gl';
import { useEffect } from 'react';
import { getStopCoordinates } from '../api/goongDirections';
import {
  createFloodMarkerElement,
  createItineraryStopMarkerElement,
  createOriginMarkerElement,
  createRouteCalloutElement,
  createUserMarkerElement,
} from '../utils/createMarkerElements';

const addMarker = (map, element, coordinates, onClick, options = {}) => {
  if (onClick) {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
  }
  return new Marker({ element, ...options }).setLngLat(coordinates).addTo(map);
};

// Hiển thị marker các địa điểm: Dùng marker ghim mặc định chuẩn Goong / MapLibre (không dùng icon emoji bong bóng tròn)
export const usePlaceMarkers = (map, places, selectedPlaceId, onSelectPlace) => {
  useEffect(() => {
    if (!map) return undefined;
    const markers = places.map((place) => {
      const isSelected = place.id === selectedPlaceId;
      const marker = new Marker({
        color: isSelected ? '#2563eb' : '#ea4335',
        scale: isSelected ? 1.15 : 0.85,
      })
        .setLngLat(place.location.coordinates)
        .addTo(map);

      const el = marker.getElement();
      el.style.cursor = 'pointer';
      el.title = place.name;
      if (onSelectPlace) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectPlace(place.id);
        });
      }
      return marker;
    });
    return () => markers.forEach((marker) => marker.remove());
  }, [map, places, selectedPlaceId, onSelectPlace]);
};

export const useFloodMarkers = (map, floodAlerts, onSelectAlert) => {
  useEffect(() => {
    if (!map) return undefined;
    const markers = floodAlerts.map((alert) => {
      const el = createFloodMarkerElement(alert);
      return addMarker(map, el, alert.location.coordinates, () => onSelectAlert(alert.id));
    });
    return () => markers.forEach((marker) => marker.remove());
  }, [map, floodAlerts, onSelectAlert]);
};

export const useUserMarker = (map, coordinates) => {
  useEffect(() => {
    if (!map || !coordinates) return undefined;
    const marker = addMarker(map, createUserMarkerElement(), coordinates);
    return () => marker.remove();
  }, [map, coordinates]);
};

// Marker cho từng điểm trong lộ trình chuẩn phong cách Goong Maps:
// 1. Điểm xuất phát: Vòng tròn trắng viền đen
// 2. Điểm trung gian: Số thứ tự 1, 2...
// 3. Điểm đích đến cuối: Ghim đỏ
// 4. Badge nổi trên đường: Quãng đường & Thời gian
export const useItineraryMarkers = (map, stops, activeStopIndex, onSelectStop, userCoordinates, routeData, places = []) => {
  useEffect(() => {
    if (!map || !stops?.length) return undefined;
    const markers = [];

    // 1. Điểm xuất phát (Origin)
    const originCoords = userCoordinates || (stops[0] ? getStopCoordinates(stops[0], places) : null);
    if (originCoords) {
      const originEl = createOriginMarkerElement('Vị trí của bạn');
      const originMarker = addMarker(map, originEl, originCoords, null, { anchor: 'center' });
      markers.push(originMarker);
    }

    // 2. Các điểm dừng (Stops)
    stops.forEach((stop, index) => {
      const coords = getStopCoordinates(stop, places);
      if (!coords) return;
      const isLast = index === stops.length - 1;
      const isActive = index === activeStopIndex;
      const stopName = stop.place?.name || stop.place_name || `Điểm ${index + 1}`;

      if (isLast) {
        // Điểm đích đến cuối: icon ghim đỏ mặc định chuẩn Goong / MapLibre
        // Luôn đỏ (dễ nhận ra là điểm đến); đang xem chặng này thì to hơn
        const destMarker = new Marker({
          color: '#ea4335',
          scale: isActive ? 1.25 : 1.0,
        })
          .setLngLat(coords)
          .addTo(map);

        const el = destMarker.getElement();
        el.style.cursor = 'pointer';
        el.title = `Đích đến: ${stopName}`;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectStop?.(index, stop);
        });
        markers.push(destMarker);
        return;
      }

      const el = createItineraryStopMarkerElement(stop, index, false, isActive);
      const marker = addMarker(map, el, coords, () => onSelectStop?.(index, stop), {
        anchor: 'center',
      });
      markers.push(marker);
    });

    // 3. Badge thông tin thời gian & khoảng cách đặt ngay trên đường thoáng (Callout giống Goong Maps)
    if (routeData?.midpoint && routeData?.totalDistance && routeData?.totalDuration) {
      const calloutEl = createRouteCalloutElement(routeData.totalDistance, routeData.totalDuration);
      const calloutMarker = addMarker(map, calloutEl, routeData.midpoint, null, { anchor: 'center' });
      markers.push(calloutMarker);
    }

    return () => markers.forEach((marker) => marker.remove());
  }, [map, stops, activeStopIndex, onSelectStop, userCoordinates, routeData, places]);
};

// Vẽ đường polyline từ Goong Directions API lên bản đồ chuẩn xanh Goong Maps (#2563eb / #1d4ed8)
const ROUTE_SOURCE_ID = 'goong-itinerary-route-source';
const ROUTE_LAYER_GLOW_ID = 'goong-itinerary-route-glow';
const ROUTE_LAYER_CASING_ID = 'goong-itinerary-route-casing';
const ROUTE_LAYER_LINE_ID = 'goong-itinerary-route-line';

export const useItineraryRoute = (map, coordinates) => {
  useEffect(() => {
    if (!map) return undefined;

    const cleanupLayers = () => {
      try {
        if (map.getLayer(ROUTE_LAYER_LINE_ID)) map.removeLayer(ROUTE_LAYER_LINE_ID);
        if (map.getLayer(ROUTE_LAYER_CASING_ID)) map.removeLayer(ROUTE_LAYER_CASING_ID);
        if (map.getLayer(ROUTE_LAYER_GLOW_ID)) map.removeLayer(ROUTE_LAYER_GLOW_ID);
        if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
      } catch (err) {
        console.warn('Lỗi gỡ route layers:', err);
      }
    };

    if (!coordinates || coordinates.length < 2) {
      cleanupLayers();
      return undefined;
    }

    const geojsonData = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    };

    const renderRoute = () => {
      try {
        // 1. Kiểm tra hoặc thêm Source
        const source = map.getSource(ROUTE_SOURCE_ID);
        if (source) {
          source.setData(geojsonData);
        } else {
          map.addSource(ROUTE_SOURCE_ID, {
            type: 'geojson',
            data: geojsonData,
          });
        }

        // 2. Thêm hoặc khôi phục từng Layer (không return sớm nếu source đã tồn tại)
        if (!map.getLayer(ROUTE_LAYER_GLOW_ID)) {
          map.addLayer({
            id: ROUTE_LAYER_GLOW_ID,
            type: 'line',
            source: ROUTE_SOURCE_ID,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 12,
              'line-opacity': 0.35,
            },
          });
        }

        if (!map.getLayer(ROUTE_LAYER_CASING_ID)) {
          map.addLayer({
            id: ROUTE_LAYER_CASING_ID,
            type: 'line',
            source: ROUTE_SOURCE_ID,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#1d4ed8',
              'line-width': 8,
              'line-opacity': 0.95,
            },
          });
        }

        if (!map.getLayer(ROUTE_LAYER_LINE_ID)) {
          map.addLayer({
            id: ROUTE_LAYER_LINE_ID,
            type: 'line',
            source: ROUTE_SOURCE_ID,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#2563eb',
              'line-width': 5.5,
              'line-opacity': 1.0,
            },
          });
        }
      } catch (err) {
        console.warn('Lỗi vẽ route layers:', err);
      }
    };

    if (map.isStyleLoaded()) {
      renderRoute();
    } else {
      map.once('styledata', renderRoute);
    }

    const onStyleData = () => {
      if (map.isStyleLoaded()) {
        renderRoute();
      }
    };
    map.on('styledata', onStyleData);

    return () => {
      map.off('styledata', onStyleData);
      map.off('styledata', renderRoute);
    };
  }, [map, coordinates]);
};
