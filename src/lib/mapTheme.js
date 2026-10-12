// Tô màu bản đồ nền theo nền sáng / tối của app — dùng 1 kiểu bản đồ gốc (Goong goong_map_web / OpenFreeMap liberty),
// chỉ đổi màu => đổi nền là tức thì (không tải lại kiểu bản đồ, không tải lại tile, các lớp app vẽ thêm vẫn giữ nguyên).
// - Lớp quen thuộc của Goong (nền, nước, công viên, đường, nhà, chữ) => bảng màu thiết kế sẵn
// - Lớp còn lại / kiểu OpenFreeMap => tự chuyển màu: nền tối dần, chữ sáng lên (giữ sắc độ gốc)
// Bỏ bớt lớp nặng mà ít giá trị khi xem quán: nhà 3D, bóng viền mặt nước, icon cây.

const PRUNED_LAYER_IDS = new Set(['water-shadow', 'poi-tree']);
const PRUNED_LAYER_TYPES = new Set(['fill-extrusion']);

/* ── Màu: chuỗi CSS <-> OKLab (đổi độ sáng mà không lệch màu) ── */
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const parseColor = (input) => {
  if (typeof input !== 'string') return null;
  const value = input.trim().toLowerCase();
  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((char) => char + char).join('');
    if (hex.length !== 6 && hex.length !== 8) return null;
    const int = (from) => parseInt(hex.slice(from, from + 2), 16);
    return { r: int(0), g: int(2), b: int(4), a: hex.length === 8 ? int(6) / 255 : 1 };
  }
  const match = value.match(/^(rgba?|hsla?)\(([^)]+)\)$/);
  if (!match) return null;
  const parts = match[2].split(/[\s,/]+/).filter(Boolean).map((part) => parseFloat(part));
  const alpha = parts[3] ?? 1;
  if (match[1].startsWith('rgb')) return { r: parts[0], g: parts[1], b: parts[2], a: alpha };
  // hsl -> rgb
  const [h, s, l] = [parts[0] / 360, parts[1] / 100, parts[2] / 100];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return { r: hue(h + 1 / 3) * 255, g: hue(h) * 255, b: hue(h - 1 / 3) * 255, a: alpha };
};

