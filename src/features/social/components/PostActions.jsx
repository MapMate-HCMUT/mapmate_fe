import { Heart, Repeat2, Share2, Users, Link2 } from 'lucide-react';
import { useDisclosure } from '../../../hooks/useDisclosure';

const actionClass = 'flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-button text-sm font-medium transition';

// Hàng nút dưới bài viết. `target` = bài gốc (kể cả khi đang xem 1 bài đăng lại).
export const PostActions = ({ target, onLike, onRepost, onSendToFriends, onCopyLink }) => {
  const { containerRef, ...shareMenu } = useDisclosure();
  const canRepost = target.visibility === 'public';

  return (
    <div className="flex items-center gap-1 pt-2 border-t border-neutral-100">
      <button type="button" onClick={() => onLike(target)} aria-pressed={target.liked_by_me} className={`${actionClass} ${target.liked_by_me ? 'text-danger-600 bg-danger-50' : 'text-neutral-600 hover:bg-neutral-100'}`}>
        <Heart className={`w-4.5 h-4.5 ${target.liked_by_me ? 'fill-current' : ''}`} />
        <span>Thích</span>{target.like_count > 0 && <span className="font-bold">{target.like_count}</span>}
      </button>
      <button
        type="button"
        onClick={() => onRepost(target)}
        disabled={!canRepost}
        aria-pressed={target.reposted_by_me}
        title={canRepost ? 'Đăng lại lên tường của bạn' : 'Chỉ đăng lại được bài công khai'}
        className={`${actionClass} disabled:opacity-40 ${target.reposted_by_me ? 'text-success-700 bg-success-50' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Repeat2 className="w-4.5 h-4.5" />
        <span>{target.reposted_by_me ? 'Đã đăng lại' : 'Đăng lại'}</span>{target.repost_count > 0 && <span className="font-bold">{target.repost_count}</span>}
      </button>
      <div ref={containerRef} className="relative flex-1">
        <button type="button" onClick={shareMenu.toggle} aria-haspopup="menu" aria-expanded={shareMenu.isOpen} className={`${actionClass} w-full text-neutral-600 hover:bg-neutral-100`}>
          <Share2 className="w-4.5 h-4.5" />
          <span>Chia sẻ</span>
        </button>
        {shareMenu.isOpen && (
          <div role="menu" className="absolute right-0 bottom-full mb-1 w-52 bg-surface rounded-card shadow-modal border border-neutral-100 p-1 z-30">
            <button type="button" role="menuitem" onClick={() => { shareMenu.close(); onSendToFriends(target); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-input text-sm text-neutral-700 hover:bg-neutral-100">
              <Users className="w-4 h-4 text-neutral-400" /> Gửi cho bạn bè
            </button>
            <button type="button" role="menuitem" onClick={() => { shareMenu.close(); onCopyLink(target); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-input text-sm text-neutral-700 hover:bg-neutral-100">
              <Link2 className="w-4 h-4 text-neutral-400" /> Sao chép liên kết
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
