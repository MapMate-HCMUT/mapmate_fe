import { AttributionControl, Map as MapLibreMap, NavigationControl } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_PROVIDER,
  MAP_PROVIDERS,
  MAP_STYLE_URL,
  transformMapRequest,
} from '../../../config/map';
import { applyLocalNameLabels, collapseAttribution } from '../../../lib/maplibre';

// Khởi tạo 1 instance MapLibre gắn vào containerRef; trả về map khi style đã load xong.
export const useMapInstance = () => {
  const containerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const instance = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      transformRequest: transformMapRequest,
      attributionControl: false,
    });
    // Góc dưới dành cho Bottom Sheet / thẻ chi tiết nên đặt control ở phía trên.
    instance.addControl(new AttributionControl({ compact: true }), 'top-left');
    instance.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    instance.on('load', () => {
      if (MAP_PROVIDER === MAP_PROVIDERS.OPEN_FREE_MAP) applyLocalNameLabels(instance);
      collapseAttribution(instance);
      setMap(instance);
    });
    // Chỉ báo "không tải được bản đồ" khi bản đồ CHƯA từng tải xong; lỗi lẻ sau đó (1 ô bản đồ, 1 lớp dữ liệu) chỉ ghi log
    let hasLoaded = false;
    instance.once('load', () => (hasLoaded = true));
    instance.on('error', (event) => {
      if (!hasLoaded) setError(event.error?.message ?? 'Không tải được bản đồ');
      else console.warn('[map]', event.error?.message ?? event);
    });

    return () => instance.remove();
  }, []);

  return { containerRef, map, error };
};
