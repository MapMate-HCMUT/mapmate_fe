import { formatNumber } from '../utils/leaderboard';

export const LevelProgressCard = ({ stats }) => {
  const { level, title, nextLevelXp, progress } = stats.level;
  const percent = Math.round(progress * 100);

  return (
    <section className="bg-surface rounded-card shadow-card p-5">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Kinh nghiệm</p>
          <p className="text-2xl font-extrabold text-neutral-900">
            {formatNumber(stats.xp)} <span className="text-sm font-semibold text-neutral-500">XP</span>
          </p>
        </div>
        <p className="text-sm text-neutral-500">Hạng #{formatNumber(stats.rank)}</p>
      </div>
      <div className="h-3 bg-neutral-100 rounded-pill overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-pill transition-all duration-700" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        {nextLevelXp
          ? `Còn ${formatNumber(nextLevelXp - stats.xp)} XP nữa để lên Lv.${level + 1}`
          : `Bạn đã đạt cấp cao nhất — ${title}! 👑`}
      </p>
    </section>
  );
};
