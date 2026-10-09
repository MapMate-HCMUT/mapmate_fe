import { useCallback, useEffect, useState } from 'react';

const isBrowserOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

// Trình duyệt đang mất mạng (tắt Wi‑Fi, mất 4G, chế độ máy bay)? Tự cập nhật khi mạng mất / có lại.
// recheck() = kiểm tra lại ngay khi người dùng bấm "Thử lại" (trả về true nếu đã có mạng).
export const useNetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(isBrowserOffline);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const recheck = useCallback(() => {
    const offline = isBrowserOffline();
    setIsOffline(offline);
    return !offline;
  }, []);

  return { isOffline, recheck };
};
