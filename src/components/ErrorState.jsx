import { RotateCw } from 'lucide-react';
import { errorContent } from '../utils/errorMessages';

// Khung lỗi đặt trong 1 trang / tab / thẻ (khi lỗi không làm hỏng cả trang): chuyện gì xảy ra + nút "Thử lại".
// compact = 1 dòng gọn cho thẻ nhỏ (bảng xếp hạng, thông báo, trạm xe buýt...).
export const ErrorState = ({ error, title, onRetry = null, compact = false, className = '' }) => {
  const content = errorContent(error, title);
  if (compact) {
    return (
      <div role="alert" className={`flex items-start gap-2 rounded-input bg-danger-50 px-3 py-2 text-xs text-danger-700 ${className}`}>
        <span aria-hidden="true">{content.emoji}</span>
        <p className="flex-1 min-w-0">
          <span className="font-semibold">{content.title}.</span> {content.message}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="shrink-0 inline-flex items-center gap-1 font-semibold text-danger-700 hover:underline">
            <RotateCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        )}
      </div>
    );
  }
  return (
    <div role="alert" className={`bg-surface rounded-card shadow-card p-6 sm:p-8 text-center ${className}`}>
      <p className="text-4xl" aria-hidden="true">{content.emoji}</p>
      <p className="mt-2 font-bold text-neutral-900">{content.title}</p>
      <p className="mt-1 text-sm text-neutral-600">{content.message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-button text-sm font-semibold transition">
          <RotateCw className="w-4 h-4" /> Thử lại
        </button>
      )}
    </div>
  );
};
