import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useSearchStore } from '../../stores/searchStore';

const PARTICLE_COUNT = { fall: 16, rise: 12, float: 8, sway: 8, twinkle: 16 };
const MOBILE_PARTICLES = 8; // điện thoại hiện ít hạt hơn cho đỡ rối

// Số "ngẫu nhiên" cố định theo vị trí => mỗi lần vẽ lại hạt không nhảy chỗ
const seeded = (index, salt) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

// Vị trí ngang của từng hạt: các hạt hiện trên điện thoại (đứng đầu) vẫn trải đều cả thanh, không dồn sang trái
const slotOrder = (count, mobile) => {
  if (mobile >= count || mobile < 2) return Array.from({ length: count }, (_, index) => index);
  const first = Array.from({ length: mobile }, (_, index) => Math.round((index * (count - 1)) / (mobile - 1)));
  return [...first, ...Array.from({ length: count }, (_, index) => index).filter((slot) => !first.includes(slot))];
};

const particleStyle = (motion, index, slot, count, speed) => {
  const r1 = seeded(index, 1);
  const r2 = seeded(index, 2);
  const r3 = seeded(index, 3);
  const spread = ((slot + 0.1 + r1 * 0.8) / count) * 100; // trải đều ngang thanh, lệch nhẹ
  const size = 12 + Math.round(r2 * 8);
  const duration = (base, range) => (base + r2 * range) * speed;
  switch (motion) {
    case 'float':
      return { top: -26, left: `${spread}%`, fontSize: size + 4, animation: `season-float ${duration(9, 6)}s ease-in-out ${-r3 * 15 * speed}s infinite` };
    case 'sway':
      return { top: -2, left: `${spread}%`, fontSize: size + 6, animation: `season-sway ${duration(2.6, 1.6)}s ease-in-out ${-r3 * 3}s infinite alternate` };
    case 'twinkle':
      return { top: `${6 + r1 * 34}px`, left: `${spread}%`, fontSize: size, animation: `season-twinkle ${duration(2, 2)}s ease-in-out ${-r3 * 3}s infinite` };
    case 'rise':
      return { bottom: -24, left: `${spread}%`, fontSize: size, animation: `season-rise ${duration(6, 5)}s linear ${-r3 * 10 * speed}s infinite` };
    default:
      return { top: -24, left: `${spread}%`, fontSize: size, animation: `season-fall ${duration(7, 6)}s linear ${-r3 * 12 * speed}s infinite` };
  }
};

// 1 hạt = icon lucide tô màu riêng (nét đậm + nền nhạt cùng màu cho dễ thấy trên cả nền sáng lẫn tối)
const ParticleIcon = ({ particle: [Icon, color], size, opacity }) => (
  <Icon size={size} color={color} fill={color} fillOpacity={0.18} strokeWidth={2} style={{ opacity }} />
);

// Mạng nhện nhỏ ở góc phải (Halloween) — nằm sau nội dung, mờ, không che chuông / avatar
const SpiderWeb = () => (
  <svg viewBox="0 0 48 48" className="absolute top-0 right-0 w-11 h-11 text-neutral-400 opacity-60" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
    <path d="M48 0 L4 0 M48 0 L12 22 M48 0 L26 38 M48 0 L48 44" />
    <path d="M38 0 Q38.5 6 43 8.5 Q45.5 9.5 48 9" />
    <path d="M28 0 Q29 10 35.5 15 Q41 19 48 19" />
    <path d="M17 0 Q19 14 27.5 22 Q36 29.5 48 29" />
    <path d="M44 9 L44 14" strokeWidth="0.6" />
    <circle cx="44" cy="15.5" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

const CORNERS = { 'spider-web': SpiderWeb };

/** Lớp trang trí nằm SAU nội dung thanh điều hướng (không chặn bấm): hạt rơi / bay + trang trí góc + dải màu mép dưới */
export const SeasonalParticles = ({ season }) => {
  const desktop = season.particleCount?.desktop ?? PARTICLE_COUNT[season.motion] ?? PARTICLE_COUNT.fall;
  const mobile = season.particleCount?.mobile ?? MOBILE_PARTICLES;
  const slots = slotOrder(desktop, mobile);
  const Corner = CORNERS[season.corner];
  return (
    <div className="seasonal-decor absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: desktop }, (_, index) => {
        const style = particleStyle(season.motion, index, slots[index], desktop, season.speed ?? 1);
        return (
          <span key={`${season.id}-${index}`} className={`absolute select-none leading-none ${index >= mobile ? 'hidden lg:block' : ''}`} style={style}>
            <ParticleIcon particle={season.particles[index % season.particles.length]} size={style.fontSize} opacity={season.particleOpacity ?? 0.8} />
          </span>
        );
      })}
      {Corner && <Corner />}
      <div className={`absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r ${season.bar}`} />
    </div>
  );
};

