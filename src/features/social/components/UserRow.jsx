import { Link } from 'react-router';
import { Avatar } from '../../../components/Avatar';
import { FriendActionButton } from './FriendActionButton';

// 1 người trong danh sách bạn bè / lời mời / kết quả tìm kiếm / gợi ý.
export const UserRow = ({ user, relationship, note }) => (
  <li className="flex items-center gap-3 py-2.5">
    <Link to={`/users/${user.id}`} className="shrink-0">
      <Avatar name={user.username} src={user.avatar_url} size="md" />
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/users/${user.id}`} className="block text-sm font-semibold text-neutral-900 truncate hover:underline">{user.username}</Link>
      <p className="text-xs text-neutral-500 truncate">
        Lv.{user.level} {user.level_title}{user.city && <> · 📍 {user.city}</>}{note && <> · {note}</>}
      </p>
    </div>
    <FriendActionButton userId={user.id} relationship={relationship} />
  </li>
);
