import { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { loadBaseMapStyle, MAP_PERFORMANCE_OPTIONS, MAP_PROVIDER, MAP_PROVIDERS, transformMapRequest } from '../../../config/map';
import { buildThemedStyle } from '../../../lib/mapTheme';
import { useThemeStore } from '../../../stores/themeStore';
import { applyLocalNameLabels } from '../../../lib/maplibre';

// Trung tâm Quận 1 nhìn nghiêng — xoay chậm quanh 1 điểm nên gần như không tải thêm ô bản đồ
const BACKDROP_VIEW = { center: [106.7019, 10.7756], zoom: 14.6, pitch: 52, bearing: -20 };
const ROTATE_DEGREES = 40;
const ROTATE_MS = 40000;
const ATTRIBUTION = {
  [MAP_PROVIDERS.GOONG]: '© Goong · © OpenStreetMap',
  [MAP_PROVIDERS.OPEN_FREE_MAP]: '© OpenFreeMap · © OpenStreetMap',
};

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Nền trang đăng nhập: bản đồ TP.HCM thật, làm mờ + phủ màu để khung đăng nhập nổi lên trên.
 * Không nhận thao tác chuột; bản đồ lỗi / máy không hỗ trợ WebGL => chỉ còn nền màu, trang vẫn dùng bình thường.
 */
export const AuthMapBackdrop = () => {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let map = null;
    let isActive = true;
    loadBaseMapStyle()
      .then((baseStyle) => {
        if (!isActive) return;
        try {
          map = new MapLibreMap({
            container: containerRef.current,
            style: buildThemedStyle(baseStyle, useThemeStore.getState().theme),
            transformRequest: transformMapRequest,
            interactive: false,
            attributionControl: false,
            ...MAP_PERFORMANCE_OPTIONS,
            fadeDuration: 0,
            ...BACKDROP_VIEW,
          });
        } catch {
          return; // không có WebGL
        }
        const rotate = () => map.easeTo({ bearing: map.getBearing() + ROTATE_DEGREES, duration: ROTATE_MS, easing: (t) => t });
        map.once('load', () => {
          if (MAP_PROVIDER === MAP_PROVIDERS.OPEN_FREE_MAP) applyLocalNameLabels(map);
          setIsReady(true);
          if (prefersReducedMotion()) return;
          map.on('moveend', rotate);
          rotate();
        });
        map.on('error', (event) => console.warn('[auth-map]', event.error?.message ?? event));
      })
      .catch(() => {}); // không tải được bản đồ => chỉ còn nền màu
    return () => {
      isActive = false;
      map?.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* MapLibre ép phần tử bản đồ thành position: relative => bọc 1 lớp absolute bên ngoài */}
      <div className={`absolute -inset-8 blur-[3px] saturate-[1.15] transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        <div ref={containerRef} className="w-full h-full" />
      </div>
      {/* Phủ màu thương hiệu: tối dần về 2 mép để chữ trắng bên trái và khung đăng nhập bên phải đều dễ đọc */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#022c22]/85 via-[#064e3b]/45 to-[#042f2e]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(2_44_34/0.55)_100%)]" />
      <p className="absolute bottom-2 right-3 text-[10px] text-white/55">{ATTRIBUTION[MAP_PROVIDER]}</p>
    </div>
  );
};
