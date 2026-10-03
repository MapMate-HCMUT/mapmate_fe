import { Avatar } from '../../../components/Avatar';

// Danh sách bạn bè dạng chip để chọn nhiều người (gắn thẻ / gửi bài viết).
export const FriendPicker = ({ friends, selectedIds, onToggle, emptyText = 'Bạn chưa có người bạn nào. Vào tab Bạn bè để kết bạn nhé.' }) => {
  if (friends.length === 0) return <p className="text-xs text-neutral-500">{emptyText}</p>;
  return (
    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
      {friends.map((friend) => {
        const isSelected = selectedIds.includes(friend.id);
        return (
          <button
            key={friend.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(friend.id)}
            className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-pill border text-xs font-medium transition ${
              isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-surface border-neutral-200 text-neutral-700 hover:border-primary-300'
            }`}
          >
            <Avatar name={friend.username} src={friend.avatar_url} size="xs" />
            {friend.username}
          </button>
        );
      })}
    </div>
  );
};
