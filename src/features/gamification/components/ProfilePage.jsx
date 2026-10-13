import { EXPLORE_GRID, EXPLORE_MAIN } from '../../../config/layout';
import { BusinessProfileCard } from '../../business';
import { useProfilePage } from '../hooks/useProfilePage';
import { AccountSettingsCard } from './AccountSettingsCard';
import { AvatarEditorModal } from './AvatarEditorModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { CoverEditorModal } from './CoverEditorModal';
import { EditProfileModal } from './EditProfileModal';
import { LeaderboardCard } from './LeaderboardCard';
import { PersonalInfoModal } from './PersonalInfoModal';
import { ProfileActions } from './ProfileActions';
import { ProfileHeaderCard } from './ProfileHeaderCard';
import { ProfileError, ProfileSkeleton } from './ProfileSkeleton';
import { ProfileTabContent } from './ProfileTabContent';
import { ProfileTabs } from './ProfileTabs';

export const ProfilePage = () => {
  const page = useProfilePage();
  const { me, leaderboard, tab, editProfile, avatarEditor, coverEditor, personalInfo, changePassword } = page;

  return (
    // Nằm trong trang Khám phá (ExploreLayout lo cuộn + lề) — mục "Hồ sơ" ở cột trái
    <>
      <div>
        {me.isLoading && !me.profile && <ProfileSkeleton />}
        {me.error && !me.profile && <ProfileError error={me.error} onRetry={me.reload} />}
        {me.profile && (
          <div className={EXPLORE_GRID}>
            <div className={`${EXPLORE_MAIN} space-y-5`}>
              <ProfileHeaderCard
                profile={me.profile}
                stats={me.stats}
                onAvatarClick={avatarEditor.openEditor}
                onCoverClick={coverEditor.openEditor}
                actions={<ProfileActions onEdit={editProfile.openEditor} onShare={page.share} />}
              />
              <ProfileTabs activeTab={tab.activeTab} onChange={tab.setActiveTab} unreadCount={page.unreadCount} />
              <ProfileTabContent activeTab={tab.activeTab} me={me} history={page.history} onEditPersonalInfo={personalInfo.openEditor} />
            </div>
            <div className="space-y-5 xl:sticky xl:top-6">
              <LeaderboardCard
                period={leaderboard.period}
                onPeriodChange={leaderboard.setPeriod}
                rankings={leaderboard.rankings}
                me={leaderboard.me}
                currentUserId={me.profile.id}
                isLoading={leaderboard.isLoading}
                error={leaderboard.error}
                onRetry={leaderboard.reload}
              />
              <BusinessProfileCard role={me.profile.role} />
              <AccountSettingsCard
                onEditProfile={editProfile.openEditor}
                onEditAvatar={avatarEditor.openEditor}
                onEditPersonalInfo={personalInfo.openEditor}
                onChangePassword={changePassword.openDialog}
                onLogout={page.logout}
              />
            </div>
          </div>
        )}
      </div>

      <EditProfileModal editor={editProfile} />
      <AvatarEditorModal editor={avatarEditor} username={me.profile?.username} />
      <CoverEditorModal editor={coverEditor} />
      <PersonalInfoModal editor={personalInfo} />
      <ChangePasswordModal
        modal={changePassword.modal}
        values={changePassword.values}
        errors={changePassword.errors}
        isSubmitting={changePassword.isSubmitting}
        onChange={changePassword.handleChange}
        onSubmit={changePassword.handleSubmit}
      />
    </>
  );
};
