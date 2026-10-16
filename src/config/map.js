// Cấu hình bản đồ.
// - Có VITE_GOONG_MAPTILES_KEY  => dùng Goong Maps (bản đồ thuần Việt, đúng định hướng dự án).
// - Chưa có key                => dùng OpenFreeMap (dữ liệu OpenStreetMap, miễn phí, không cần key).
// Cả hai đều là vector tiles chuẩn Mapbox Style Spec nên MapLibre GL hiển thị được mà không phải sửa code.

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;
// Key Goong REST (tìm địa chỉ, chỉ đường) chỉ nằm ở backend — trình duyệt gọi qua /api/geo (features/map/api/goong*.js)

export const MAP_PROVIDERS = {
  GOONG: 'goong',
  OPEN_FREE_MAP: 'openfreemap',
};

export const MAP_PROVIDER = GOONG_MAPTILES_KEY ? MAP_PROVIDERS.GOONG : MAP_PROVIDERS.OPEN_FREE_MAP;

// Kiểu bản đồ gốc (nền sáng). Nền tối = cùng kiểu này, app tự tô lại màu (src/lib/mapTheme.js) => đổi nền tức thì.
const MAP_STYLE_URLS = {
  [MAP_PROVIDERS.GOONG]: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`,
  [MAP_PROVIDERS.OPEN_FREE_MAP]: 'https://tiles.openfreemap.org/styles/liberty',
};
export const MAP_STYLE_URL = MAP_STYLE_URLS[MAP_PROVIDER];

// Tải kiểu bản đồ 1 lần cho cả phiên (trang chủ, trang đăng nhập, chọn vị trí cửa hàng dùng chung); lỗi thì lần sau tải lại
let baseStylePromise = null;
export const loadBaseMapStyle = () => {
  baseStylePromise ??= fetch(MAP_STYLE_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`Không tải được kiểu bản đồ (${response.status})`);
      return response.json();
    })
    .catch((error) => {
      baseStylePromise = null;
      throw error;
    });
  return baseStylePromise;
};

// Tuỳ chọn MapLibre giúp bản đồ mượt hơn: màn hình siêu nét vẽ tối đa 2x, nhãn hiện nhanh, không tải lại tile hết hạn khi đang xem
export const MAP_PERFORMANCE_OPTIONS = {
  pixelRatio: Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, 2),
  fadeDuration: 120,
  refreshExpiredTiles: false,
};

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
