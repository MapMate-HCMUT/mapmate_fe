import { PenSquare } from 'lucide-react';
import { useUserPosts } from '../hooks/useUserPosts';
import { PostList } from './PostList';

// "Bài viết & đánh giá" trên trang cá nhân (của mình: mọi bài + nút viết đánh giá; của người khác: bài mình được xem).
export const UserPostsSection = ({ userId, isMe = false }) => {
  const { view, writeReview } = useUserPosts({ userId, isMe });
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-neutral-900">📝 Bài viết & đánh giá</h2>
        {isMe && (
          <button type="button" onClick={writeReview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
            <PenSquare className="w-4 h-4" /> Viết đánh giá địa điểm
          </button>
        )}
      </div>
      <PostList
        view={view}
        emptyText={isMe ? 'Bạn chưa đăng bài nào. Đánh giá một nơi bạn đã đến — kèm ảnh, video — để mọi người tham khảo nhé!' : 'Người này chưa có bài viết công khai nào.'}
      />
    </section>
  );
};
