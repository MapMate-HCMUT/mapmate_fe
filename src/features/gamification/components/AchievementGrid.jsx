export const AchievementGrid = ({ achievements }) => {
  const unlockedCount = achievements.filter((badge) => badge.unlocked).length;

  return (
    <section className="bg-surface rounded-card shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-neutral-900">🎖️ Thành tích</h2>
        <span className="text-xs font-semibold text-neutral-500">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((badge) => (
          <li
            key={badge.code}
            title={badge.description}
            className={`p-3 rounded-button border text-center ${
              badge.unlocked ? 'bg-accent-50 border-accent-200' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <span className={`text-3xl inline-block ${badge.unlocked ? '' : 'grayscale opacity-40'}`} aria-hidden="true">
              {badge.icon}
            </span>
            <p className="mt-1 text-xs font-semibold text-neutral-800 leading-tight">{badge.name}</p>
            <p className="mt-0.5 text-[11px] text-neutral-500 leading-snug">{badge.description}</p>
            {badge.unlocked ? (
              <p className="mt-1 text-[11px] text-accent-700 font-medium">+{badge.xp_reward} XP</p>
            ) : (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 bg-neutral-200 rounded-pill overflow-hidden">
                  <div className="h-full bg-primary-400" style={{ width: `${(badge.progress / badge.threshold) * 100}%` }} />
                </div>
                <p className="text-[11px] text-neutral-500">
                  {badge.progress}/{badge.threshold}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
