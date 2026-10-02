export const LEADERBOARD_LIMIT = 10;

export const PERIOD_OPTIONS = [
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'all', label: 'Mọi lúc' },
];

export const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const formatNumber = (value) => (value ?? 0).toLocaleString('vi-VN');
