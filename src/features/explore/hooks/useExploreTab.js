import { useSearchParams } from 'react-router';
import { DEFAULT_EXPLORE_TAB, EXPLORE_TABS } from '../utils/exploreTabs';

// Tab đang chọn nằm trên URL (?tab=feed) => link từ thông báo mở đúng tab; đổi tab thì bỏ các tham số của tab cũ.
export const useExploreTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const activeTab = EXPLORE_TABS.some((tab) => tab.value === requested) ? requested : DEFAULT_EXPLORE_TAB;
  const setActiveTab = (tab) => setSearchParams(tab === DEFAULT_EXPLORE_TAB ? {} : { tab });
  return { activeTab, setActiveTab };
};
