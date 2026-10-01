import { NotificationItem } from './NotificationItem';

const SKELETON_ROWS = 3;

export const NotificationList = ({ items, isLoading, error, onOpen }) => {
  if (error) return <p className="py-6 text-center text-sm text-danger-600">{error.message}</p>;
  if (isLoading && items.length === 0) {
    return (
      <ul className="space-y-2 animate-pulse" aria-label="Đang tải thông báo">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="h-16 rounded-button bg-neutral-100" />
        ))}
      </ul>
    );
  }
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-3xl mb-1">🔔</p>
        <p className="text-sm text-neutral-500">Bạn chưa có thông báo nào</p>
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <NotificationItem key={item.id} item={item} onOpen={onOpen} />
      ))}
    </ul>
  );
};
