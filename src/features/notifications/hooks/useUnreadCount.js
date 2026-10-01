import { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getUnreadCountApi } from '../api/notificationsApi';
import { useNotificationStore } from '../stores/notificationStore';
import { UNREAD_POLL_INTERVAL_MS } from '../utils/notificationConfig';

// Cập nhật chấm đỏ: khi đăng nhập, mỗi phút, và mỗi khi người dùng quay lại tab.
export const useUnreadCount = () => {
  const { isAuthenticated } = useAuth();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const refresh = () => getUnreadCountApi().then((data) => setUnreadCount(data.unread_count)).catch(() => {});
    refresh();
    const timer = setInterval(refresh, UNREAD_POLL_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [isAuthenticated, setUnreadCount]);

  return isAuthenticated ? unreadCount : 0;
};
