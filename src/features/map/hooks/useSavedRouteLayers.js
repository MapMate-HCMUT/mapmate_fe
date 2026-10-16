import { LngLatBounds } from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../../stores/themeStore';
import { getSavedRouteGeometry } from '../api/savedRouteGeometry';
import { PLACE_PIN_LAYER, SAVED_ROUTE_STOP_LAYER } from '../utils/mapPoint';

const LINE_SOURCE = 'mapmate-saved-routes';
const STOP_SOURCE = 'mapmate-saved-route-stops-source';
const LAYERS = {
  casing: 'mapmate-saved-routes-casing',
  line: 'mapmate-saved-routes-line',
  stops: SAVED_ROUTE_STOP_LAYER,
  labels: 'mapmate-saved-route-stop-labels',
};
const EMPTY = { type: 'FeatureCollection', features: [] };
const CASING_COLOR = { light: '#ffffff', dark: '#0b1120' };
const FALLBACK_FONT = ['Roboto Regular'];
const FIT_PADDING = { top: 70, bottom: 70, left: 70, right: 70 };

// Font chữ có sẵn trong kiểu bản đồ đang dùng (số thứ tự trên điểm dừng phải dùng font bản đồ đã có glyph)
const styleFont = (map) => {
  const font = map.getStyle()?.layers?.find((layer) => layer.type === 'symbol' && Array.isArray(layer.layout?.['text-font']))?.layout['text-font'];
  return font?.every((item) => typeof item === 'string') ? font : FALLBACK_FONT;
};

const addLayers = (map, theme) => {
  map.addSource(LINE_SOURCE, { type: 'geojson', data: EMPTY });
  map.addSource(STOP_SOURCE, { type: 'geojson', data: EMPTY });
  // Đường nằm dưới ghim địa điểm (ghim vẫn bấm được), điểm dừng nằm trên cùng
  const beforePins = map.getLayer(PLACE_PIN_LAYER) ? PLACE_PIN_LAYER : undefined;
  map.addLayer({
    id: LAYERS.casing,
    type: 'line',
    source: LINE_SOURCE,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': CASING_COLOR[theme], 'line-width': ['case', ['get', 'focused'], 11, 8], 'line-opacity': ['case', ['get', 'dimmed'], 0.5, 0.9] },
  }, beforePins);
  map.addLayer({
    id: LAYERS.line,
    type: 'line',
    source: LINE_SOURCE,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['case', ['get', 'focused'], 7, 4.5],
      'line-opacity': ['case', ['get', 'dimmed'], 0.55, 1],
      'line-dasharray': ['case', ['get', 'exact'], ['literal', [1, 0]], ['literal', [2, 1.5]]], // đường ước lượng => nét đứt
    },
  }, beforePins);
  map.addLayer({
    id: LAYERS.stops,
    type: 'circle',
    source: STOP_SOURCE,
    paint: {
      'circle-radius': ['case', ['get', 'focused'], 11, 9],
      'circle-color': ['get', 'color'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
      'circle-opacity': ['case', ['get', 'dimmed'], 0.45, 1],
      'circle-stroke-opacity': ['case', ['get', 'dimmed'], 0.45, 1],
    },
  });
  map.addLayer({
    id: LAYERS.labels,
    type: 'symbol',
    source: STOP_SOURCE,
    layout: { 'text-field': ['to-string', ['get', 'label']], 'text-font': styleFont(map), 'text-size': 11, 'text-allow-overlap': true, 'text-ignore-placement': true },
    paint: { 'text-color': '#ffffff', 'text-opacity': ['case', ['get', 'dimmed'], 0.6, 1] },
  });
};

const removeLayers = (map) => {
  if (!map.style) return; // bản đồ đã bị gỡ
  Object.values(LAYERS).forEach((id) => map.getLayer(id) && map.removeLayer(id));
  [LINE_SOURCE, STOP_SOURCE].forEach((id) => map.getSource(id) && map.removeSource(id));
};

/**
 * Vẽ các lộ trình đã lưu đang bật lên bản đồ: mỗi lộ trình 1 màu, đường theo đường phố, điểm dừng đánh số.
 * routes: [{ itinerary, color }]; focusedId: lộ trình đang chọn (đậm hơn, các lộ trình khác mờ đi);
 * onSelectRoute(id): bấm vào đường / điểm dừng. Trả về { fitRoute(id), loadingIds }.
 */
