import { useAuth } from '../../../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useTrendingTags } from '../hooks/useSocialLists';
import { UserRow } from './UserRow';

const FriendSuggestions = () => {
  const { suggestions, incoming } = useFriends();
  if (suggestions.length === 0 && incoming.length === 0) return null;
  return (
    <section className="bg-surface rounded-card shadow-card p-4">
      {incoming.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-neutral-900">📬 Lời mời kết bạn</h2>
          <ul className="divide-y divide-neutral-100 mb-3">
            {incoming.map((request) => <UserRow key={request.request_id} user={request.user} relationship={{ status: 'pending_received', request_id: request.request_id }} />)}
          </ul>
        </>
      )}
      <h2 className="text-sm font-bold text-neutral-900">💡 Gợi ý kết bạn</h2>
      <ul className="divide-y divide-neutral-100">
        {suggestions.slice(0, 4).map((user) => <UserRow key={user.id} user={user} relationship={user.relationship} />)}
      </ul>
    </section>
  );
};

// Cột phải của bảng tin: hashtag nổi bật + gợi ý kết bạn.
export const FeedSidebar = ({ activeTag, onTagClick }) => {
  const { isAuthenticated } = useAuth();
  const trending = useTrendingTags();

  return (
    <aside className="space-y-5">
      <section className="bg-surface rounded-card shadow-card p-4">
        <h2 className="text-sm font-bold text-neutral-900 mb-2">🔥 Hashtag nổi bật</h2>
        {trending.length === 0 ? (
          <p className="text-xs text-neutral-500">Chưa có hashtag nào. Hãy là người đầu tiên gắn thẻ!</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {trending.map(({ tag, count }) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => onTagClick(tag === activeTag ? '' : tag)}
                  aria-pressed={tag === activeTag}
                  className={`px-2.5 py-1 rounded-pill text-xs font-medium transition ${tag === activeTag ? 'bg-info-600 text-white' : 'bg-info-50 text-info-700 hover:bg-info-100'}`}
                >
                  #{tag} <span className="opacity-70">{count}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {isAuthenticated && <FriendSuggestions />}
    </aside>
  );
};
