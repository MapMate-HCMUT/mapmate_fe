import { useNotificationList } from '../hooks/useNotificationList';
import { useNotificationStore } from '../stores/notificationStore';
import { PANEL_PAGE_SIZE } from '../utils/notificationConfig';
import { NotificationList } from './NotificationList';

// Toàn bộ thông báo — tab "Thông báo" trong trang Hồ sơ.
export const NotificationsPanel = () => {
  const list = useNotificationList({ pageSize: PANEL_PAGE_SIZE });
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <section className="bg-surface rounded-card shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-neutral-900">
          🔔 Thông báo {unreadCount > 0 && <span className="text-sm font-semibold text-primary-700">({unreadCount} chưa đọc)</span>}
        </h2>
        {unreadCount > 0 && (
          <button type="button" onClick={list.markAllRead} className="text-xs font-semibold text-primary-700 hover:underline">
            Đánh dấu đã đọc hết
          </button>
        )}
      </div>
      <NotificationList items={list.items} isLoading={list.isLoading} error={list.error} onOpen={list.openNotification} onRetry={list.reload} />
      {list.hasMore && !list.isLoading && (
        <button type="button" onClick={list.loadMore} className="mt-2 w-full py-2 rounded-button text-sm font-semibold text-primary-700 hover:bg-primary-50">
          Xem thêm
        </button>
      )}
    </section>
  );
};
