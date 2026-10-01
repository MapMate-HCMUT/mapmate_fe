import { Link } from 'react-router';
import { Avatar } from '../../../components/Avatar';
import { formatNumber, MEDALS, PERIOD_OPTIONS } from '../utils/leaderboard';

export const LeaderboardCard = ({ period, onPeriodChange, rankings, me, currentUserId, isLoading, error }) => (
  <section className="bg-surface rounded-card shadow-card p-5">
    <h2 className="text-base font-bold text-neutral-900 mb-3">🏆 Bảng xếp hạng</h2>
    <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-button mb-4" role="tablist">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={period === option.value}
          onClick={() => onPeriodChange(option.value)}
          className={`py-1.5 rounded-input text-xs font-semibold transition ${
            period === option.value ? 'bg-surface text-primary-700 shadow-card' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>

    {error && <p className="text-sm text-danger-600 py-6 text-center">{error.message}</p>}
    {!error && rankings.length === 0 && !isLoading && (
      <p className="text-sm text-neutral-500 py-6 text-center">Chưa có ai ghi điểm trong kỳ này. Hãy là người đầu tiên! 🚀</p>
    )}

    <ol className={`space-y-1.5 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
      {rankings.map((row) => {
        const isMe = row.user_id === currentUserId;
        return (
          <li key={row.user_id}>
            <Link
              to={isMe ? '/profile' : `/users/${row.user_id}`}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-button transition hover:brightness-95 ${isMe ? 'bg-primary-50 ring-1 ring-primary-200' : row.rank <= 3 ? 'bg-accent-50' : 'hover:bg-neutral-50'}`}
            >
            <span className="w-7 text-center text-sm font-bold text-neutral-500">{MEDALS[row.rank] ?? row.rank}</span>
            <Avatar name={row.username} src={row.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {row.username} {isMe && <span className="text-primary-600">(Bạn)</span>}
              </p>
              <p className="text-[11px] text-neutral-500">Lv.{row.level}</p>
            </div>
            <span className="text-sm font-bold text-accent-600">{formatNumber(row.score)} XP</span>
            </Link>
          </li>
        );
      })}
    </ol>

    {me && (
      <p className="mt-4 pt-3 border-t border-neutral-100 text-center text-sm text-primary-700 font-semibold">
        Bạn đang đứng thứ #{formatNumber(me.rank)} · {formatNumber(me.score)} XP 🎯
      </p>
    )}
  </section>
);
