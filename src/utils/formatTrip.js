const MINUTES_PER_HOUR = 60;

// 135 -> "2 giờ 15 phút" · 45 -> "45 phút"
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${rest} phút`;
  return rest === 0 ? `${hours} giờ` : `${hours} giờ ${rest} phút`;
};

// 250000 -> "250.000đ"
export const formatVND = (amount) => `${Math.round(amount ?? 0).toLocaleString('vi-VN')}đ`;
