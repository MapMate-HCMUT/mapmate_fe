import { LngLatBounds, Marker } from 'maplibre-gl';
import { useEffect, useMemo, useState } from 'react';
import { getWalkPathApi } from '../api/transitApi';
import { legColor, legMode } from '../utils/transitFormat';

const SOURCE = 'transit-journey';
const LAYERS = { casing: 'transit-journey-casing', solid: 'transit-journey-solid', dashed: 'transit-journey-dashed' };
const ROAD_GEOMETRY_MIN_M = 60; // chặng đi bộ / gọi xe dài hơn => lấy đường thật (ngắn thì vẽ thẳng)
const MAX_ROAD_REQUESTS = 6;
const FIT_PADDING = { top: 140, bottom: 80, left: 150, right: 170 }; // chừa chỗ cho nhãn điểm đến / trạm lên xuống ở mép
const PIN_HEIGHT_PX = 52; // ghim điểm đến đang xem (marker MapLibre phóng 1,25 lần) => nhãn đặt ngay trên ghim

// Phương án đang chọn của từng chặng: [{ legIndex, legs }]
const selectedOptions = (transit) =>
  transit ? transit.plans.map((plan, legIndex) => ({ legIndex, legs: plan.options[transit.selected[legIndex] ?? 0]?.legs ?? [] })) : [];
