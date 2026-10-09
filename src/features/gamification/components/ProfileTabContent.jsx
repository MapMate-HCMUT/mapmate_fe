import { NotificationsPanel } from '../../notifications';
import { UserPostsSection } from '../../social';
import { AchievementGrid } from './AchievementGrid';
import { LevelProgressCard } from './LevelProgressCard';
import { PersonalInfoCard } from './PersonalInfoCard';
import { XpHistoryCard } from './XpHistoryCard';

// Nội dung theo tab đang chọn trong trang Hồ sơ.
export const ProfileTabContent = ({ activeTab, me, history, onEditPersonalInfo }) => {
  if (activeTab === 'posts') return <UserPostsSection isMe userId={me.profile?.id} />;
  if (activeTab === 'activity') return <XpHistoryCard {...history} onLoadMore={history.loadMore} />;
  if (activeTab === 'notifications') return <NotificationsPanel />;
  if (activeTab === 'personal') return <PersonalInfoCard profile={me.profile} onEdit={onEditPersonalInfo} />;
  return (
    <>
      <LevelProgressCard stats={me.stats} />
      <AchievementGrid achievements={me.achievements} />
    </>
  );
};
