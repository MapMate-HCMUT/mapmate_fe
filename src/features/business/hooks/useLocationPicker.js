import { Marker } from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MAP_DEFAULT_CENTER, MAP_FOCUS_ZOOM } from '../../../config/map';
import { geocodeAddress, getStoredUserLocation, reverseGeocode, useMapInstance } from '../../map';

const GEOLOCATION_TIMEOUT_MS = 8000;

const createPinElement = () => {
  const element = document.createElement('div');
  element.className = 'cursor-grab active:cursor-grabbing';
  element.innerHTML = `
    <svg class="w-10 h-12 text-primary-600 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
    </svg>`;
  return element;
};

/**
 * Chọn vị trí cửa hàng trên bản đồ: bấm vào bản đồ / kéo ghim / "Vị trí của tôi" / tìm theo địa chỉ.
 * Mỗi lần đổi vị trí => hỏi Goong địa chỉ + quận để điền sẵn (chủ quán sửa lại được).
 * @param {{lat, lng} | null} value
 * @param {(picked: { coordinates: {lat, lng}, address: string|null, district: string|null }) => void} onPick
 */
export const useLocationPicker = (value, onPick) => {
  const { containerRef, map } = useMapInstance();
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  const [status, setStatus] = useState({ isLocating: false, isGeocoding: false, message: '' });
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  // Toạ độ mới => điền địa chỉ gợi ý (lỗi mạng / Goong bận thì vẫn giữ toạ độ, chủ quán tự gõ địa chỉ)
  const pick = useCallback(async ([lng, lat], known = null) => {
    onPickRef.current({ coordinates: { lat, lng }, address: known?.address ?? null, district: known?.district ?? null });
    if (known) return;
    setStatus((prev) => ({ ...prev, isGeocoding: true, message: '' }));
    try {
      const info = await reverseGeocode([lng, lat]);
      onPickRef.current({ coordinates: { lat, lng }, address: info?.address ?? null, district: info?.district ?? null });
    } catch {
      setStatus((prev) => ({ ...prev, message: 'Không lấy được địa chỉ tự động — bạn nhập địa chỉ bên dưới nhé' }));
    } finally {
      setStatus((prev) => ({ ...prev, isGeocoding: false }));
    }
  }, []);

  // Bản đồ sẵn sàng: mở ở vị trí đã chọn / vị trí gần nhất của người dùng; bấm vào bản đồ = đặt ghim
  useEffect(() => {
    if (!map) return undefined;
    const start = value ? [value.lng, value.lat] : getStoredUserLocation() ?? MAP_DEFAULT_CENTER;
    map.jumpTo({ center: start, zoom: MAP_FOCUS_ZOOM });
    map.getCanvas().style.cursor = 'crosshair';
    const handleClick = (event) => pick([event.lngLat.lng, event.lngLat.lat]);
    map.on('click', handleClick);
    return () => map.off('click', handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ căn bản đồ 1 lần khi vừa tải
  }, [map, pick]);

  // Ghim theo value (kéo được)
  useEffect(() => {
    if (!map) return;
    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new Marker({ element: createPinElement(), draggable: true, anchor: 'bottom' }).setLngLat([value.lng, value.lat]).addTo(map);
      markerRef.current.on('dragend', () => {
        const { lng, lat } = markerRef.current.getLngLat();
        pick([lng, lat]);
      });
    } else {
      markerRef.current.setLngLat([value.lng, value.lat]);
    }
  }, [map, value, pick]);

  useEffect(() => () => markerRef.current?.remove(), []);

  const flyTo = (coordinates) => map?.flyTo({ center: coordinates, zoom: Math.max(map.getZoom(), MAP_FOCUS_ZOOM) });

  const locateMe = () => {
    if (!navigator.geolocation) {
      setStatus((prev) => ({ ...prev, message: 'Trình duyệt không hỗ trợ lấy vị trí — bạn bấm chọn trên bản đồ nhé' }));
      return;
    }
    setStatus((prev) => ({ ...prev, isLocating: true, message: '' }));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setStatus((prev) => ({ ...prev, isLocating: false }));
        const coordinates = [coords.longitude, coords.latitude];
        flyTo(coordinates);
        pick(coordinates);
      },
      () => setStatus((prev) => ({ ...prev, isLocating: false, message: 'Không lấy được vị trí — hãy cho phép truy cập vị trí hoặc bấm chọn trên bản đồ' })),
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS },
    );
  };

  const searchAddress = async (text) => {
    if (!text.trim()) return;
    setStatus((prev) => ({ ...prev, isGeocoding: true, message: '' }));
    try {
      const found = await geocodeAddress(text.trim());
      if (!found) {
        setStatus((prev) => ({ ...prev, message: 'Không tìm thấy địa chỉ này — thử ghi rõ hơn hoặc bấm chọn trên bản đồ' }));
        return;
      }
      flyTo(found.coordinates);
      pick(found.coordinates, found);
    } catch {
      setStatus((prev) => ({ ...prev, message: 'Không tìm được địa chỉ lúc này — bạn bấm chọn trên bản đồ nhé' }));
    } finally {
      setStatus((prev) => ({ ...prev, isGeocoding: false }));
    }
  };

  return { containerRef, isMapReady: Boolean(map), status, locateMe, searchAddress };
};