const roadKey = (leg) => `${leg.from.coordinates}>${leg.to.coordinates}`;
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const addLayers = (map) => {
  map.addSource(SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: LAYERS.casing, type: 'line', source: SOURCE, filter: ['!', ['get', 'dashed']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 10, 'line-opacity': 1 } });
  map.addLayer({ id: LAYERS.solid, type: 'line', source: SOURCE, filter: ['!', ['get', 'dashed']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 6, 'line-opacity': 1 } });
  map.addLayer({ id: LAYERS.dashed, type: 'line', source: SOURCE, filter: ['get', 'dashed'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-dasharray': [1, 1.6], 'line-opacity': 1 } });
};
const removeLayers = (map) => {
  Object.values(LAYERS).forEach((id) => map.getLayer(id) && map.removeLayer(id));
  if (map.getSource(SOURCE)) map.removeSource(SOURCE);
};

// Nhãn nổi trên bản đồ: trạm lên ([31] Lên · Lý Tự Trọng), trạm xuống, điểm đến của chặng
const stopLabel = (leg, kind) => {
  const element = document.createElement('div');
  element.className = 'pointer-events-none flex items-center gap-1 rounded-pill bg-surface px-2 py-1 text-[11px] font-semibold text-neutral-800 shadow-card whitespace-nowrap';
  const routes = kind === 'board' ? [leg.route, ...(leg.alternatives ?? []).map((alt) => alt.route)] : [leg.route];
  const badge = routes
    .slice(0, 3)
    .map((route) => `<span class="rounded-[5px] px-1 text-[10px] font-bold text-white" style="background:${route.color || legColor(leg)}">${escapeHtml(route.number)}</span>`)
    .join('');
  const point = kind === 'board' ? leg.from : leg.to;
  element.innerHTML = `${badge}<span>${kind === 'board' ? 'Lên' : 'Xuống'} · ${escapeHtml(point.name)}</span>`;
  return element;
};
const destinationLabel = (name, legIndex, total) => {
  const element = document.createElement('div');
  element.className = 'pointer-events-none flex flex-col items-center';
  element.innerHTML = `<div class="rounded-card bg-rose-600 px-2.5 py-1 text-white shadow-modal text-center whitespace-nowrap">
      <div class="text-[10px] font-semibold uppercase tracking-wide opacity-90">${total > 1 ? `Điểm đến chặng ${legIndex + 1}` : 'Điểm đến'}</div>
      <div class="text-xs font-bold">${escapeHtml(name)}</div>
    </div><div class="w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-rose-600"></div>`;
  return element;
};

/**
 * Vẽ phương án đang chọn của chặng đang xem: xe buýt / metro màu của tuyến, đi bộ (đường đi bộ thật) / gọi xe nét đứt;
 * nhãn trạm lên / xuống + nhãn điểm đến của chặng đang xem; tự căn bản đồ vừa chặng đó.
 * fetchRoadGeometry(from, to, vehicle) (tuỳ chọn): đường thật cho chặng đi bộ / gọi xe (Goong, có cache).
 */
export const useTransitJourneyLayer = (map, transit, { fetchRoadGeometry, activeLeg = 0, waypoints = [] } = {}) => {
  const options = useMemo(() => selectedOptions(transit), [transit]);
  const allLegs = useMemo(() => options.flatMap((option) => option.legs), [options]);
  const legIndex = Math.min(activeLeg, Math.max(0, options.length - 1));
  const [roadGeometry, setRoadGeometry] = useState({}); // "lng,lat>lng,lat" -> toạ độ đường thật

  // Đường thật cho chặng đi bộ (đường đi bộ OpenStreetMap — không vòng theo đường một chiều như xe máy)
  // và chặng gọi xe (Goong) của phương án đang xem; lần lượt, có giới hạn
  const activeLegs = options[legIndex]?.legs;
  useEffect(() => {
    if (!activeLegs?.length) return undefined;
    let active = true;
    const wanted = activeLegs.filter((leg) => !leg.route && leg.distance_m >= ROAD_GEOMETRY_MIN_M).slice(0, MAX_ROAD_REQUESTS);
    (async () => {
      for (const leg of wanted) {
        try {
          const result = leg.mode === 'walk' ? await getWalkPathApi(leg.from.coordinates, leg.to.coordinates) : await fetchRoadGeometry?.(leg.from.coordinates, leg.to.coordinates, 'bike');
          if (!active) return;
          if (result?.coordinates?.length > 1) setRoadGeometry((prev) => ({ ...prev, [roadKey(leg)]: result.coordinates }));
        } catch {
          // giữ đường thẳng
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [activeLegs, fetchRoadGeometry]);

  // Thêm lớp 1 lần khi có cách đi, gỡ khi thôi đi xe công cộng
  const hasLegs = allLegs.length > 0;
  useEffect(() => {
    if (!map || !hasLegs) return undefined;
    const add = () => !map.getSource(SOURCE) && addLayers(map);
    if (map.isStyleLoaded()) add();
    else map.once('load', add);
    return () => {
      map.off('load', add);
      removeLayers(map);
    };
  }, [map, hasLegs]);

  useEffect(() => {
    if (!map?.getSource(SOURCE)) return;
    // Chỉ vẽ phương án đang chọn của chặng đang xem (chặng khác / phương án khác không vẽ cho đỡ rối)
    map.getSource(SOURCE).setData({
      type: 'FeatureCollection',
      features: (activeLegs ?? []).map((leg) => ({
        type: 'Feature',
        properties: { color: legColor(leg), dashed: Boolean(legMode(leg.mode).dashed) },
        geometry: { type: 'LineString', coordinates: roadGeometry[roadKey(leg)] ?? leg.geometry },
      })),
    });
  }, [map, activeLegs, roadGeometry, hasLegs]);

  // Nhãn + căn bản đồ theo chặng đang xem
  const destination = waypoints[legIndex + 1];
  useEffect(() => {
    if (!map || !activeLegs?.length) return undefined;
    const markers = [];
    activeLegs.filter((leg) => leg.route).forEach((leg) => {
      markers.push(new Marker({ element: stopLabel(leg, 'board'), anchor: 'left', offset: [10, 0] }).setLngLat(leg.from.coordinates).addTo(map));
      markers.push(new Marker({ element: stopLabel(leg, 'alight'), anchor: 'right', offset: [-10, 0] }).setLngLat(leg.to.coordinates).addTo(map));
    });
    if (destination?.coordinates) {
      markers.push(new Marker({ element: destinationLabel(destination.name, legIndex, options.length), anchor: 'bottom', offset: [0, -PIN_HEIGHT_PX] }).setLngLat(destination.coordinates).addTo(map));
    }
    const points = activeLegs.flatMap((leg) => leg.geometry);
    if (points.length > 1) {
      const bounds = points.reduce((box, point) => box.extend(point), new LngLatBounds(points[0], points[0]));
      map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: 16, duration: 700 });
    }
    return () => markers.forEach((marker) => marker.remove());
  }, [map, activeLegs, destination, legIndex, options.length]);
};
