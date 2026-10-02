import { useProfilePage } from '../hooks/useProfilePage';
import { AccountSettingsCard } from './AccountSettingsCard';
import { AvatarEditorModal } from './AvatarEditorModal';
import { ChangePasswordModal } from './ChangePasswordModal';
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
  const { me, leaderboard, tab, editProfile, avatarEditor, personalInfo, changePassword } = page;

  return (
    <section className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="w-full max-w-5xl mx-auto p-4 lg:p-6">
        {me.isLoading && !me.profile && <ProfileSkeleton />}
        {me.error && !me.profile && <ProfileError message={me.error.message} onRetry={me.reload} />}
        {me.profile && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
            <div className="space-y-5 min-w-0">
              <ProfileHeaderCard
                profile={me.profile}
                stats={me.stats}
                onAvatarClick={avatarEditor.openEditor}
                actions={<ProfileActions onEdit={editProfile.openEditor} onShare={page.share} />}
              />
              <ProfileTabs activeTab={tab.activeTab} onChange={tab.setActiveTab} unreadCount={page.unreadCount} />
              <ProfileTabContent activeTab={tab.activeTab} me={me} history={page.history} onEditPersonalInfo={personalInfo.openEditor} />
            </div>
            <div className="space-y-5 lg:sticky lg:top-0">
              <LeaderboardCard
                period={leaderboard.period}
                onPeriodChange={leaderboard.setPeriod}
                rankings={leaderboard.rankings}
                me={leaderboard.me}
                currentUserId={me.profile.id}
                isLoading={leaderboard.isLoading}
                error={leaderboard.error}
              />
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
      <PersonalInfoModal editor={personalInfo} />
      <ChangePasswordModal
        modal={changePassword.modal}
        values={changePassword.values}
        errors={changePassword.errors}
        isSubmitting={changePassword.isSubmitting}
        onChange={changePassword.handleChange}
        onSubmit={changePassword.handleSubmit}
      />
    </section>
  );
};
