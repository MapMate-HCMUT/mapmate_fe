import { Avatar } from '../../../components/Avatar';
import { LoginPrompt } from '../../../components/LoginPrompt';
import { Icon } from '../../../components/Icon';
import { useFeedTab } from '../hooks/useFeedTab';
import { FEED_SCOPES } from '../utils/socialConfig';
import { FeedSidebar } from './FeedSidebar';
import { PostCard } from './PostCard';
import { ShareToFriendsModal } from './ShareToFriendsModal';

const SKELETON_ROWS = 3;

export const FeedTab = () => {
  const { feed, actions, share, clone, user, openComposer } = useFeedTab();
  const cardProps = {
    actions,
    onTagClick: feed.setTag,
    onCloneItinerary: clone.clone,
    cloningId: clone.cloningId,
    onSendToFriends: share.openFor,
    onCopyLink: share.copyLink,
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
      <div className="space-y-4 min-w-0">
        <button type="button" onClick={openComposer} className="w-full flex items-center gap-3 p-3 bg-surface rounded-card shadow-card text-left hover:shadow-card-hover transition-shadow">
          <Avatar name={user?.username ?? '?'} src={user?.avatar_url} size="md" />
          <span className="flex-1 px-4 py-2.5 rounded-pill bg-neutral-100 text-sm text-neutral-500">Chia sẻ địa điểm, lộ trình hoặc hỏi gợi ý…</span>
          <Icon name="edit" className="w-5 h-5 text-primary-600" />
        </button>

        <div className="flex gap-1 p-1 bg-surface rounded-card shadow-card" role="tablist" aria-label="Phạm vi bảng tin">
          {FEED_SCOPES.map((scope) => (
            <button
              key={scope.value}
              type="button"
              role="tab"
              aria-selected={feed.scope === scope.value}
              onClick={() => feed.changeScope(scope.value)}
              className={`flex-1 py-2 rounded-button text-sm font-semibold transition ${feed.scope === scope.value ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              {scope.emoji} {scope.label}
            </button>
          ))}
        </div>

        {feed.tag && (
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            Đang lọc theo <span className="px-2.5 py-1 rounded-pill bg-info-100 text-info-700 font-semibold">#{feed.tag}</span>
            <button type="button" onClick={() => feed.setTag('')} className="text-xs font-semibold text-neutral-500 hover:text-danger-600">Bỏ lọc</button>
          </p>
        )}

        {feed.sharedPost && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-800">📨 Bài viết được chia sẻ với bạn</h2>
              <button type="button" onClick={feed.dismissSharedPost} className="text-xs font-semibold text-neutral-500 hover:text-neutral-800">Đóng</button>
            </div>
            {feed.sharedPost.post
              ? <PostCard post={feed.sharedPost.post} highlighted {...cardProps} />
              : <p className="bg-surface rounded-card shadow-card p-4 text-sm text-neutral-500">{feed.sharedPost.error ? 'Bài viết không tồn tại hoặc bạn không có quyền xem.' : 'Đang tải bài viết…'}</p>}
          </section>
        )}

        {feed.needsLogin ? (
          <LoginPrompt emoji="👥" title="Bảng tin dành cho thành viên" description="Đăng nhập để xem bài viết của bạn bè và của chính bạn." />
        ) : (
          <>
            {feed.error && <p className="bg-surface rounded-card shadow-card p-6 text-center text-sm text-danger-600">{feed.error.message}</p>}
            {feed.isLoading && feed.items.length === 0 && Array.from({ length: SKELETON_ROWS }, (_, index) => <div key={index} className="h-40 bg-surface rounded-card shadow-card animate-pulse" />)}
            {!feed.isLoading && !feed.error && feed.items.length === 0 && (
              <div className="bg-surface rounded-card shadow-card p-10 text-center">
                <p className="text-4xl mb-2" aria-hidden="true">📝</p>
                <p className="font-semibold text-neutral-800">Chưa có bài viết nào</p>
                <p className="mt-1 text-sm text-neutral-500">{feed.scope === 'friends' ? 'Kết thêm bạn hoặc xem tab Cộng đồng nhé.' : 'Hãy là người đầu tiên chia sẻ một địa điểm!'}</p>
              </div>
            )}
            {feed.items.map((post) => <PostCard key={post.id} post={post} {...cardProps} />)}
            {feed.hasMore && (
              <button type="button" onClick={feed.loadMore} disabled={feed.isLoading} className="w-full py-2.5 rounded-button bg-surface shadow-card text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-60">
                {feed.isLoading ? 'Đang tải…' : 'Xem thêm bài viết'}
              </button>
            )}
          </>
        )}
      </div>

      <FeedSidebar activeTag={feed.tag} onTagClick={feed.setTag} />
      <ShareToFriendsModal share={share} />
    </div>
  );
};
