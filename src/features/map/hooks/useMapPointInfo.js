import { Marker } from 'maplibre-gl';
import { useCallback, useEffect, useState } from 'react';
import { formatDistance } from '../../../utils/calculateDistance';
import { fetchLegDirections, normalizeTripVehicle, TRIP_VEHICLES } from '../api/goongDirections';
import { reverseGeocode } from '../api/goongGeocode';

const ROUTE_SOURCE = 'map-point-route';
const ROUTE_LAYER = 'map-point-route-line';
const PIN_COLOR = '#1f2937'; // khác ghim đỏ của địa điểm MapMate
const METERS_PER_KM = 1000;
const COORD_DECIMALS = 5;
const keyOf = (coordinates) => (coordinates ? coordinates.map((value) => value.toFixed(COORD_DECIMALS)).join(',') : '');

const removeRouteLayer = (map) => {
  if (map.getLayer(ROUTE_LAYER)) map.removeLayer(ROUTE_LAYER);
  if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE);
};

/**
 * Bấm 1 điểm bất kỳ trên bản đồ => thẻ thông tin: tên (nhãn bản đồ / Goong Geocode), địa chỉ,
 * đường đi + thời gian từ vị trí của bạn theo phương tiện đang chọn (Goong Directions, vẽ nét đứt xem trước).
 */
export const useMapPointInfo = (map, { origin, vehicle }) => {
  const [target, setTarget] = useState(null); // { coordinates, poi: { name, kindLabel, clusterCount } | null }
  const [geo, setGeo] = useState({ key: null, data: null });
  const [route, setRoute] = useState({ key: null, leg: null, error: null });

  const tripVehicle = normalizeTripVehicle(vehicle);
  const targetKey = keyOf(target?.coordinates);
  const routeKey = target && origin ? `${targetKey}|${keyOf(origin)}|${tripVehicle}` : '';

  const open = useCallback((coordinates, poi = null) => setTarget({ coordinates, poi }), []);
  const close = useCallback(() => setTarget(null), []);

  // Tên + địa chỉ
  useEffect(() => {
    if (!target) return undefined;
    let active = true;
    reverseGeocode(target.coordinates)
      .then((data) => active && setGeo({ key: targetKey, data }))
      .catch(() => active && setGeo({ key: targetKey, data: null }));
    return () => {
      active = false;
    };
  }, [target, targetKey]);

  // Đường đi từ vị trí của bạn (đổi phương tiện => tính lại; đường đã có thì lấy từ cache)
  useEffect(() => {
    if (!routeKey) return undefined;
    let active = true;
    fetchLegDirections(origin, target.coordinates, tripVehicle)
      .then((leg) => active && setRoute({ key: routeKey, leg, error: null }))
      .catch(() => active && setRoute({ key: routeKey, leg: null, error: 'Chưa tìm được đường tới điểm này' }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- routeKey đại diện cho (điểm đến, điểm đi, phương tiện)
  }, [routeKey]);

  const leg = route.key === routeKey ? route.leg : null;

  // Ghim tại điểm đã bấm
  useEffect(() => {
    if (!map || !target) return undefined;
    const marker = new Marker({ color: PIN_COLOR, scale: 0.95 }).setLngLat(target.coordinates).addTo(map);
    // Bấm vào chính cây ghim => ẩn thẻ (bật / tắt)
    const element = marker.getElement();
    element.style.cursor = 'pointer';
    element.title = 'Bấm để ẩn thông tin';
    const onPinClick = (event) => {
      event.stopPropagation();
      setTarget(null);
    };
    element.addEventListener('click', onPinClick);
    return () => {
      element.removeEventListener('click', onPinClick);
      marker.remove();
    };
  }, [map, target]);

  // Nét đứt xem trước đường đi
  useEffect(() => {
    if (!map || !leg?.coordinates?.length) return undefined;
    const data = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: leg.coordinates } };
    removeRouteLayer(map);
    map.addSource(ROUTE_SOURCE, { type: 'geojson', data });
    map.addLayer({
      id: ROUTE_LAYER,
      type: 'line',
      source: ROUTE_SOURCE,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#2563eb', 'line-width': 4, 'line-opacity': 0.8, 'line-dasharray': [1.5, 1.5] },
    });
    return () => removeRouteLayer(map);
  }, [map, leg]);

  const title = target?.poi?.name ?? (geo.key === targetKey ? geo.data?.name : null) ?? null;
  const address = geo.key === targetKey ? geo.data?.address ?? null : null;
  const point = target && {
    coordinates: target.coordinates,
    title,
    kindLabel: target.poi?.kindLabel ?? null,
    nearbyCount: Math.max(0, (target.poi?.clusterCount ?? 1) - 1), // số địa điểm khác Goong đang gộp vào chấm này
    // "86 Lê Thánh Tôn" + "86 Lê Thánh Tôn, Bến Nghé, Quận 1" => dòng địa chỉ chỉ còn "Bến Nghé, Quận 1"
    address: title && address?.startsWith(`${title}, `) ? address.slice(title.length + 2) : address,
    isLoadingPlace: geo.key !== targetKey,
    hasOrigin: Boolean(origin),
    route: leg && {
      distanceText: formatDistance((leg.distance.value || 0) / METERS_PER_KM),
      durationText: leg.duration.text,
      note: TRIP_VEHICLES[tripVehicle].note ?? null,
    },
    isLoadingRoute: Boolean(routeKey) && route.key !== routeKey,
    routeError: route.key === routeKey ? route.error : null,
  };

  return { point, open, close };
};
