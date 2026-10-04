// Cấu hình bản đồ.
// - Có VITE_GOONG_MAPTILES_KEY  => dùng Goong Maps (bản đồ thuần Việt, đúng định hướng dự án).
// - Chưa có key                => dùng OpenFreeMap (dữ liệu OpenStreetMap, miễn phí, không cần key).
// Cả hai đều là vector tiles chuẩn Mapbox Style Spec nên MapLibre GL hiển thị được mà không phải sửa code.

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;
export const GOONG_API_KEY =
  import.meta.env.VITE_GOONG_API_KEY || 'zCwHXMPzZXp3WGi4d17LBpjSOipKcUdV5jjCsDpC';

export const MAP_PROVIDERS = {
  GOONG: 'goong',
  OPEN_FREE_MAP: 'openfreemap',
};

export const MAP_PROVIDER = GOONG_MAPTILES_KEY ? MAP_PROVIDERS.GOONG : MAP_PROVIDERS.OPEN_FREE_MAP;

export const MAP_STYLE_URL =
  MAP_PROVIDER === MAP_PROVIDERS.GOONG
    ? `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`
    : 'https://tiles.openfreemap.org/styles/liberty';

// Goong yêu cầu api_key trên mọi request tile/sprite/glyph — tự động gắn vào.
export const transformMapRequest = (url) => {
  if (MAP_PROVIDER !== MAP_PROVIDERS.GOONG || !url.includes('goong.io') || url.includes('api_key=')) {
    return { url };
  }
  const separator = url.includes('?') ? '&' : '?';
  return { url: `${url}${separator}api_key=${GOONG_MAPTILES_KEY}` };
};

// Trung tâm Quận 1, TP.HCM — [kinh độ, vĩ độ]
export const MAP_DEFAULT_CENTER = [106.7009, 10.7769];
export const MAP_DEFAULT_ZOOM = 14;
export const MAP_FOCUS_ZOOM = 16;