// Mũ phù thủy nhỏ đội lệch trên logo (Halloween) — điểm nhấn cố định, dễ nhận ra
const WitchHat = ({ className }) => (
  <svg viewBox="0 0 34 30" className={className} aria-hidden="true">
    <path d="M6 23 L19 2 Q21 -0.5 22.5 3 L26 19 Z" fill="#7c3aed" />
    <path d="M19.5 4 L24 3.2" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8.6 18.8 L25 15.5 L25.8 19.4 L9.4 22.6 Z" fill="#fb923c" />
    <ellipse cx="17" cy="24" rx="16" ry="4.2" fill="#6d28d9" />
    <path d="M14.5 10.5 l0.9 1.9 2 0.3 -1.5 1.4 0.4 2 -1.8 -1 -1.8 1 0.4 -2 -1.5 -1.4 2 -0.3 Z" fill="#fde68a" />
  </svg>
);

const LOGO_ACCENTS = { 'witch-hat': WitchHat };

/** Phụ kiện dịp lễ đội lên logo — đặt trong 1 khung `relative` bọc logo */
export const SeasonalLogoAccent = ({ season, size = 'md' }) => {
  const Accent = LOGO_ACCENTS[season?.logoAccent];
  if (!Accent) return null;
  const position = size === 'sm' ? 'w-[22px] -top-[11px] -left-[5px]' : 'w-[27px] -top-[13px] -left-[6px]';
  return <Accent className={`pointer-events-none absolute ${position} -rotate-[18deg] drop-shadow-sm`} />;
};

// Icon cạnh lời chúc lấy màu của chính icon đó trong danh sách hạt (không có thì màu hạt đầu tiên)
const badgeColor = (season) => (season.particles.find(([Icon]) => Icon === season.icon) ?? season.particles[0])[1];
const BADGE_NEUTRAL = 'border-neutral-200 bg-surface/85 text-neutral-700 hover:bg-neutral-100';

const BadgeMark = ({ season }) =>
  season.badgeEmoji ? <span className="text-sm leading-none" aria-hidden="true">{season.badgeEmoji}</span> : <season.icon className="w-3.5 h-3.5" color={badgeColor(season)} aria-hidden="true" />;

/**
 * Lời chúc cạnh logo — người dùng không tắt được hiệu ứng (dev: ?season=off). Dịp có `actions` => bấm mở menu khám phá
 * (địa điểm / lộ trình theo dịp lễ). compact = chỉ biểu tượng (màn hẹp).
 */
export const SeasonalBadge = ({ season, compact = false, className = '' }) => {
  const { isOpen, toggle, close, containerRef } = useDisclosure();
  const navigate = useNavigate();
  const setQuery = useSearchStore((state) => state.setQuery);
  const actions = season.actions ?? [];
  const tone = season.badgeTone ?? BADGE_NEUTRAL;
  const shape = `inline-flex min-w-0 items-center gap-1.5 rounded-pill border backdrop-blur-sm text-xs font-semibold shadow-card transition ${tone} ${compact ? 'p-1.5' : 'px-2.5 py-1'}`;
  const label = <>{!compact && <span className="truncate max-w-52">{season.greeting}</span>}</>;

  if (!actions.length) {
    return (
      <div className={className}>
        <span title={season.greeting} className={shape}>
          <BadgeMark season={season} />
          {label}
        </span>
      </div>
    );
  }
  const run = (action) => {
    close();
    if (action.search) {
      setQuery(action.search);
      navigate('/');
    } else if (action.ask) navigate(`/ai-planner?ask=${encodeURIComponent(action.ask)}`);
  };
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button type="button" onClick={toggle} aria-expanded={isOpen} aria-haspopup="menu" title={`${season.greeting} — bấm để khám phá`} className={shape}>
        <BadgeMark season={season} />
        {label}
        {!compact && <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />}
      </button>
      {isOpen && (
        <div role="menu" className="absolute left-0 top-full mt-2 w-72 rounded-card border border-neutral-200 bg-surface p-1.5 shadow-modal z-50 animate-[toast-in_160ms_ease-out]">
          {actions.map((action) => (
            <button key={action.label} type="button" role="menuitem" onClick={() => run(action)} className="w-full flex items-start gap-2.5 rounded-input px-2.5 py-2 text-left hover:bg-warning-50 transition">
              <span className="text-lg leading-6" aria-hidden="true">{action.emoji}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-neutral-900">{action.label}</span>
                {action.hint && <span className="block text-xs text-neutral-500">{action.hint}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
