import { ErrorState } from '../../../components/ErrorState';
import { PostCard } from './PostCard';
import { ShareToFriendsModal } from './ShareToFriendsModal';

const SKELETON_ROWS = 2;

// Danh sách bài viết dùng chung (trang cá nhân, đánh giá của 1 địa điểm). `view` = kết quả của usePostList.
export const PostList = ({ view, emptyIcon = '📝', emptyText, emptyAction = null }) => {
  const { list, actions, share, clone, openTag } = view;
  const cardProps = { actions, onTagClick: openTag, onCloneItinerary: clone.clone, cloningId: clone.cloningId, onSendToFriends: share.openFor, onCopyLink: share.copyLink };

  if (list.error && !list.items.length) return <ErrorState error={list.error} title="Chưa tải được bài viết" onRetry={list.reload} />;
  if (list.isLoading && !list.items.length) {
    return Array.from({ length: SKELETON_ROWS }, (_, index) => <div key={index} className="h-40 bg-surface rounded-card shadow-card animate-pulse" />);
  }
  if (!list.items.length) {
    return (
      <div className="bg-surface rounded-card shadow-card p-8 text-center">
        <p className="text-4xl mb-2" aria-hidden="true">{emptyIcon}</p>
        <p className="text-sm text-neutral-600">{emptyText}</p>
        {emptyAction}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {list.items.map((post) => <PostCard key={post.id} post={post} {...cardProps} />)}
      {list.error && <ErrorState compact error={list.error} title="Chưa tải thêm được" onRetry={list.loadMore} />}
      {list.hasMore && !list.error && (
        <button type="button" onClick={list.loadMore} disabled={list.isLoading} className="w-full py-2.5 rounded-button bg-surface shadow-card text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-60">
          {list.isLoading ? 'Đang tải…' : 'Xem thêm'}
        </button>
      )}
      <ShareToFriendsModal share={share} />
    </div>
  );
};
