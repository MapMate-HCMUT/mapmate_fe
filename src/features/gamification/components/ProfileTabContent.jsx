import { NotificationsPanel } from '../../notifications';
import { AchievementGrid } from './AchievementGrid';
import { LevelProgressCard } from './LevelProgressCard';
import { PersonalInfoCard } from './PersonalInfoCard';
import { XpHistoryCard } from './XpHistoryCard';

// Nội dung theo tab đang chọn trong trang Hồ sơ.
export const ProfileTabContent = ({ activeTab, me, history, onEditPersonalInfo }) => {
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
