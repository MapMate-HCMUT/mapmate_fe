import { Link } from 'react-router';
import { ERROR_KINDS, ERROR_PAGES } from '../utils/errorMessages';

// Trang lỗi dùng chung: chuyện gì đã xảy ra, bạn nên làm gì, nút "Thử lại" + "Về trang chủ".
// Không hiện mã lỗi / chữ kỹ thuật — người dùng bình thường đọc là hiểu.
export const ErrorPage = ({ kind = ERROR_KINDS.SERVER, onRetry = null, retryLabel = 'Thử lại', note = null }) => {
  const content = ERROR_PAGES[kind] ?? ERROR_PAGES[ERROR_KINDS.SERVER];
  return (
    <section className="flex-1 min-h-0 overflow-y-auto bg-neutral-50 flex items-center justify-center p-4" role="alert">
      <div className="w-full max-w-md bg-surface rounded-card shadow-card p-6 sm:p-8 text-center">
        <p className="text-5xl" aria-hidden="true">{content.emoji}</p>
        <h1 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">{content.title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{content.message}</p>
        {content.tips?.length > 0 && (
          <div className="mt-5 rounded-input bg-neutral-50 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Bạn có thể</p>
            <ul className="mt-1.5 space-y-1 text-sm text-neutral-700 list-disc pl-5">
              {content.tips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
        )}
        {note && <p role="status" className="mt-4 rounded-input bg-warning-50 px-3 py-2 text-xs text-warning-700">{note}</p>}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {onRetry && (
            <button type="button" onClick={onRetry} className="py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-button text-sm font-semibold transition">
              {retryLabel}
            </button>
          )}
          <Link
            to="/"
            reloadDocument={kind === ERROR_KINDS.CRASH} // giao diện vừa hỏng => tải lại hẳn cho sạch
            className={`py-2.5 rounded-button text-sm font-semibold transition ${onRetry ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : 'sm:col-span-2 bg-primary-600 hover:bg-primary-700 text-white'}`}
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
};
