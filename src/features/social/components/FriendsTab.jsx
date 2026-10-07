import { UserSearch, Inbox, Send, Sparkles, Users, Search } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { LoginPrompt } from '../../../components/LoginPrompt';
import { useAuth } from '../../../hooks/useAuth';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { useFriends } from '../hooks/useFriends';
import { usePeopleSearch } from '../hooks/usePeopleSearch';
import { UserRow } from './UserRow';

const FRIENDS = { status: 'friends', request_id: null };

const Section = ({ icon: IconComp, title, count, children, emptyText }) => (
  <section className="bg-surface rounded-card shadow-card p-5">
    <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
      {IconComp && <span className="shrink-0">{IconComp}</span>}
      <span>{title}</span>
      {count !== undefined && <span className="text-sm font-semibold text-neutral-400">{count}</span>}
    </h2>
    {count === 0 ? <p className="mt-2 text-sm text-neutral-500">{emptyText}</p> : <ul className="mt-1 divide-y divide-neutral-100">{children}</ul>}
  </section>
);

const FriendsContent = () => {
  const { friends, incoming, outgoing, suggestions, isLoading, error, reload } = useFriends();
  const search = usePeopleSearch();

  if (error) return <ErrorState error={error} title="Chưa tải được danh sách bạn bè" onRetry={reload} />;
  if (isLoading) return <div className="h-64 bg-surface rounded-card shadow-card animate-pulse" />;

  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="space-y-5">
        <section className="bg-surface rounded-card shadow-card p-5">
          <h2 className="text-base font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <UserSearch className="w-5 h-5 text-primary-600 shrink-0" />
            <span>Tìm bạn bè</span>
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="search"
              value={search.query}
              onChange={(event) => search.setQuery(event.target.value)}
              placeholder="Nhập tên người dùng…"
              aria-label="Tìm người dùng"
              className="w-full pl-9 pr-3 py-2.5 bg-neutral-100 border border-transparent rounded-input text-sm focus:outline-none focus:bg-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          {search.isSearching && <p className="mt-3 text-xs text-neutral-400">Đang tìm…</p>}
          {search.hasKeyword && !search.isSearching && search.items.length === 0 && <p className="mt-3 text-sm text-neutral-500">Không tìm thấy ai tên “{search.query.trim()}”.</p>}
          <ul className="divide-y divide-neutral-100">
            {search.items.map((user) => <UserRow key={`${user.id}-${user.relationship.status}`} user={user} relationship={user.relationship} />)}
          </ul>
        </section>

        {incoming.length > 0 && (
          <Section icon={<Inbox className="w-5 h-5 text-primary-600" />} title="Lời mời kết bạn" count={incoming.length}>
            {incoming.map((request) => (
              <UserRow key={request.request_id} user={request.user} relationship={{ status: 'pending_received', request_id: request.request_id }} note={formatRelativeTime(request.created_at)} />
            ))}
          </Section>
        )}
        {outgoing.length > 0 && (
          <Section icon={<Send className="w-5 h-5 text-primary-600" />} title="Lời mời đã gửi" count={outgoing.length}>
            {outgoing.map((request) => (
              <UserRow key={request.request_id} user={request.user} relationship={{ status: 'pending_sent', request_id: request.request_id }} note="đang chờ" />
            ))}
          </Section>
        )}
        <Section icon={<Sparkles className="w-5 h-5 text-amber-500" />} title="Gợi ý kết bạn" count={suggestions.length} emptyText="Hiện chưa có gợi ý mới.">
          {suggestions.map((user) => <UserRow key={user.id} user={user} relationship={user.relationship} />)}
        </Section>
      </div>

      <Section icon={<Users className="w-5 h-5 text-primary-600" />} title="Bạn bè của tôi" count={friends.length} emptyText="Bạn chưa có người bạn nào. Tìm theo tên hoặc xem gợi ý bên cạnh nhé.">
        {friends.map((friend) => <UserRow key={friend.id} user={friend} relationship={FRIENDS} />)}
      </Section>
    </div>
  );
};

export const FriendsTab = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPrompt icon={<Users className="w-10 h-10 text-primary-600" />} title="Kết nối với bạn bè" description="Đăng nhập để kết bạn, xem địa điểm bạn bè đã đi và chia sẻ lộ trình cho nhau." />;
  return <FriendsContent />;
};