const toLinear = (channel) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (c) => 255 * clamp(c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

const toOklab = ({ r, g, b }) => {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    A: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    B: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
};
const fromOklab = ({ L, A, B }) => {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
};
const formatColor = ({ r, g, b }, alpha) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+alpha.toFixed(3)})`;

// Chuyển 1 màu sang nền tối: mặt (nền, đường, vùng) tối đi, chữ / icon sáng lên, viền chữ thành màu nền
const darkenSurface = (color) => {
  const lab = toOklab(color);
  return formatColor(fromOklab({ L: 0.2 + (1 - lab.L) * 0.28, A: lab.A * 0.55, B: lab.B * 0.55 }), color.a);
};
const lightenText = (color) => {
  const lab = toOklab(color);
  return formatColor(fromOklab({ L: clamp(1.12 - lab.L, 0.74, 0.9), A: lab.A * 0.8, B: lab.B * 0.8 }), color.a);
};

/* ── Bảng màu thiết kế cho các lớp của Goong ── */
const PALETTES = {
  light: {
    background: '#F2F4F3',
    landHuman: '#F4F5F3',
    green: '#D4EEDC',
    forest: '#C6E8D0',
    park: '#CDEBD5',
    parkOutline: '#B9E0C5',
    water: '#A9D6F2',
    waterLine: '#6AAFE0',
    waterText: '#2F6F9F',
    road: '#FFFFFF',
    roadCase: '#D5DCE4',
    major: '#FDE4A6',
    majorCase: '#E4BF6E',
    building: '#E2E3E8',
    placeText: '#334155',
    roadText: '#5B6573',
    poiText: '#2C6FB7',
    halo: '#FFFFFF',
  },
  dark: {
    background: '#121A27',
    landHuman: '#151E2C',
    green: '#15271F',
    forest: '#162E21',
    park: '#173224',
    parkOutline: '#1F3E2C',
    water: '#1E4162',
    waterLine: '#3F78A6',
    waterText: '#8EC3EA',
    road: '#2A3445',
    roadCase: '#192130',
    major: '#5A4C2D',
    majorCase: '#2C271D',
    building: '#1C2534',
    placeText: '#D5DDE8',
    roadText: '#9AA6B6',
    poiText: '#7DB7F2',
    halo: '#121A27',
  },
};

const isMajorRoad = (id) => /trunk|motorway/.test(id);

// Màu thiết kế sẵn cho 1 lớp (null = lớp lạ => dùng màu gốc / tự chuyển màu)
const designedPaint = (layer, p) => {
  const { id, type } = layer;
  if (type === 'background') return { 'background-color': p.background };
  if (id === 'landcover-human-made') return { 'fill-color': p.landHuman };
  if (id === 'landuse-forest') return { 'fill-color': p.forest };
  if (['landcover-natural', 'landuser-grass', 'landuse-pitch', 'landuse-stadium-area'].includes(id)) return { 'fill-color': p.green };
  if (id === 'park' || id === 'landuser-park') return { 'fill-color': p.park };
  if (id === 'park-outline') return { 'line-color': p.parkOutline };
  if (id === 'water' || id === 'ocean') return { 'fill-color': p.water };
  if (id === 'ferry') return { 'line-color': p.waterLine };
  if (id === 'building_flat') return { 'fill-color': p.building };
  if (type === 'line' && /^(road|tunnel|bridge)-/.test(id)) {
    if (id.endsWith('-case')) return { 'line-color': isMajorRoad(id) ? p.majorCase : p.roadCase };
    return { 'line-color': isMajorRoad(id) ? p.major : p.road };
  }
  if (type === 'symbol' && !/^(highway-shield|road-oneway)/.test(id)) {
    const textColor = /^(river|lake)-name/.test(id) ? p.waterText : id.startsWith('highway-name') ? p.roadText : id.startsWith('poi') ? p.poiText : p.placeText;
    return { 'text-color': textColor, 'text-halo-color': p.halo };
  }
  return null;
};

const COLOR_PROPS = /color$/;
const TEXT_PROPS = new Set(['text-color', 'icon-color']);
const HALO_PROPS = new Set(['text-halo-color', 'icon-halo-color']);

// Đi qua cả biểu thức (stops / interpolate / match...) để đổi mọi chuỗi màu bên trong
const mapColors = (value, convert) => {
  if (typeof value === 'string') {
    const color = parseColor(value);
    return color ? convert(color) : value;
  }
  if (Array.isArray(value)) return value.map((item) => mapColors(item, convert));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapColors(item, convert)]));
  return value;
};

/** Màu cho từng thuộc tính màu của 1 lớp ở nền `theme` — tính từ lớp gốc (chưa đổi màu) */
const themedPaint = (layer, theme) => {
  const palette = PALETTES[theme === 'dark' ? 'dark' : 'light'];
  const designed = designedPaint(layer, palette) ?? {};
  const paint = {};
  Object.entries(layer.paint ?? {}).forEach(([prop, value]) => {
    if (!COLOR_PROPS.test(prop)) return;
    if (prop in designed) return;
    if (theme !== 'dark') paint[prop] = value;
    else if (HALO_PROPS.has(prop)) paint[prop] = mapColors(value, (color) => formatColor(parseColor(palette.halo), color.a));
    else paint[prop] = mapColors(value, TEXT_PROPS.has(prop) ? lightenText : darkenSurface);
  });
  return { ...paint, ...designed };
};

const isPruned = (layer) => PRUNED_LAYER_IDS.has(layer.id) || PRUNED_LAYER_TYPES.has(layer.type);

/** Kiểu bản đồ gốc -> kiểu đã bỏ lớp nặng + tô màu theo nền (dùng khi tạo bản đồ => không nháy màu) */
export const buildThemedStyle = (baseStyle, theme) => ({
  ...baseStyle,
  layers: baseStyle.layers.filter((layer) => !isPruned(layer)).map((layer) => ({ ...layer, paint: { ...layer.paint, ...themedPaint(layer, theme) } })),
});

/** Đổi màu bản đồ đang hiện sang nền `theme` (chỉ đổi màu từng lớp nền, không tải lại gì) */
export const applyMapTheme = (map, baseStyle, theme) => {
  baseStyle.layers.forEach((layer) => {
    if (isPruned(layer) || !map.getLayer(layer.id)) return;
    Object.entries(themedPaint(layer, theme)).forEach(([prop, value]) => map.setPaintProperty(layer.id, prop, value));
  });
};
