import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { LoaderCircle, SendHorizontal, Trash2 } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useAuth } from '../../../hooks/useAuth';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { addCommentApi, deleteCommentApi, getCommentsApi } from '../api/socialApi';

const COMMENT_MAX_LENGTH = 500;
const COUNTER_FROM = 400; // gần tới giới hạn mới hiện bộ đếm ký tự

const profileLink = (comment) => (comment.is_mine ? '/profile' : `/users/${comment.author.id}`);

const CommentRow = ({ comment, onDelete, isDeleting }) => (
  <li className="flex gap-2">
    <Link to={profileLink(comment)} className="shrink-0">
      <Avatar name={comment.author.username} src={comment.author.avatar_url} size="sm" />
    </Link>
    <div className="min-w-0 flex-1">
      <div className="inline-block max-w-full rounded-card bg-neutral-100 px-3 py-2">
        <Link to={profileLink(comment)} className="text-[13px] font-semibold text-neutral-900 hover:underline">{comment.author.username}</Link>
        <p className="text-sm text-neutral-800 whitespace-pre-line break-words">{comment.content}</p>
      </div>
      <div className="mt-0.5 flex items-center gap-3 px-3 text-xs text-neutral-500">
        <span>{formatRelativeTime(comment.created_at)}</span>
        {comment.can_delete && (
          <button type="button" onClick={() => onDelete(comment)} disabled={isDeleting} className="inline-flex items-center gap-1 font-medium hover:text-danger-600 disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> Xoá
          </button>
        )}
      </div>
    </div>
  </li>
);

/**
 * Bình luận dưới 1 bài viết: danh sách (cũ trước, "Xem thêm" để tải tiếp) + ô viết bình luận.
 * onCountChange(delta) => thẻ bài viết cập nhật số bình luận trên nút. Không bật thông báo nổi khi gửi / xoá thành công.
 */
export const PostComments = ({ post, onCountChange }) => {
  const { isAuthenticated, user } = useAuth();
  const { pathname, search } = useLocation();
  const firstPage = useAsyncData(() => getCommentsApi(post.id), post.id);
  const [extra, setExtra] = useState({ items: [], cursor: undefined }); // trang tải thêm + bình luận vừa gửi
  const [removedIds, setRemovedIds] = useState(() => new Set());
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const cursor = extra.cursor !== undefined ? extra.cursor : firstPage.data?.next_cursor ?? null;
  const comments = [...(firstPage.data?.items ?? []), ...extra.items].filter((comment) => !removedIds.has(comment.id));

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const page = await getCommentsApi(post.id, { after: cursor });
      setExtra((prev) => ({ items: [...prev.items, ...page.items], cursor: page.next_cursor }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const submit = async (event) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      const created = await addCommentApi(post.id, content);
      // Chỉ thêm khi đã tải hết các trang trước (không thì bình luận mới sẽ xuất hiện khi bấm "Xem thêm")
      if (!cursor) setExtra((prev) => ({ ...prev, items: [...prev.items, created] }));
      setDraft('');
      onCountChange?.(1);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setIsSending(false);
    }
  };

  const remove = async (comment) => {
    setDeletingId(comment.id);
    setError(null);
    try {
      await deleteCommentApi(post.id, comment.id);
      setRemovedIds((prev) => new Set(prev).add(comment.id));
      onCountChange?.(-1);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-3 pt-1" aria-label="Bình luận">
      {firstPage.isLoading && !firstPage.data ? (
        <p className="flex items-center gap-2 text-sm text-neutral-500"><LoaderCircle className="w-4 h-4 animate-spin" /> Đang tải bình luận…</p>
      ) : firstPage.error && !firstPage.data ? (
        <p className="text-sm text-danger-600">
          {firstPage.error.message} <button type="button" onClick={firstPage.reload} className="font-semibold underline">Thử lại</button>
        </p>
      ) : (
        <>
          {comments.length > 0 ? (
            <ul className="space-y-2.5">
              {comments.map((comment) => (
                <CommentRow key={comment.id} comment={comment} onDelete={remove} isDeleting={deletingId === comment.id} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">Chưa có bình luận nào — hãy là người đầu tiên.</p>
          )}
          {cursor && (
            <button type="button" onClick={loadMore} disabled={isLoadingMore} className="text-sm font-semibold text-neutral-600 hover:underline disabled:opacity-50">
              {isLoadingMore ? 'Đang tải…' : 'Xem thêm bình luận'}
            </button>
          )}
        </>
      )}

      {isAuthenticated ? (
        <form onSubmit={submit} className="flex items-start gap-2">
          <Avatar name={user?.username} src={user?.avatar_url} size="sm" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-end gap-1 rounded-card border border-neutral-200 bg-surface pl-3 pr-1 py-1 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, COMMENT_MAX_LENGTH))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event); // Shift+Enter = xuống dòng
                }}
                rows={1}
                placeholder="Viết bình luận…"
                aria-label="Viết bình luận"
                className="min-h-[34px] max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none [field-sizing:content]"
              />
              <button type="submit" disabled={!draft.trim() || isSending} aria-label="Gửi bình luận" className="p-2 rounded-pill text-primary-600 hover:bg-primary-50 disabled:text-neutral-300 disabled:hover:bg-transparent transition">
                {isSending ? <LoaderCircle className="w-4.5 h-4.5 animate-spin" /> : <SendHorizontal className="w-4.5 h-4.5" />}
              </button>
            </div>
            {draft.length >= COUNTER_FROM && <p className="mt-1 text-right text-xs text-neutral-400">{draft.length}/{COMMENT_MAX_LENGTH}</p>}
          </div>
        </form>
      ) : (
        <p className="text-sm text-neutral-500">
          <Link to={`/login?redirect=${encodeURIComponent(pathname + search)}`} className="font-semibold text-primary-700 hover:underline">Đăng nhập</Link> để bình luận.
        </p>
      )}
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
    </section>
  );
};
