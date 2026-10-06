import { useCallback, useEffect, useRef, useState } from 'react';
import { getRailLinesApi, getTransitStopsApi } from '../api/transitApi';
import { addTransitIcons, TRANSIT_ICONS } from '../utils/transitIcons';

const SOURCES = { lines: 'transit-lines', stops: 'transit-stops', route: 'transit-route', routeStops: 'transit-route-stops' };
const LAYERS = {
  lines: 'transit-lines-line',
  route: 'transit-route-line',
  routeStops: 'transit-route-stops-circle',
  stops: 'transit-stops-icon',
};
const STOPS_MIN_ZOOM = 14.5; // trạm buýt rất dày => chỉ hiện khi đã phóng to
const empty = () => ({ type: 'FeatureCollection', features: [] });
const iconOf = (modes = []) => (modes.includes('metro') ? TRANSIT_ICONS.metroStation : modes.includes('waterbus') ? TRANSIT_ICONS.waterbusStop : TRANSIT_ICONS.busStop);

const stopFeatures = (stops) => ({
  type: 'FeatureCollection',
  features: stops.map((stop) => ({
    type: 'Feature',
    properties: { id: stop.id, icon: iconOf(stop.modes), rail: stop.modes.some((mode) => mode !== 'bus') },
    geometry: { type: 'Point', coordinates: [stop.coordinates.lng, stop.coordinates.lat] },
  })),
});

const addLayers = (map) => {
  Object.values(SOURCES).forEach((id) => map.addSource(id, { type: 'geojson', data: empty() }));
  map.addLayer({ id: LAYERS.lines, type: 'line', source: SOURCES.lines, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 15, 6], 'line-opacity': 0.85 } });
  map.addLayer({ id: LAYERS.route, type: 'line', source: SOURCES.route, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 6, 'line-opacity': 0.9 } });
  map.addLayer({ id: LAYERS.routeStops, type: 'circle', source: SOURCES.routeStops, paint: { 'circle-radius': 4, 'circle-color': '#ffffff', 'circle-stroke-color': ['get', 'color'], 'circle-stroke-width': 2.5 } });
  map.addLayer({
    id: LAYERS.stops,
    type: 'symbol',
    source: SOURCES.stops,
    layout: {
      'icon-image': ['get', 'icon'],
      // ga metro / bến sông to hơn trạm buýt; MapLibre chỉ cho 1 phép nội suy theo zoom => đặt ngoài cùng
      'icon-size': ['interpolate', ['linear'], ['zoom'], 10, ['case', ['get', 'rail'], 0.55, 0.45], 14, ['case', ['get', 'rail'], 0.75, 0.6], 17, ['case', ['get', 'rail'], 0.95, 0.9]],
      'icon-allow-overlap': true,
      'symbol-sort-key': ['case', ['get', 'rail'], 1, 0],
    },
  });
};
const removeLayers = (map) => {
  Object.values(LAYERS).forEach((id) => map.getLayer(id) && map.removeLayer(id));
  Object.values(SOURCES).forEach((id) => map.getSource(id) && map.removeSource(id));
};

/**
 * Lớp giao thông công cộng: metro + buýt sông luôn hiện; trạm buýt hiện khi phóng to; tuyến đang xem (đường + trạm).
 * Bấm vào trạm => onSelectStop(stopId).
 */
export const useTransitLayer = (map, enabled, onSelectStop, selectedRoute) => {
  const [state, setState] = useState({ stopCount: 0, tooFar: false, error: null });
  const railRef = useRef({ lines: empty(), stations: [] });
  const requestRef = useRef(0);
  const readyRef = useRef(false);

  const loadStops = useCallback(async () => {
    if (!map?.getSource(SOURCES.stops)) return;
    const tooFar = map.getZoom() < STOPS_MIN_ZOOM;
    const requestId = ++requestRef.current;
    if (tooFar) {
      map.getSource(SOURCES.stops).setData(stopFeatures(railRef.current.stations));
      return setState((prev) => ({ ...prev, stopCount: 0, tooFar }));
    }
    const bounds = map.getBounds();
    try {
      const data = await getTransitStopsApi({ bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()] });
      if (requestId !== requestRef.current || !map.getSource(SOURCES.stops)) return undefined;
      map.getSource(SOURCES.stops).setData(stopFeatures(data.items));
      return setState({ stopCount: data.items.length, tooFar, error: null });
    } catch (err) {
      return setState((prev) => ({ ...prev, error: err.message }));
    }
  }, [map]);

  useEffect(() => {
    if (!map || !enabled) return undefined;
    let active = true;
    const onClick = (event) => {
      event.preventDefault?.();
      onSelectStop(event.features[0].properties.id);
    };
    const pointer = (cursor) => () => (map.getCanvas().style.cursor = cursor);
    const onEnter = pointer('pointer');
    const onLeave = pointer('');

    addTransitIcons(map)
      .then(async () => {
        if (!active) return;
        addLayers(map);
        readyRef.current = true;
        map.on('click', LAYERS.stops, onClick);
        map.on('mouseenter', LAYERS.stops, onEnter);
        map.on('mouseleave', LAYERS.stops, onLeave);
        map.on('moveend', loadStops);
        const rail = await getRailLinesApi();
        if (!active || !map.getSource(SOURCES.lines)) return;
        railRef.current = {
          stations: rail.stations,
          lines: { type: 'FeatureCollection', features: rail.lines.filter((line) => line.path.length > 1).map((line) => ({ type: 'Feature', properties: { color: line.color || '#2563eb' }, geometry: { type: 'LineString', coordinates: line.path } })) },
        };
        map.getSource(SOURCES.lines).setData(railRef.current.lines);
        loadStops();
      })
      .catch((err) => active && setState((prev) => ({ ...prev, error: err.message })));

    return () => {
      active = false;
      readyRef.current = false;
      map.off('click', LAYERS.stops, onClick);
      map.off('mouseenter', LAYERS.stops, onEnter);
      map.off('mouseleave', LAYERS.stops, onLeave);
      map.off('moveend', loadStops);
      removeLayers(map);
      setState({ stopCount: 0, tooFar: false, error: null });
    };
  }, [map, enabled, loadStops, onSelectStop]);

  // Tuyến đang xem: vẽ đường đi + các trạm của lượt đang chọn
  useEffect(() => {
    if (!map || !enabled) return;
    const draw = () => {
      if (!map.getSource(SOURCES.route)) return;
      const color = selectedRoute?.color || '#0284c7';
      map.getSource(SOURCES.route).setData(selectedRoute?.path?.length > 1 ? { type: 'Feature', properties: { color }, geometry: { type: 'LineString', coordinates: selectedRoute.path } } : empty());
      map.getSource(SOURCES.routeStops).setData({
        type: 'FeatureCollection',
        features: (selectedRoute?.stops ?? []).map((stop) => ({ type: 'Feature', properties: { color }, geometry: { type: 'Point', coordinates: stop.coordinates } })),
      });
    };
    if (readyRef.current) draw();
    else map.once('idle', draw);
  }, [map, enabled, selectedRoute]);

  return { ...state, tooFar: enabled && state.tooFar };
};
