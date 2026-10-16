import {
  Apple,
  Award,
  Banknote,
  Bell,
  BookOpen,
  Candy,
  CandyCane,
  Cat,
  Cherry,
  Clock,
  Cloud,
  CloudMoon,
  Coins,
  Cookie,
  Crown,
  Flag,
  FlagTriangleRight,
  Flame,
  Flower,
  Flower2,
  Gem,
  Ghost,
  Gift,
  GraduationCap,
  Hammer,
  HardHat,
  Heart,
  HeartHandshake,
  LampCeiling,
  Landmark,
  Library,
  Mail,
  Medal,
  Moon,
  MoonStar,
  NotebookPen,
  PartyPopper,
  Pencil,
  Rabbit,
  Ribbon,
  Rocket,
  Ruler,
  Skull,
  Snowflake,
  Sparkle,
  Sparkles,
  Star,
  TreePine,
  WandSparkles,
  Wine,
} from 'lucide-react';

// Hiệu ứng thanh điều hướng theo dịp lễ (giờ máy người dùng). Mỗi dịp:
// - from / to: "MM-DD" hằng năm (qua năm mới được, VD 12-30 → 01-02), hoặc `byYear` cho lễ âm lịch (Tết, Trung thu)
// - icon: icon lucide cạnh lời chúc; particles: [Icon lucide, màu] rơi / bay trên thanh (lặp lại nếu cần nhiều hạt hơn); motion: fall (rơi) | float (trôi dọc chậm, khựng nhẹ giữa chừng) | sway (treo đung đưa) | rise (bay lên) | twinkle (lấp lánh)
// - bar: dải màu mảnh ở mép dưới thanh điều hướng
// - tuỳ chọn: particleCount { desktop, mobile } / particleOpacity / speed (>1 = chậm hơn) — mặc định theo kiểu chuyển động;
//   logoAccent ('witch-hat') đội lên logo; corner ('spider-web') trang trí góc phải; badgeEmoji + badgeTone cho lời chúc;
//   actions: [{ emoji, label, hint, search | ask }] — bấm lời chúc => menu khám phá theo dịp (Khám phá / AI Gợi ý)
// Xem thử 1 dịp bất kỳ: thêm ?season=<id> vào URL (VD ?season=christmas). Người dùng không tắt được hiệu ứng;
// khi chạy dev (npm run dev) thêm ?season=off để tắt hẳn trong phiên làm việc (xem src/hooks/useSeason.js).
export const SEASONS = [
  {
    id: 'new-year',
    greeting: 'Chúc mừng năm mới!',
    icon: PartyPopper,
    from: '12-29',
    to: '01-02',
    particles: [
      [PartyPopper, '#f59e0b'], [Sparkles, '#eab308'], [Rocket, '#ef4444'], [Star, '#facc15'],
      [Gift, '#ec4899'], [Wine, '#a855f7'], [Clock, '#3b82f6'], [Sparkle, '#06b6d4'],
    ],
    motion: 'fall',
    bar: 'from-accent-400 via-danger-400 to-info-400',
  },
  {
    id: 'tet',
    greeting: 'Chúc mừng năm mới — Vạn sự như ý!',
    icon: Flower,
    // Mùng 1 Tết: 17/02/2026, 06/02/2027, 26/01/2028 — hiện từ ~1 tuần trước tới mùng 7
    byYear: { 2026: ['02-10', '02-24'], 2027: ['01-30', '02-13'], 2028: ['01-19', '02-02'] },
    particles: [
      [Flower, '#f59e0b'], [Flower2, '#f472b6'], [Cherry, '#ef4444'], [Coins, '#eab308'],
      [Mail, '#dc2626'], [LampCeiling, '#ef4444'], [Banknote, '#16a34a'], [Sparkles, '#f59e0b'],
    ],
    motion: 'fall',
    bar: 'from-danger-500 via-accent-400 to-danger-500',
  },
  {
    id: 'valentine',
    greeting: 'Happy Valentine!',
    icon: Heart,
    from: '02-13',
    to: '02-14',
    particles: [
      [Heart, '#f43f5e'], [HeartHandshake, '#ec4899'], [Gift, '#e11d48'], [Candy, '#f472b6'],
      [Flower2, '#ec4899'], [Mail, '#f43f5e'], [Gem, '#a855f7'], [Sparkles, '#fb7185'],
    ],
    motion: 'rise',
    bar: 'from-rose-400 via-pink-500 to-rose-400',
  },
  {
    id: 'reunification',
    greeting: 'Mừng ngày Thống nhất 30/4 & Quốc tế Lao động 1/5',
    icon: Flag,
    from: '04-28',
    to: '05-01',
    particles: [
      [Star, '#facc15'], [Flag, '#dc2626'], [FlagTriangleRight, '#ef4444'], [Medal, '#f59e0b'],
      [Landmark, '#dc2626'], [Hammer, '#f97316'], [HardHat, '#eab308'], [Sparkles, '#facc15'],
    ],
    motion: 'twinkle',
    bar: 'from-danger-600 via-accent-400 to-danger-600',
  },
  {
    id: 'national-day',
    greeting: 'Mừng Quốc khánh 2/9',
    icon: Flag,
    from: '08-29',
    to: '09-03',
    particles: [
      [Star, '#facc15'], [Flag, '#dc2626'], [FlagTriangleRight, '#ef4444'], [Medal, '#f59e0b'],
      [Landmark, '#dc2626'], [Award, '#eab308'], [PartyPopper, '#ef4444'], [Sparkles, '#facc15'],
    ],
    motion: 'twinkle',
    bar: 'from-danger-600 via-accent-400 to-danger-600',
  },
  {
    id: 'mid-autumn',
    greeting: 'Trung thu vui vẻ, đoàn viên!',
    icon: MoonStar,
    // Rằm tháng Tám: 25/09/2026, 15/09/2027, 03/10/2028
    byYear: { 2026: ['09-20', '09-26'], 2027: ['09-10', '09-16'], 2028: ['09-28', '10-04'] },
    particles: [
      [LampCeiling, '#ef4444'], [Moon, '#facc15'], [MoonStar, '#f59e0b'], [Star, '#fde047'],
      [Rabbit, '#94a3b8'], [Cookie, '#d97706'], [Cloud, '#93c5fd'], [LampCeiling, '#f97316'],
    ],
    motion: 'sway',
    bar: 'from-danger-500 via-accent-400 to-warning-500',
  },
  {
    id: 'women-day',
    greeting: 'Mừng ngày Phụ nữ Việt Nam 20/10',
    icon: Flower2,
    from: '10-18',
    to: '10-20',
    particles: [
      [Flower, '#f43f5e'], [Flower2, '#ec4899'], [Heart, '#e11d48'], [Gift, '#db2777'],
      [Gem, '#a855f7'], [Crown, '#f59e0b'], [Ribbon, '#ec4899'], [Sparkles, '#f472b6'],
    ],
    motion: 'fall',
    bar: 'from-rose-400 via-pink-400 to-violet-400',
  },
  {
    id: 'halloween',
    greeting: 'Happy Halloween!',
    icon: Ghost,
    badgeEmoji: '🎃',
    from: '10-13',
    to: '11-01',
    // Màu nhạt + ít hạt + rơi chậm: tạo không khí, chữ trên thanh vẫn nổi
    particles: [
      [Ghost, '#c4b5fd'], [Candy, '#fdba74'], [MoonStar, '#fcd34d'], [Skull, '#cbd5e1'],
      [Flame, '#fdba74'], [WandSparkles, '#d8b4fe'], [CloudMoon, '#c4b5fd'], [Cat, '#cbd5e1'],
    ],
    particleCount: { desktop: 5, mobile: 3 },
    particleOpacity: 0.7,
    speed: 1.7,
    motion: 'float',
    bar: 'from-orange-400 via-violet-500 to-orange-400',
    logoAccent: 'witch-hat',
    corner: 'spider-web',
    badgeTone: 'border-warning-200 bg-warning-50 text-warning-800 select-none cursor-default',
  },
  {
    id: 'teacher-day',
    greeting: 'Tri ân thầy cô 20/11',
    icon: GraduationCap,
    from: '11-18',
    to: '11-20',
    particles: [
      [BookOpen, '#3b82f6'], [GraduationCap, '#0ea5e9'], [Pencil, '#f59e0b'], [Flower2, '#ec4899'],
      [Apple, '#ef4444'], [NotebookPen, '#10b981'], [Library, '#6366f1'], [Ruler, '#f97316'],
    ],
    motion: 'fall',
    bar: 'from-info-400 via-primary-400 to-accent-400',
  },
  {
    id: 'christmas',
    greeting: 'Giáng sinh an lành!',
    icon: TreePine,
    from: '12-15',
    to: '12-26',
    particles: [
      [Snowflake, '#60a5fa'], [TreePine, '#16a34a'], [Gift, '#dc2626'], [Bell, '#f59e0b'],
      [Star, '#facc15'], [CandyCane, '#ef4444'], [Cookie, '#d97706'], [Snowflake, '#93c5fd'],
    ],
    motion: 'fall',
    bar: 'from-danger-500 via-success-500 to-danger-500',
  },
];

const monthDay = (date) => `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// "MM-DD" so sánh được như chuỗi; from > to = khoảng qua năm mới
const inRange = (today, from, to) => (from <= to ? today >= from && today <= to : today >= from || today <= to);

/** Dịp lễ đang diễn ra hôm nay (null nếu không có) */
export const getActiveSeason = (date = new Date()) => {
  const today = monthDay(date);
  return (
    SEASONS.find((season) => {
      const range = season.byYear ? season.byYear[date.getFullYear()] : [season.from, season.to];
      return range && inRange(today, range[0], range[1]);
    }) ?? null
  );
};

export const getSeasonById = (id) => SEASONS.find((season) => season.id === id) ?? null;
