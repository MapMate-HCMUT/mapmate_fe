import { useSearchParams } from 'react-router';
import { DEFAULT_PROFILE_TAB, PROFILE_TABS } from '../utils/profileConfig';

// Tab đang chọn nằm trên URL (?tab=notifications) => link từ chuông thông báo mở đúng tab.
export const useProfileTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const activeTab = PROFILE_TABS.some((tab) => tab.value === requested) ? requested : DEFAULT_PROFILE_TAB;

  const setActiveTab = (tab) => setSearchParams(tab === DEFAULT_PROFILE_TAB ? {} : { tab }, { replace: true });
  return { activeTab, setActiveTab };
};
