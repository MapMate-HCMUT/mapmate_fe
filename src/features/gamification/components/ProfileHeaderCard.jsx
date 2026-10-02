import { Avatar } from '../../../components/Avatar';
import { Icon } from '../../../components/Icon';
import { formatNumber } from '../utils/leaderboard';
import { PROFILE_AVATAR_OVERLAP, PROFILE_AVATAR_SIZE } from '../utils/profileConfig';
import { formatJoinDate } from '../utils/xpActions';

const STAT_ITEMS = [
  { key: 'stars', label: 'Sao', emoji: '🌟', color: 'text-accent-600' },
  { key: 'checkins', label: 'Check-in', emoji: '📍', color: 'text-info-600' },
  { key: 'reports', label: 'Báo cáo', emoji: '📸', color: 'text-warning-600' },
  { key: 'streak_days', label: 'Streak', emoji: '🔥', color: 'text-danger-500' },
];

// Thẻ đầu trang hồ sơ. `actions` là các nút (Chỉnh sửa, Chia sẻ...) — trang công khai có thể bỏ trống.
// Có `onAvatarClick` (hồ sơ của chính mình) => bấm vào ảnh để đổi ảnh đại diện.
export const ProfileHeaderCard = ({ profile, stats, actions, onAvatarClick }) => {
  const values = { ...stats, reports: stats.flood_reports + stats.road_reports };
  const area = [profile.home_area?.city, profile.home_area?.country].filter(Boolean).join(', ');

  return (
    <section className="bg-surface rounded-card shadow-card overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-primary-500 to-secondary-500" />
      <div className={`px-5 pb-5 ${PROFILE_AVATAR_OVERLAP[PROFILE_AVATAR_SIZE]} text-center`}>
        {onAvatarClick ? (
          <button type="button" onClick={onAvatarClick} aria-label="Đổi ảnh đại diện" title="Đổi ảnh đại diện" className="group relative mx-auto block w-fit rounded-pill">
            <Avatar name={profile.username} src={profile.avatar_url} size={PROFILE_AVATAR_SIZE} className="border-4 border-surface shadow-card" />
            <span className="absolute inset-1 rounded-pill bg-neutral-900/45 text-white flex flex-col items-center justify-center text-xs font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition">
              <Icon name="edit" className="w-5 h-5 mb-0.5" />
              Đổi ảnh
            </span>
            <span className="absolute bottom-1.5 right-1.5 w-9 h-9 rounded-pill bg-primary-600 text-white flex items-center justify-center border-2 border-surface shadow-card" aria-hidden="true">
              📷
            </span>
          </button>
        ) : (
          <Avatar name={profile.username} src={profile.avatar_url} size={PROFILE_AVATAR_SIZE} className="mx-auto border-4 border-surface shadow-card" />
        )}
        <h1 className="mt-3 text-xl font-bold tracking-tight text-neutral-900 break-all">{profile.username}</h1>
        <p className="text-sm font-semibold text-accent-600">
          ⭐ Lv.{stats.level.level} {stats.level.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {area && <>📍 {area} · </>}Tham gia {formatJoinDate(profile.created_at)}
        </p>

        <dl className="grid grid-cols-4 gap-2 mt-5">
          {STAT_ITEMS.map((item) => (
            <div key={item.key} className="rounded-button bg-neutral-50 py-2.5">
              <dd className={`text-lg font-bold ${item.color}`}>{formatNumber(values[item.key])}</dd>
              <dt className="text-[11px] text-neutral-500">
                {item.emoji} {item.label}
              </dt>
            </div>
          ))}
        </dl>

        {actions && <div className="mt-5 grid grid-cols-2 gap-2">{actions}</div>}
      </div>
    </section>
  );
};
