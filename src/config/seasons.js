// Hiệu ứng thanh điều hướng theo dịp lễ (giờ máy người dùng). Mỗi dịp:
// - from / to: "MM-DD" hằng năm (qua năm mới được, VD 12-30 → 01-02), hoặc `byYear` cho lễ âm lịch (Tết, Trung thu)
// - particles: biểu tượng rơi / bay trên thanh; motion: fall (rơi) | float (bay ngang) | sway (treo đung đưa) | rise (bay lên) | twinkle (lấp lánh)
// - bar: dải màu mảnh ở mép dưới thanh điều hướng
// Xem thử 1 dịp bất kỳ: thêm ?season=<id> vào URL (VD ?season=christmas), ?season=off để tắt xem thử.
export const SEASONS = [
  {
    id: 'new-year',
    greeting: 'Chúc mừng năm mới!',
    emoji: '🎆',
    from: '12-30',
    to: '01-02',
    particles: ['🎉', '✨', '🎊'],
    motion: 'fall',
    bar: 'from-accent-400 via-danger-400 to-info-400',
  },
  {
    id: 'tet',
    greeting: 'Chúc mừng năm mới — Vạn sự như ý!',
    emoji: '🧧',
    // Mùng 1 Tết: 17/02/2026, 06/02/2027, 26/01/2028 — hiện từ ~1 tuần trước tới mùng 7
    byYear: { 2026: ['02-10', '02-24'], 2027: ['01-30', '02-13'], 2028: ['01-19', '02-02'] },
    particles: ['🌸', '🌼', '🧧'],
    motion: 'fall',
    bar: 'from-danger-500 via-accent-400 to-danger-500',
  },
  {
    id: 'valentine',
    greeting: 'Happy Valentine 💕',
    emoji: '💝',
    from: '02-13',
    to: '02-14',
    particles: ['💖', '💕', '💗'],
    motion: 'rise',
    bar: 'from-rose-400 via-pink-500 to-rose-400',
  },
  {
    id: 'reunification',
    greeting: 'Mừng ngày Thống nhất 30/4 & Quốc tế Lao động 1/5',
    emoji: '🇻🇳',
    from: '04-28',
    to: '05-01',
    particles: ['⭐', '🇻🇳'],
    motion: 'twinkle',
    bar: 'from-danger-600 via-accent-400 to-danger-600',
  },
  {
    id: 'national-day',
    greeting: 'Mừng Quốc khánh 2/9',
    emoji: '🇻🇳',
    from: '08-30',
    to: '09-03',
    particles: ['🇻🇳', '⭐', '🎆'],
    motion: 'twinkle',
    bar: 'from-danger-600 via-accent-400 to-danger-600',
  },
  {
    id: 'mid-autumn',
    greeting: 'Trung thu vui vẻ, đoàn viên!',
    emoji: '🥮',
    // Rằm tháng Tám: 25/09/2026, 15/09/2027, 03/10/2028
    byYear: { 2026: ['09-20', '09-26'], 2027: ['09-10', '09-16'], 2028: ['09-28', '10-04'] },
    particles: ['🏮', '🏮', '🌕', '🥮'],
    motion: 'sway',
    bar: 'from-danger-500 via-accent-400 to-warning-500',
  },
  {
    id: 'women-day',
    greeting: 'Mừng ngày Phụ nữ Việt Nam 20/10',
    emoji: '💐',
    from: '10-18',
    to: '10-20',
    particles: ['🌹', '🌷', '💐'],
    motion: 'fall',
    bar: 'from-rose-400 via-pink-400 to-violet-400',
  },
  {
    id: 'halloween',
    greeting: 'Happy Halloween!',
    emoji: '🎃',
    from: '10-24',
    to: '11-01',
    particles: ['🦇', '🎃', '👻', '🦇'],
    motion: 'float',
    bar: 'from-orange-500 via-violet-600 to-orange-500',
  },
  {
    id: 'teacher-day',
    greeting: 'Tri ân thầy cô 20/11',
    emoji: '📚',
    from: '11-18',
    to: '11-20',
    particles: ['💐', '🌸', '📚'],
    motion: 'fall',
    bar: 'from-info-400 via-primary-400 to-accent-400',
  },
  {
    id: 'christmas',
    greeting: 'Giáng sinh an lành!',
    emoji: '🎄',
    from: '12-15',
    to: '12-26',
    particles: ['❄️', '❄️', '❅', '🎁'],
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
