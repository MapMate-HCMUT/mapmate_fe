import { ErrorState } from '../../../components/ErrorState';
import { formatNumber } from '../utils/leaderboard';
import { formatDateTime, getXpAction } from '../utils/xpActions';

// Lịch sử nhận XP / sao, mới nhất trước.
export const XpHistoryCard = ({ items, hasMore, isLoading, error, onLoadMore, reload }) => (
  <section className="bg-surface rounded-card shadow-card p-5">
    <h2 className="text-base font-bold text-neutral-900 mb-3">🗓️ Hoạt động gần đây</h2>

    {error && <ErrorState compact error={error} title="Chưa tải được hoạt động" onRetry={items.length ? onLoadMore : reload} />}
    {!error && !isLoading && items.length === 0 && (
      <p className="py-6 text-center text-sm text-neutral-500">Chưa có hoạt động nào. Check-in hoặc báo cáo đường để nhận XP nhé!</p>
    )}

    <ul className="divide-y divide-neutral-100">
      {items.map((item) => {
        const { label, emoji } = getXpAction(item.action);
        return (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            <span className="w-9 h-9 shrink-0 rounded-pill bg-neutral-100 flex items-center justify-center" aria-hidden="true">
              {emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{label}</p>
              <p className="text-[11px] text-neutral-500">{formatDateTime(item.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary-700">+{formatNumber(item.xp)} XP</p>
              {item.stars > 0 && <p className="text-[11px] font-medium text-accent-600">+{item.stars} 🌟</p>}
            </div>
          </li>
        );
      })}
    </ul>

    {isLoading && <p className="py-3 text-center text-xs text-neutral-400">Đang tải…</p>}
    {hasMore && !isLoading && (
      <button type="button" onClick={onLoadMore} className="mt-2 w-full py-2 rounded-button text-sm font-semibold text-primary-700 hover:bg-primary-50 transition">
        Xem thêm
      </button>
    )}
  </section>
);
