// Icon trên bản đồ (MapLibre cần ảnh): trạm buýt = ô vuông bo góc có hình xe buýt; ga metro / bến buýt sông = tròn có hình tàu.
// Hình vẽ từ bộ icon Lucide (giấy phép ISC): "bus", "train-front", "ship".
const BUS = [
  'M8 6v6', 'M15 6v6', 'M2 12h19.6',
  'M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3',
  'M9 18h5',
];
const BUS_WHEELS = '<circle cx="7" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>';
const TRAIN = ['M8 3.1V7a4 4 0 0 0 8 0V3.1', 'm9 15-1-1', 'm15 15 1-1', 'M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z', 'm8 19-2 3', 'm16 19 2 3'];
const SHIP = [
  'M12 2v2', 'M12 9.189V13', 'M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6',
  'M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76',
  'M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
];

export const TRANSIT_ICONS = { busStop: 'transit-bus-stop', metroStation: 'transit-metro-station', waterbusStop: 'transit-waterbus-stop' };
const PIXEL_RATIO = 2;

const glyph = (paths, color, transform, extra = '') =>
  `<g transform="${transform}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths.map((d) => `<path d="${d}"/>`).join('')}${extra}</g>`;

const busStop = (color) => `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <rect x="3" y="3" width="38" height="38" rx="10" fill="${color}" stroke="#ffffff" stroke-width="3"/>
  ${glyph(BUS, '#ffffff', 'translate(10 9) scale(1)', BUS_WHEELS)}
</svg>`;
const station = (color, paths) => `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
  <circle cx="26" cy="26" r="22" fill="${color}" stroke="#ffffff" stroke-width="4"/>
  ${glyph(paths, '#ffffff', 'translate(12 12) scale(1.17)')}
</svg>`;

const loadSvg = (svg) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

export const addTransitIcons = async (map) => {
  const icons = [
    [TRANSIT_ICONS.busStop, busStop('#0284c7')],
    [TRANSIT_ICONS.metroStation, station('#2563eb', TRAIN)],
    [TRANSIT_ICONS.waterbusStop, station('#0891b2', SHIP)],
  ];
  await Promise.all(
    icons.map(async ([name, svg]) => {
      const image = await loadSvg(svg);
      if (!map.hasImage(name)) map.addImage(name, image, { pixelRatio: PIXEL_RATIO });
    }),
  );
};
