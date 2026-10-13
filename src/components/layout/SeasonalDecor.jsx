const PARTICLE_COUNT = { fall: 16, rise: 12, float: 8, sway: 8, twinkle: 16 };
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

// 1 hạt = icon lucide tô màu riêng (nét đậm + nền nhạt cùng màu cho dễ thấy trên cả nền sáng lẫn tối)
const ParticleIcon = ({ particle: [Icon, color], size }) => <Icon size={size} color={color} fill={color} fillOpacity={0.18} strokeWidth={2} />;

/** Lớp trang trí nằm SAU nội dung thanh điều hướng (không chặn bấm): hạt rơi / bay + dải màu mép dưới */
export const SeasonalParticles = ({ season }) => {
  const count = PARTICLE_COUNT[season.motion] ?? PARTICLE_COUNT.fall;
  return (
    <div className="seasonal-decor absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const style = particleStyle(season.motion, index, count);
        return (
          <span key={`${season.id}-${index}`} className={`absolute select-none leading-none opacity-80 ${index >= DESKTOP_ONLY_FROM ? 'hidden lg:block' : ''}`} style={style}>
            <ParticleIcon particle={season.particles[index % season.particles.length]} size={style.fontSize} />
          </span>
        );
      })}
      <div className={`absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r ${season.bar}`} />
    </div>
  );
};

// Icon cạnh lời chúc lấy màu của chính icon đó trong danh sách hạt (không có thì màu hạt đầu tiên)
const badgeColor = (season) => (season.particles.find(([Icon]) => Icon === season.icon) ?? season.particles[0])[1];

/** Lời chúc nhỏ cạnh logo (desktop) — người dùng không tắt được hiệu ứng (dev: ?season=off) */
export const SeasonalBadge = ({ season }) => (
  <span title={season.greeting} className="hidden xl:inline-flex min-w-0 items-center gap-1.5 px-2.5 py-1 rounded-pill bg-surface/85 backdrop-blur-sm border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-card">
    <season.icon className="w-3.5 h-3.5" color={badgeColor(season)} aria-hidden="true" />
    <span className="truncate max-w-52">{season.greeting}</span>
  </span>
);
