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
import { ERROR_KINDS } from '../../../utils/errorMessages';

const MAP_LOAD_GRACE_MS = 10000; // lỗi lẻ lúc đang tải (1 ô bản đồ, 1 font) thường tự hết — quá 10 giây vẫn chưa có bản đồ mới tính là hỏng

// Khởi tạo 1 instance MapLibre gắn vào containerRef; trả về map khi style đã load xong.
// Bản đồ không tải được => onFatalError (chuyển sang trang lỗi "Không tải được bản đồ").
export const useMapInstance = (onFatalError) => {
  const containerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const onFatalErrorRef = useRef(onFatalError);
  useEffect(() => {
    onFatalErrorRef.current = onFatalError;
  }, [onFatalError]);

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
    let fatalTimer = null;
    instance.once('load', () => {
      hasLoaded = true;
      clearTimeout(fatalTimer);
    });
    instance.on('error', (event) => {
      console.warn('[map]', event.error?.message ?? event);
      if (hasLoaded || fatalTimer) return;
      fatalTimer = setTimeout(() => {
        if (hasLoaded) return;
        setError('map');
        onFatalErrorRef.current?.({ kind: ERROR_KINDS.MAP });
      }, MAP_LOAD_GRACE_MS);
    });

    return () => {
      clearTimeout(fatalTimer);
      instance.remove();
    };
  }, []);

  return { containerRef, map, error };
};
