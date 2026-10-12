import { useEffect, useState } from 'react';

// Thời điểm hiện tại, tự cập nhật mỗi `intervalMs` (đếm ngược giờ mở / giờ kết thúc sự kiện)
export const useNow = (intervalMs = 1000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
};

const pad = (value) => String(value).padStart(2, '0');
// "2 ngày 03:15:09" / "03:15:09"
export const formatCountdown = (ms) => {
  if (ms <= 0) return '00:00:00';
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const clock = `${pad(Math.floor((seconds % 86400) / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
  return days ? `${days} ngày ${clock}` : clock;
};
