import { EXPLORE_GRID, EXPLORE_MAIN } from '../../../config/layout';
import { ErrorState } from '../../../components/ErrorState';

export const ProfileSkeleton = () => (
  <div className={`${EXPLORE_GRID} animate-pulse`} aria-label="Đang tải hồ sơ">
    <div className={`${EXPLORE_MAIN} space-y-5`}>
      <div className="h-80 bg-surface rounded-card shadow-card" />
      <div className="h-28 bg-surface rounded-card shadow-card" />
    </div>
    <div className="h-96 bg-surface rounded-card shadow-card hidden xl:block" />
  </div>
);

// Mất mạng / máy chủ lỗi đã chuyển sang trang lỗi chung; còn lại (VD người dùng không tồn tại) hiện ngay trong trang
export const ProfileError = ({ error, onRetry }) => (
  <ErrorState error={error} title="Không tải được hồ sơ" onRetry={onRetry} className="max-w-sm mx-auto mt-16" />
);
