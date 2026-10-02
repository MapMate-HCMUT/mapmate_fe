import { useAuth } from '../../../hooks/useAuth';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { BELL_PREVIEW_LIMIT } from '../utils/notificationConfig';
import { useNotificationList } from './useNotificationList';
import { useUnreadCount } from './useUnreadCount';

// Chuông trên Navbar: số chưa đọc + panel xem nhanh 5 thông báo mới nhất (chỉ tải khi mở).
export const useNotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const unreadCount = useUnreadCount();
  const { containerRef, ...panel } = useDisclosure();
  const list = useNotificationList({ pageSize: BELL_PREVIEW_LIMIT, enabled: panel.isOpen, onNavigate: panel.close });

  return { isAuthenticated, unreadCount, panel, panelRef: containerRef, list };
};
