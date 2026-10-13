import { useEffect, useRef, useState } from 'react';
import { PLACE_PIN_LAYER, placePinAt } from '../utils/mapPoint';

const PLACE_PIN_SOURCE = 'mapmate-places';
const PIN_PIXEL_RATIO = 2;
const PIN_IMAGES = {
  normal: { name: 'mapmate-pin', fill: '#ea4335', stroke: '#b3261e' },
  selected: { name: 'mapmate-pin-selected', fill: '#2563eb', stroke: '#1e40af' },
};
const EMPTY = { type: 'FeatureCollection', features: [] };

// Ghim giọt nước (cùng dáng ghim mặc định của MapLibre), vẽ 2x cho màn hình nét
const pinSvg = ({ fill, stroke }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${27 * PIN_PIXEL_RATIO}" height="${41 * PIN_PIXEL_RATIO}" viewBox="-1 -1 29 43">` +
  `<ellipse cx="13.5" cy="40" rx="6" ry="1.6" fill="rgba(0,0,0,0.25)"/>` +
  `<path d="M13.5 0C6.04 0 0 6.04 0 13.5 0 23.6 13.5 40 13.5 40S27 23.6 27 13.5C27 6.04 20.96 0 13.5 0z" fill="${fill}" stroke="${stroke}" stroke-width="1"/>` +
  `<circle cx="13.5" cy="13.5" r="5" fill="#fff"/></svg>`;

const loadedPins = new Map(); // tên -> ảnh (tải 1 lần cho cả phiên)
const loadPinImages = () =>
  Promise.all(
    Object.values(PIN_IMAGES).map(
      (pin) =>
        loadedPins.get(pin.name) ??
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            loadedPins.set(pin.name, image);
            resolve(image);
          };
          image.onerror = reject;
          image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pinSvg(pin))}`;
        }),
    ),
  );

const toFeatures = (places, selectedPlaceId) => ({
  type: 'FeatureCollection',
  features: places
    .filter((place) => place.location?.coordinates)
    .map((place) => ({
      type: 'Feature',
      properties: { id: place.id, name: place.name, selected: place.id === selectedPlaceId },
      geometry: { type: 'Point', coordinates: place.location.coordinates },
    })),
});

/**
 * Ghim các địa điểm MapMate — vẽ bằng 1 lớp WebGL của bản đồ (không phải 40 phần tử HTML nổi) => kéo / phóng to mượt,
 * chọn quán chỉ đổi dữ liệu (không tạo lại ghim). Ghim đang chọn màu xanh, to hơn và nằm trên cùng.
 */
export const usePlacePins = (map, places, selectedPlaceId, onSelectPlace) => {
  const [isReady, setIsReady] = useState(false);
  const onSelectRef = useRef(onSelectPlace);
  useEffect(() => {
    onSelectRef.current = onSelectPlace;
  }, [onSelectPlace]);

  useEffect(() => {
    if (!map) return undefined;
    let isActive = true;
    loadPinImages()
      .then(() => {
        if (!isActive) return;
        Object.values(PIN_IMAGES).forEach((pin) => {
          if (!map.hasImage(pin.name)) map.addImage(pin.name, loadedPins.get(pin.name), { pixelRatio: PIN_PIXEL_RATIO });
        });
        if (!map.getSource(PLACE_PIN_SOURCE)) map.addSource(PLACE_PIN_SOURCE, { type: 'geojson', data: EMPTY });
        if (!map.getLayer(PLACE_PIN_LAYER)) {
          map.addLayer({
            id: PLACE_PIN_LAYER,
            type: 'symbol',
            source: PLACE_PIN_SOURCE,
            layout: {
              'icon-image': ['case', ['get', 'selected'], PIN_IMAGES.selected.name, PIN_IMAGES.normal.name],
              'icon-size': ['case', ['get', 'selected'], 1.15, 0.85],
              'icon-anchor': 'bottom',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'symbol-sort-key': ['case', ['get', 'selected'], 1, 0],
            },
          });
        }
        setIsReady(true);
      })
      .catch((error) => console.warn('[map] pins', error));

    // Bấm trúng ghim (lệch vài pixel vẫn tính) => mở thẻ địa điểm; bấm chỗ khác do trang chủ xử lý
    const onClick = (event) => {
      const pin = placePinAt(map, event.point);
      if (pin) onSelectRef.current?.(pin.id);
    };
    map.on('click', onClick);

    return () => {
      isActive = false;
      map.off('click', onClick);
      if (!map.style) return; // bản đồ đã bị gỡ
      if (map.getLayer(PLACE_PIN_LAYER)) map.removeLayer(PLACE_PIN_LAYER);
      if (map.getSource(PLACE_PIN_SOURCE)) map.removeSource(PLACE_PIN_SOURCE);
      setIsReady(false);
    };
  }, [map]);

  useEffect(() => {
    if (!isReady) return;
    map.getSource(PLACE_PIN_SOURCE)?.setData(toFeatures(places, selectedPlaceId));
  }, [isReady, map, places, selectedPlaceId]);
};
