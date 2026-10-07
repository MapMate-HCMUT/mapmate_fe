import { Link } from 'react-router';
import { FriendActionButton, UserPinsSection } from '../../social';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { AchievementGrid } from './AchievementGrid';
import { LevelProgressCard } from './LevelProgressCard';
import { ProfileHeaderCard } from './ProfileHeaderCard';
import { ProfileError, ProfileSkeleton } from './ProfileSkeleton';

const linkClass = 'col-span-2 flex items-center justify-center py-2.5 rounded-button text-sm font-semibold transition';

// Hồ sơ công khai /users/:userId — mở từ link chia sẻ hoặc bảng xếp hạng.
export const PublicProfilePage = () => {
  const { profile, stats, achievements, relationship, isMe, error, isLoading, reload } = usePublicProfile();

  return (
    <section className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="w-full max-w-2xl mx-auto p-4 lg:p-6 space-y-5">
        {isLoading && !profile && <ProfileSkeleton />}
        {error && !profile && <ProfileError error={error} onRetry={reload} />}
        {profile && (
          <>
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
                    <Link to="/explore?tab=feed" className="px-3 py-1.5 rounded-button text-xs font-semibold bg-primary-100 hover:bg-primary-200 text-primary-700">
                      Xem bảng tin
                    </Link>
                  </div>
                )
              }
            />
            <LevelProgressCard stats={stats} />
            <AchievementGrid achievements={achievements} />
            <UserPinsSection userId={profile.id} />
          </>
        )}
      </div>
    </section>
  );
};
