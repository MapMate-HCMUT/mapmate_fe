const MINUTE_MS = 60 * 1000;
const HOUR_MINUTES = 60;

export const formatRelativeTime = (isoDate) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / MINUTE_MS));
  if (minutes < 1) return 'vừa xong';
  if (minutes < HOUR_MINUTES) return `${minutes} phút trước`;
  return `${Math.floor(minutes / HOUR_MINUTES)} giờ trước`;
};
