import { ChevronLeft, ChevronRight } from 'lucide-react';

const GAP = 'gap';
const NEIGHBORS = 1; // số trang hiện 2 bên trang đang xem

// Dãy số trang gọn: 1 … 4 5 6 … 20. Không biết trang cuối (tổng bị giới hạn) => không hiện trang cuối, chỉ "…" phía sau.
const pageItems = (page, totalPages, isOpenEnded) => {
  const last = isOpenEnded ? page + NEIGHBORS : totalPages;
  const pages = new Set([1, page, ...Array.from({ length: NEIGHBORS * 2 + 1 }, (_, i) => page - NEIGHBORS + i)]);
  if (!isOpenEnded) pages.add(totalPages);
  const sorted = [...pages].filter((value) => value >= 1 && value <= last).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) items.push(GAP);
    items.push(value);
  });
  if (isOpenEnded) items.push(GAP);
  return items;
};

const buttonClass = 'min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-button text-sm font-semibold transition disabled:opacity-40 disabled:pointer-events-none';

/**
 * Thanh chia trang: ‹ Trước · 1 … 4 [5] 6 … 20 · Sau ›
 * `hasMore` dùng cho nút "Sau" khi không biết chính xác tổng số trang (isOpenEnded).
 */
export const Pagination = ({ page, totalPages, hasMore, isOpenEnded = false, onChange, isLoading = false, label = 'Chuyển trang' }) => {
  const canNext = isOpenEnded ? hasMore : page < totalPages;
  if (page === 1 && !canNext) return null;

  return (
    <nav aria-label={label} className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1 || isLoading} className={`${buttonClass} gap-1 bg-surface shadow-card text-neutral-700 hover:bg-neutral-100`}>
        <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Trước</span>
      </button>
      {pageItems(page, totalPages, isOpenEnded).map((item, index) =>
        item === GAP ? (
          <span key={`gap-${index}`} className="px-1 text-neutral-400" aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            disabled={isLoading}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Trang ${item}`}
            className={`${buttonClass} ${item === page ? 'bg-primary-600 text-white shadow-card' : 'bg-surface shadow-card text-neutral-700 hover:bg-neutral-100'}`}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={!canNext || isLoading} className={`${buttonClass} gap-1 bg-surface shadow-card text-neutral-700 hover:bg-neutral-100`}>
        <span className="hidden sm:inline">Sau</span> <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
