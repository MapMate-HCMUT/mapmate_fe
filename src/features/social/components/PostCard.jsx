import { useState } from 'react';
import { Link } from 'react-router';
import { Pencil, Repeat2, Trash2 } from 'lucide-react';
import { useSocialStore } from '../stores/socialStore';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';
import { PostContent } from './PostContent';

// 1 bài trên bảng tin. Bài đăng lại = dòng "X đã đăng lại" + lời bình + khung bài gốc.
export const PostCard = ({ post, actions, onTagClick, onCloneItinerary, cloningId, onSendToFriends, onCopyLink, highlighted = false }) => {
  const target = post.is_repost ? post.original : post;
  // Bình luận thuộc bài gốc (kể cả khi đang xem 1 bài đăng lại); mở thông báo dẫn tới bài => mở sẵn bình luận
  const [commentsOpen, setCommentsOpen] = useState(highlighted);
  const openComposer = useSocialStore((state) => state.openComposer);
  const [commentDelta, setCommentDelta] = useState(0);
  const commentCount = (target?.comment_count ?? 0) + commentDelta;

  return (
    <article className={`bg-surface rounded-card shadow-card p-4 space-y-3 ${highlighted ? 'ring-2 ring-primary-400' : ''}`}>
      {post.is_repost && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Repeat2 className="w-4 h-4 text-success-600 shrink-0" />
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
        <PostActions
          target={target}
          onLike={actions.toggleLike}
          onRepost={actions.toggleRepost}
          onSendToFriends={onSendToFriends}
          onCopyLink={onCopyLink}
          commentCount={commentCount}
          commentsOpen={commentsOpen}
          onToggleComments={() => setCommentsOpen((open) => !open)}
        />
      )}
      {target && commentsOpen && <PostComments post={target} onCountChange={(delta) => setCommentDelta((value) => value + delta)} />}

      {post.is_mine && !post.is_repost && (
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => openComposer({ editPost: post })} className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-primary-700">
            <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
          </button>
          <button type="button" onClick={() => actions.deletePost(post)} className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-danger-600">
            <Trash2 className="w-3.5 h-3.5" /> Xoá bài viết
          </button>
        </div>
      )}
    </article>
  );
};