// coverBottom (0–1): phần đáy bản đồ đang bị che (bảng trượt trên điện thoại) => thu phóng chừa chỗ đó ra
export const useSavedRouteLayers = (map, routes, { enabled = true, focusedId = null, onSelectRoute, autoFitId = null, coverBottom = 0 } = {}) => {
  const theme = useThemeStore((state) => state.theme);
  const [geometries, setGeometries] = useState({}); // id -> { coordinates, stops, exact }
  const [failedIds, setFailedIds] = useState(() => new Set()); // không lấy được toạ độ / đường đi
  const onSelectRef = useRef(onSelectRoute);
  const fittedRef = useRef(null);
  useEffect(() => {
    onSelectRef.current = onSelectRoute;
  }, [onSelectRoute]);

  // Lấy hình dạng đường cho các lộ trình mới bật (lần lượt từng lộ trình, có nhớ lại)
  const routeKey = routes.map(({ itinerary }) => `${itinerary.id}:${itinerary.updated_at ?? ''}`).join('|');
  useEffect(() => {
    let isActive = true;
    const missing = routes.filter(({ itinerary }) => !geometries[itinerary.id]);
    if (!missing.length) return undefined;
    (async () => {
      for (const { itinerary } of missing) {
        const geometry = await getSavedRouteGeometry(itinerary).catch(() => null);
        if (!isActive) return;
        if (geometry) setGeometries((prev) => ({ ...prev, [itinerary.id]: geometry }));
        else setFailedIds((prev) => new Set(prev).add(itinerary.id));
      }
    })();
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi danh sách lộ trình bật thay đổi
  }, [routeKey]);

  // Thêm lớp 1 lần cho mỗi bản đồ; bấm đường / điểm dừng => chọn lộ trình đó
  useEffect(() => {
    if (!map) return undefined;
    if (!map.getSource(LINE_SOURCE)) addLayers(map, useThemeStore.getState().theme);
    const onClick = (event) => {
      const id = event.features?.[0]?.properties?.id;
      if (id) onSelectRef.current?.(id);
    };
    const pointer = (cursor) => () => {
      map.getCanvas().style.cursor = cursor;
    };
    const onEnter = pointer('pointer');
    const onLeave = pointer('');
    [LAYERS.line, LAYERS.stops].forEach((layer) => {
      map.on('click', layer, onClick);
      map.on('mouseenter', layer, onEnter);
      map.on('mouseleave', layer, onLeave);
    });
    return () => {
      [LAYERS.line, LAYERS.stops].forEach((layer) => {
        map.off('click', layer, onClick);
        map.off('mouseenter', layer, onEnter);
        map.off('mouseleave', layer, onLeave);
      });
      removeLayers(map);
    };
  }, [map]);

  // Viền đường theo nền sáng / tối
  useEffect(() => {
    if (map?.getLayer(LAYERS.casing)) map.setPaintProperty(LAYERS.casing, 'line-color', CASING_COLOR[theme]);
  }, [map, theme]);

  // Dữ liệu vẽ: đường + điểm dừng của các lộ trình đang bật (lộ trình đang chọn vẽ sau cùng => nằm trên)
  useEffect(() => {
    if (!map?.getSource(LINE_SOURCE)) return; // lớp được thêm ở effect phía trên (chạy trước trong cùng lượt)
    const drawn = enabled ? routes.filter(({ itinerary }) => geometries[itinerary.id]) : [];
    const ordered = [...drawn].sort((a, b) => Number(a.itinerary.id === focusedId) - Number(b.itinerary.id === focusedId));
    const flags = (id) => ({ focused: id === focusedId, dimmed: Boolean(focusedId) && id !== focusedId });
    // Điểm dừng đánh số luôn nằm trên cùng (ghim địa điểm có thể được thêm sau lớp này)
    [LAYERS.stops, LAYERS.labels].forEach((layer) => map.getLayer(layer) && map.moveLayer(layer));
    map.getSource(LINE_SOURCE)?.setData({
      type: 'FeatureCollection',
      features: ordered
        .filter(({ itinerary }) => geometries[itinerary.id].coordinates.length > 1)
        .map(({ itinerary, color }) => ({
          type: 'Feature',
          properties: { id: itinerary.id, color, exact: geometries[itinerary.id].exact, ...flags(itinerary.id) },
          geometry: { type: 'LineString', coordinates: geometries[itinerary.id].coordinates },
        })),
    });
    map.getSource(STOP_SOURCE)?.setData({
      type: 'FeatureCollection',
      features: ordered.flatMap(({ itinerary, color }) =>
        geometries[itinerary.id].stops.map((stop) => ({
          type: 'Feature',
          properties: { id: itinerary.id, color, label: stop.index + 1, name: stop.name, routeName: itinerary.name, ...flags(itinerary.id) },
          geometry: { type: 'Point', coordinates: stop.coordinates },
        })),
      ),
    });
  }, [map, routes, geometries, enabled, focusedId]);

  const fitRoute = useCallback(
    (id) => {
      const coordinates = geometries[id]?.coordinates;
      if (!map || !coordinates?.length) return;
      if (coordinates.length === 1) {
        map.flyTo({ center: coordinates[0], zoom: Math.max(map.getZoom(), 15), essential: true });
        return;
      }
      const bounds = coordinates.reduce((box, point) => box.extend(point), new LngLatBounds(coordinates[0], coordinates[0]));
      const bottom = FIT_PADDING.bottom + Math.round(map.getContainer().clientHeight * coverBottom);
      map.fitBounds(bounds, { padding: { ...FIT_PADDING, bottom }, maxZoom: 16, duration: 800 });
    },
    [map, geometries, coverBottom],
  );

  // Vừa bật 1 lộ trình => thu phóng tới lộ trình đó khi đã có đường
  useEffect(() => {
    if (!enabled || !autoFitId || fittedRef.current === autoFitId || !geometries[autoFitId]) return;
    fittedRef.current = autoFitId;
    fitRoute(autoFitId);
  }, [enabled, autoFitId, geometries, fitRoute]);

  const loadingIds = routes.map(({ itinerary }) => itinerary.id).filter((id) => !geometries[id] && !failedIds.has(id));
  return { fitRoute, loadingIds, geometries };
};
