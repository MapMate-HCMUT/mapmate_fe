const MINUTE_MS = 60 * 1000;
const HOUR_MINUTES = 60;
const DAY_MINUTES = 24 * HOUR_MINUTES;
const WEEK_DAYS = 7;

// "vừa xong" · "5 phút trước" · "3 giờ trước" · "2 ngày trước" · sau 1 tuần hiện ngày cụ thể
export const formatRelativeTime = (isoDate) => {
  const date = new Date(isoDate);
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / MINUTE_MS));
  if (minutes < 1) return 'vừa xong';
  if (minutes < HOUR_MINUTES) return `${minutes} phút trước`;
  if (minutes < DAY_MINUTES) return `${Math.floor(minutes / HOUR_MINUTES)} giờ trước`;
  const days = Math.floor(minutes / DAY_MINUTES);
  return days < WEEK_DAYS ? `${days} ngày trước` : date.toLocaleDateString('vi-VN');
};
