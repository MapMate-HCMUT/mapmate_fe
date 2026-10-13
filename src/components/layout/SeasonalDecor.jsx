import { X } from 'lucide-react';

const PARTICLE_COUNT = { fall: 16, rise: 12, float: 5, sway: 7, twinkle: 12 };
const DESKTOP_ONLY_FROM = 8; // điện thoại chỉ hiện 8 hạt đầu cho đỡ rối

// Số "ngẫu nhiên" cố định theo vị trí => mỗi lần vẽ lại hạt không nhảy chỗ
const seeded = (index, salt) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const particleStyle = (motion, index, count) => {
  const r1 = seeded(index, 1);
  const r2 = seeded(index, 2);
  const r3 = seeded(index, 3);
  const spread = ((index + r1 * 0.8) / count) * 100; // trải đều ngang thanh, lệch nhẹ
  const size = 12 + Math.round(r2 * 8);
  switch (motion) {
    case 'float':
      return { top: `${8 + r1 * 30}px`, left: 0, fontSize: size + 4, animation: `season-float ${16 + r2 * 10}s linear ${-r3 * 20}s infinite` };
    case 'sway':
      return { top: -2, left: `${spread}%`, fontSize: size + 6, animation: `season-sway ${2.6 + r2 * 1.6}s ease-in-out ${-r3 * 3}s infinite alternate` };
    case 'twinkle':
      return { top: `${6 + r1 * 34}px`, left: `${spread}%`, fontSize: size, animation: `season-twinkle ${2 + r2 * 2}s ease-in-out ${-r3 * 3}s infinite` };
    case 'rise':
      return { bottom: -24, left: `${spread}%`, fontSize: size, animation: `season-rise ${6 + r2 * 5}s linear ${-r3 * 10}s infinite` };
    default:
      return { top: -24, left: `${spread}%`, fontSize: size, animation: `season-fall ${7 + r2 * 6}s linear ${-r3 * 12}s infinite` };
  }
};

/** Lớp trang trí nằm SAU nội dung thanh điều hướng (không chặn bấm): hạt rơi / bay + dải màu mép dưới */
export const SeasonalParticles = ({ season }) => {
  const count = PARTICLE_COUNT[season.motion] ?? PARTICLE_COUNT.fall;
  return (
    <div className="seasonal-decor absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={`${season.id}-${index}`}
          className={`absolute select-none leading-none opacity-80 ${index >= DESKTOP_ONLY_FROM ? 'hidden lg:block' : ''}`}
          style={particleStyle(season.motion, index, count)}
        >
          {season.particles[index % season.particles.length]}
        </span>
      ))}
      <div className={`absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r ${season.bar}`} />
    </div>
  );
};

/** Lời chúc nhỏ cạnh logo (desktop) + nút tắt hiệu ứng của dịp này */
export const SeasonalBadge = ({ season, onHide }) => (
  <span title={season.greeting} className="hidden xl:inline-flex min-w-0 items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-pill bg-surface/85 backdrop-blur-sm border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-card">
    <span aria-hidden="true">{season.emoji}</span>
    <span className="truncate max-w-52">{season.greeting}</span>
    <button type="button" onClick={onHide} aria-label="Tắt hiệu ứng dịp lễ" title="Tắt hiệu ứng dịp lễ" className="p-0.5 rounded-pill text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
      <X className="w-3.5 h-3.5" />
    </button>
  </span>
);
