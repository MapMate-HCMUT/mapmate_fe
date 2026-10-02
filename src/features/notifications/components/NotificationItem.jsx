import { formatRelativeTime } from '../../../utils/formatRelativeTime';

export const NotificationItem = ({ item, onOpen }) => {
  const isUnread = !item.read_at;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={`w-full flex gap-3 p-3 rounded-button text-left transition ${isUnread ? 'bg-primary-50 hover:bg-primary-100' : 'hover:bg-neutral-50'}`}
      >
        <span className="w-10 h-10 shrink-0 rounded-pill bg-surface border border-neutral-200 flex items-center justify-center text-lg" aria-hidden="true">
          {item.icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className={`block text-sm leading-snug ${isUnread ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>{item.title}</span>
          {item.body && <span className="block mt-0.5 text-xs text-neutral-500 line-clamp-2">{item.body}</span>}
          <span className="block mt-1 text-[11px] text-neutral-400">{formatRelativeTime(item.created_at)}</span>
        </span>
        {isUnread && <span className="mt-1.5 w-2.5 h-2.5 shrink-0 rounded-pill bg-primary-500" aria-label="Chưa đọc" />}
      </button>
    </li>
  );
};
