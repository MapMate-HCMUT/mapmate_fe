import { PenSquare } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { usePlaceReviews } from '../hooks/usePlaceReviews';
import { PostList } from './PostList';
import { StarRating } from './StarRating';

// "Đánh giá từ cộng đồng" của 1 địa điểm: điểm trung bình người dùng MapMate chấm + bài đánh giá (chữ, ảnh, video).
export const PlaceReviewsModal = () => {
  const reviews = usePlaceReviews();
  if (!reviews.isOpen) return null;
  const { place, rating } = reviews;

  return (
    <Modal isOpen title={`Đánh giá · ${place.name}`} onClose={reviews.close} size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-neutral-50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Cộng đồng MapMate</p>
            {rating.count > 0 ? (
              <p className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-black text-neutral-900">{rating.average.toFixed(1)}</span>
                <StarRating value={Math.round(rating.average)} size="w-4 h-4" />
                <span className="text-sm text-neutral-500">{rating.count} người đánh giá</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-neutral-600">Chưa ai chấm điểm — hãy là người đầu tiên!</p>
            )}
          </div>
          <button type="button" onClick={reviews.writeReview} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
            <PenSquare className="w-4 h-4" /> Viết đánh giá
          </button>
        </div>
        <PostList view={reviews.view} emptyIcon="💬" emptyText="Chưa có bài đánh giá nào cho nơi này. Bạn đã đến đây chưa? Chia sẻ trải nghiệm kèm ảnh / video nhé!" />
      </div>
    </Modal>
  );
};
