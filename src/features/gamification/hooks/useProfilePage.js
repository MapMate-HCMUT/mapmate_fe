import { useUnreadCount } from '../../notifications';
import { useAvatarEditor } from './useAvatarEditor';
import { useChangePassword } from './useChangePassword';
import { useEditProfile } from './useEditProfile';
import { useLeaderboard } from './useLeaderboard';
import { useLogout } from './useLogout';
import { useMyProfile } from './useMyProfile';
import { usePersonalInfo } from './usePersonalInfo';
import { useProfileTab } from './useProfileTab';
import { useShareProfile } from './useShareProfile';
import { useXpHistory } from './useXpHistory';

// Gom toàn bộ logic trang Hồ sơ của chính mình — component chỉ việc hiển thị.
export const useProfilePage = () => {
  const me = useMyProfile();
  const leaderboard = useLeaderboard();
  const refreshAll = () => {
    me.reload();
    leaderboard.reload();
  };

  return {
    me,
    leaderboard,
    tab: useProfileTab(),
    unreadCount: useUnreadCount(),
    history: useXpHistory(me.profile?.id),
    editProfile: useEditProfile(me.profile, refreshAll),
    avatarEditor: useAvatarEditor(me.profile, refreshAll),
    personalInfo: usePersonalInfo(me.profile, me.reload),
    changePassword: useChangePassword(),
    share: useShareProfile(me.profile ?? {}),
    logout: useLogout(),
  };
};
