import { FileText, Film, LoaderCircle, MapPin, Repeat2, Route, RotateCcw, Trash2 } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { EXPLORE_MAIN } from '../../../config/layout';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { useTrash } from '../hooks/useTrash';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysLeft = (expiresAt) => Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS));

// Ảnh nhỏ bên trái: ảnh / khung đầu video; bài không có ảnh => biểu tượng theo loại bài
const Thumb = ({ media, fallbackIcon: FallbackIcon }) => {
  if (!media) {
    return (
      <span className="w-16 h-16 shrink-0 rounded-input bg-neutral-100 text-neutral-400 flex items-center justify-center">
        <FallbackIcon className="w-6 h-6" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="relative w-16 h-16 shrink-0 overflow-hidden rounded-input bg-neutral-100">
      <img src={media.type === 'video' ? media.poster_url : media.thumb_url} alt="" loading="lazy" className="w-full h-full object-cover" />
      {media.type === 'video' && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
          <Film className="w-5 h-5" aria-hidden="true" />
        </span>
      )}
    </span>
  );
};

const describePost = (post) => {
  if (post.is_repost) return { title: 'Bài đăng lại', icon: Repeat2 };
  if (post.place_name) return { title: `Đánh giá · ${post.place_name}`, icon: MapPin };
  if (post.itinerary_name) return { title: `Lộ trình · ${post.itinerary_name}`, icon: Route };
  return { title: 'Bài viết', icon: FileText };
};

const TrashRow = ({ item, busy, onRestore, onRemove }) => {
  const isPost = item.kind === 'post';
  const post = isPost ? describePost(item.post) : null;
  const left = daysLeft(item.expires_at);
  const title = isPost ? post.title : item.media.type === 'video' ? 'Video trong bài viết' : 'Ảnh trong bài viết';
  const detail = isPost ? item.post.content || (item.post.media.length ? `${item.post.media.length} ảnh / video` : '') : item.post_exists ? 'Bỏ ra khi chỉnh sửa bài' : 'Bài viết chứa ảnh này không còn — chỉ xoá được';

  return (
    <li className="flex gap-3 p-3 rounded-card bg-surface shadow-card">
      <Thumb media={isPost ? item.post.media[0] : item.media} fallbackIcon={post?.icon ?? FileText} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900 truncate">{title}</p>
        {detail && <p className="mt-0.5 text-sm text-neutral-600 line-clamp-2 break-words">{detail}</p>}
        <p className="mt-1 text-xs text-neutral-500">
          Đã xoá {formatRelativeTime(item.deleted_at)} · <span className={left <= 3 ? 'text-danger-600 font-medium' : ''}>{left > 0 ? `tự xoá sau ${left} ngày` : 'sắp tự xoá'}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {(isPost || item.post_exists) && (
            <button
              type="button"
              onClick={() => onRestore(item)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-primary-200 text-primary-700 text-xs font-semibold hover:bg-primary-50 disabled:opacity-50 transition"
            >
              {busy ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />} Khôi phục
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(item)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold text-neutral-500 hover:text-danger-600 hover:bg-danger-50 disabled:opacity-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xoá vĩnh viễn
          </button>
        </div>
      </div>
    </li>
  );
};

// Mục "Thùng rác" (/trash): bài viết + ảnh / video đã xoá, khôi phục được trong 30 ngày
export const TrashPage = () => {
  const trash = useTrash();

  return (
    <div className={`${EXPLORE_MAIN} space-y-4`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-neutral-900">Thùng rác</h1>
          <p className="text-sm text-neutral-500">Bài viết và ảnh / video bạn đã xoá nằm ở đây {trash.retentionDays} ngày, sau đó tự xoá vĩnh viễn.</p>
        </div>
        {trash.items.length > 0 && (
          <button
            type="button"
            onClick={trash.empty}
            disabled={trash.busyId === 'all'}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-button text-sm font-semibold text-danger-600 hover:bg-danger-50 disabled:opacity-50 transition"
          >
            {trash.busyId === 'all' ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Dọn sạch
          </button>
        )}
      </header>

      {trash.isLoading && !trash.items.length ? (
        <p className="flex items-center gap-2 text-sm text-neutral-500"><LoaderCircle className="w-4 h-4 animate-spin" /> Đang tải…</p>
      ) : trash.error && !trash.items.length ? (
        <ErrorState error={trash.error} onRetry={trash.reload} />
      ) : trash.items.length ? (
        <ul className="space-y-2.5">
          {trash.items.map((item) => (
            <TrashRow key={item.id} item={item} busy={trash.busyId === item.id || trash.busyId === 'all'} onRestore={trash.restore} onRemove={trash.remove} />
          ))}
        </ul>
      ) : (
        <div className="rounded-card bg-surface shadow-card px-4 py-10 text-center">
          <Trash2 className="mx-auto w-8 h-8 text-neutral-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-neutral-700">Thùng rác trống</p>
          <p className="text-xs text-neutral-500">Bài viết hay ảnh / video bạn xoá sẽ nằm ở đây để khôi phục khi cần.</p>
        </div>
      )}
    </div>
  );
};
