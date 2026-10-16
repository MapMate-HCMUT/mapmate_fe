import { Link } from 'react-router';
import { EXPLORE_GRID, EXPLORE_MAIN } from '../../../config/layout';
import { useAuthStore } from '../../../stores/authStore';
import { FriendActionButton, UserPinsSection, UserPostsSection } from '../../social';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { AchievementGrid } from './AchievementGrid';
import { LeaderboardCard } from './LeaderboardCard';
import { LevelProgressCard } from './LevelProgressCard';
import { ProfileHeaderCard } from './ProfileHeaderCard';
import { ProfileError, ProfileSkeleton } from './ProfileSkeleton';

const linkClass = 'col-span-2 flex items-center justify-center py-2.5 rounded-button text-sm font-semibold transition';

// Hồ sơ công khai /users/:userId — mở từ link chia sẻ hoặc bảng xếp hạng (nằm trong trang Khám phá).
export const PublicProfilePage = () => {
  const { profile, stats, achievements, relationship, isMe, error, isLoading, reload } = usePublicProfile();
  const leaderboard = useLeaderboard();
  const myId = useAuthStore((state) => state.user?.id);

  return (
    <div>
      {isLoading && !profile && <ProfileSkeleton />}
      {error && !profile && <ProfileError error={error} onRetry={reload} />}
      {profile && (
        <div className={EXPLORE_GRID}>
          <div className={`${EXPLORE_MAIN} space-y-5`}>
            <ProfileHeaderCard
              profile={profile}
              stats={stats}
              actions={
                isMe ? (
                  <Link to="/profile" className={`${linkClass} bg-primary-100 hover:bg-primary-200 text-primary-700`}>
                    Đây là hồ sơ của bạn — mở trang quản lý
                  </Link>
                ) : (
                  <div className="col-span-2 flex flex-wrap items-center justify-center gap-3">
                    <FriendActionButton key={relationship?.status ?? 'guest'} userId={profile.id} relationship={relationship} />
                    <Link to="/feed" className="px-3 py-1.5 rounded-button text-xs font-semibold bg-primary-100 hover:bg-primary-200 text-primary-700">
                      Xem bảng tin
                    </Link>
                  </div>
                )
              }
            />
            <LevelProgressCard stats={stats} />
            <AchievementGrid achievements={achievements} />
            <UserPinsSection userId={profile.id} />
            <UserPostsSection userId={profile.id} isMe={isMe} />
          </div>

          <div className="space-y-5 xl:sticky xl:top-6">
            <LeaderboardCard
              period={leaderboard.period}
              onPeriodChange={leaderboard.setPeriod}
              rankings={leaderboard.rankings}
              me={leaderboard.me}
              currentUserId={myId}
              isLoading={leaderboard.isLoading}
              error={leaderboard.error}
              onRetry={leaderboard.reload}
            />
          </div>
        </div>
      )}
    </div>
  );
};
