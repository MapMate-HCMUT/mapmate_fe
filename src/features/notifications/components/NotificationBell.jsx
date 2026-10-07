import { Link } from 'react-router';
import { Icon } from '../../../components/Icon';
import { useNotificationBell } from '../hooks/useNotificationBell';
import { formatBadgeCount } from '../utils/notificationConfig';
import { NotificationList } from './NotificationList';

// Chuông thông báo trên Navbar (chỉ hiện khi đã đăng nhập).
export const NotificationBell = () => {
  const { isAuthenticated, unreadCount, panel, panelRef, list } = useNotificationBell();
  if (!isAuthenticated) return null;

  return (
    <div ref={panelRef} className="relative shrink-0">
      <button
        type="button"
        onClick={panel.toggle}
        aria-label={`Thông báo${unreadCount ? ` (${unreadCount} chưa đọc)` : ''}`}
        aria-expanded={panel.isOpen}
        className="relative p-2 rounded-pill text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
      >
        <Icon name="bell" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-pill bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">
            {formatBadgeCount(unreadCount)}
          </span>
        )}
      </button>

      {panel.isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-1.5rem)] bg-surface rounded-card shadow-modal border border-neutral-100 z-50">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h2 className="text-sm font-bold text-neutral-900">Thông báo</h2>
            {unreadCount > 0 && (
              <button type="button" onClick={list.markAllRead} className="text-xs font-semibold text-primary-700 hover:underline">
                Đánh dấu đã đọc hết
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto px-2">
            <NotificationList items={list.items} isLoading={list.isLoading} error={list.error} onOpen={list.openNotification} onRetry={list.reload} />
          </div>
          <Link
            to="/profile?tab=notifications"
            onClick={panel.close}
            className="block border-t border-neutral-100 py-2.5 text-center text-sm font-semibold text-primary-700 hover:bg-neutral-50 rounded-b-card"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
};
