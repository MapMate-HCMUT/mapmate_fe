import { FeedTab, FriendsTab, PostComposerModal } from '../../social';
import { useExploreTab } from '../hooks/useExploreTab';
import { EXPLORE_TABS } from '../utils/exploreTabs';
import { MineTab } from './MineTab';
import { PlacesTab } from './PlacesTab';

const TAB_CONTENT = { places: PlacesTab, feed: FeedTab, friends: FriendsTab, mine: MineTab };

// Trang /explore: bộ lọc địa điểm + lên lộ trình, và mạng xã hội (bảng tin, bạn bè, sổ tay).
export const ExplorePage = () => {
  const { activeTab, setActiveTab } = useExploreTab();
  const ActiveTab = TAB_CONTENT[activeTab];

  return (
    <section className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-5">
        <div role="tablist" aria-label="Khám phá" className="grid grid-cols-4 gap-1 p-1 bg-surface rounded-card shadow-card">
          {EXPLORE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-2 sm:py-2.5 rounded-button text-xs sm:text-sm font-semibold transition ${
                activeTab === tab.value ? 'bg-primary-600 text-white shadow-card' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span aria-hidden="true">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <ActiveTab />
      </div>
      <PostComposerModal />
    </section>
  );
};
