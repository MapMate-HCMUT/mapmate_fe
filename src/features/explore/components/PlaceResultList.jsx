import { useRef } from 'react';
import { ErrorState } from '../../../components/ErrorState';
import { Pagination } from '../../../components/Pagination';
import { PAGE_SIZE } from '../utils/filterConfig';
import { PlaceResultCard } from './PlaceResultCard';

const SKELETON_ROWS = 3;

// Danh sách địa điểm chia trang (PAGE_SIZE quán / trang). Đổi trang => cuộn về đầu danh sách.
export const PlaceResultList = ({ places, isLoading, error, page, totalPages, hasMore, isOpenEnded, onPageChange, onRetry, onReset, draftIds, tagLabels, onToggleDraft, onShare, onOpenReviews }) => {
  const topRef = useRef(null);
  const changePage = (next) => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onPageChange(next);
  };
  // Lỗi khi đổi trang => giữ danh sách đang xem, báo gọn bên dưới
  if (error && places.length === 0) return <ErrorState error={error} title="Chưa tải được danh sách địa điểm" onRetry={onRetry} />;
  if (isLoading && places.length === 0) {
    return (
      <ul className="space-y-4 animate-pulse" aria-label="Đang tải địa điểm">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="h-56 bg-surface rounded-card shadow-card" />
        ))}
      </ul>
    );
  }
  if (places.length === 0) {
    return (
      <div className="bg-surface rounded-card shadow-card p-10 text-center">
        <p className="text-4xl mb-2" aria-hidden="true">🔍</p>
        <p className="font-semibold text-neutral-800">Không có địa điểm nào khớp bộ lọc</p>
        <p className="mt-1 text-sm text-neutral-500">Thử nới bán kính, tăng mức giá hoặc bỏ bớt phong cách.</p>
        <button type="button" onClick={onReset} className="mt-4 px-4 py-2 rounded-button bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm font-semibold">
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }
  return (
    <>
      <div ref={topRef} className="scroll-mt-6" aria-hidden="true" />
      <ul className={`space-y-4 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
        {places.map((place) => (
          <PlaceResultCard
            key={place.id}
            place={place}
            tagLabels={tagLabels}
            inDraft={draftIds.has(place.id)}
            onToggleDraft={onToggleDraft}
            onShare={onShare}
            onOpenReviews={onOpenReviews}
          />
        ))}
      </ul>
      {error && <ErrorState compact error={error} title="Chưa tải được trang này" onRetry={() => onPageChange(page)} className="mt-3" />}
      <Pagination page={page} totalPages={totalPages} hasMore={hasMore} isOpenEnded={isOpenEnded} onChange={changePage} isLoading={isLoading} label="Trang danh sách địa điểm" />
      {totalPages > 1 && (
        <p className="mt-2 text-center text-xs text-neutral-500">
          Trang {page} · {PAGE_SIZE} địa điểm mỗi trang
        </p>
      )}
    </>
  );
};
