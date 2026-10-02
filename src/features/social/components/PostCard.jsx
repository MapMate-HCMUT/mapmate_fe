import { Link } from 'react-router';
import { Icon } from '../../../components/Icon';
import { PostActions } from './PostActions';
import { PostContent } from './PostContent';

// 1 bài trên bảng tin. Bài đăng lại = dòng "X đã đăng lại" + lời bình + khung bài gốc.
export const PostCard = ({ post, actions, onTagClick, onCloneItinerary, cloningId, onSendToFriends, onCopyLink, highlighted = false }) => {
  const target = post.is_repost ? post.original : post;

  return (
    <article className={`bg-surface rounded-card shadow-card p-4 space-y-3 ${highlighted ? 'ring-2 ring-primary-400' : ''}`}>
      {post.is_repost && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Icon name="repeat" className="w-4 h-4 text-success-600" />
          <span className="flex-1">
            <Link to={post.is_mine ? '/profile' : `/users/${post.author.id}`} className="font-semibold text-neutral-700 hover:underline">{post.is_mine ? 'Bạn' : post.author.username}</Link> đã đăng lại
          </span>
        </div>
      )}
      {post.is_repost && post.content && <p className="text-sm text-neutral-800 whitespace-pre-line">{post.content}</p>}

      {target ? (
        <div className={post.is_repost ? 'p-3 rounded-card border border-neutral-200' : ''}>
          <PostContent post={target} onTagClick={onTagClick} onCloneItinerary={onCloneItinerary} cloningId={cloningId} />
        </div>
      ) : (
        <p className="p-3 rounded-card bg-neutral-50 text-sm italic text-neutral-400">Bài viết gốc đã bị xoá.</p>
      )}

      {target && (
        <PostActions target={target} onLike={actions.toggleLike} onRepost={actions.toggleRepost} onSendToFriends={onSendToFriends} onCopyLink={onCopyLink} />
      )}

      {post.is_mine && !post.is_repost && (
        <button type="button" onClick={() => actions.deletePost(post)} className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-danger-600">
          <Icon name="trash" className="w-3.5 h-3.5" /> Xoá bài viết
        </button>
      )}
    </article>
  );
};
