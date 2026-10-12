import { AttributionControl, Map as MapLibreMap, NavigationControl } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import {
  loadBaseMapStyle,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_PERFORMANCE_OPTIONS,
  MAP_PROVIDER,
  MAP_PROVIDERS,
  transformMapRequest,
} from '../../../config/map';
import { applyLocalNameLabels, collapseAttribution } from '../../../lib/maplibre';
import { applyMapTheme, buildThemedStyle } from '../../../lib/mapTheme';
import { useThemeStore } from '../../../stores/themeStore';
import { ERROR_KINDS } from '../../../utils/errorMessages';

const MAP_LOAD_GRACE_MS = 10000; // lỗi lẻ lúc đang tải (1 ô bản đồ, 1 font) thường tự hết — quá 10 giây vẫn chưa có bản đồ mới tính là hỏng

// Khởi tạo 1 instance MapLibre gắn vào containerRef; trả về map khi style đã load xong.
// Bản đồ không tải được => onFatalError (chuyển sang trang lỗi "Không tải được bản đồ").
// Màu bản đồ đi theo nền sáng / tối của app: tạo bản đồ đã đúng màu, đổi nền thì chỉ tô lại màu (không tải lại).
export const useMapInstance = (onFatalError) => {
  const containerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const theme = useThemeStore((state) => state.theme);
  const baseStyleRef = useRef(null);
  const onFatalErrorRef = useRef(onFatalError);
  useEffect(() => {
    onFatalErrorRef.current = onFatalError;
  }, [onFatalError]);

  useEffect(() => {
    let instance = null;
    let isActive = true;
    let fatalTimer = null;
    const fail = () => {
      setError('map');
      onFatalErrorRef.current?.({ kind: ERROR_KINDS.MAP });
    };

    loadBaseMapStyle()
      .then((baseStyle) => {
        if (!isActive) return;
        baseStyleRef.current = baseStyle;
        instance = new MapLibreMap({
          container: containerRef.current,
          style: buildThemedStyle(baseStyle, useThemeStore.getState().theme),
          center: MAP_DEFAULT_CENTER,
          zoom: MAP_DEFAULT_ZOOM,
          transformRequest: transformMapRequest,
          attributionControl: false,
          ...MAP_PERFORMANCE_OPTIONS,
        });
        // Góc dưới dành cho Bottom Sheet / thẻ chi tiết nên đặt control ở phía trên.
        instance.addControl(new AttributionControl({ compact: true }), 'top-left');
        instance.addControl(new NavigationControl({ showCompass: false }), 'top-right');
        // Chỉ báo "không tải được bản đồ" khi bản đồ CHƯA từng tải xong; lỗi lẻ sau đó (1 ô bản đồ, 1 lớp dữ liệu) chỉ ghi log
        let hasLoaded = false;
        instance.once('load', () => {
          hasLoaded = true;
          clearTimeout(fatalTimer);
          if (MAP_PROVIDER === MAP_PROVIDERS.OPEN_FREE_MAP) applyLocalNameLabels(instance);
          collapseAttribution(instance);
          // Lỡ đổi nền trong lúc bản đồ đang tải => tô lại cho khớp
          applyMapTheme(instance, baseStyle, useThemeStore.getState().theme);
          setMap(instance);
        });
        instance.on('error', (event) => {
          console.warn('[map]', event.error?.message ?? event);
          if (hasLoaded || fatalTimer) return;
          fatalTimer = setTimeout(() => !hasLoaded && fail(), MAP_LOAD_GRACE_MS);
        });
      })
      .catch((loadError) => {
        console.warn('[map]', loadError.message);
        if (isActive) fail();
      });

    return () => {
      isActive = false;
      clearTimeout(fatalTimer);
      instance?.remove();
    };
  }, []);

  // Đổi nền sáng / tối => chỉ tô lại màu các lớp nền (tức thì, giữ nguyên tuyến buýt / đường đi / ghim đang vẽ)
  useEffect(() => {
    if (map && baseStyleRef.current) applyMapTheme(map, baseStyleRef.current, theme);
  }, [map, theme]);

  return { containerRef, map, error };
};
