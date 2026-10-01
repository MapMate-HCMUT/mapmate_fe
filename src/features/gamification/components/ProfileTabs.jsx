import { PROFILE_TABS } from '../utils/profileConfig';

export const ProfileTabs = ({ activeTab, onChange, unreadCount }) => (
  <div role="tablist" aria-label="Mục hồ sơ" className="flex gap-1 p-1 bg-surface rounded-card shadow-card overflow-x-auto scrollbar-none">
    {PROFILE_TABS.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={activeTab === tab.value}
        onClick={() => onChange(tab.value)}
        className={`relative flex-1 shrink-0 whitespace-nowrap px-3 py-2 rounded-button text-sm font-semibold transition ${
          activeTab === tab.value ? 'bg-primary-600 text-white shadow-card' : 'text-neutral-600 hover:bg-neutral-100'
        }`}
      >
        <span aria-hidden="true">{tab.emoji}</span> {tab.label}
        {tab.value === 'notifications' && unreadCount > 0 && (
          <span className="ml-1.5 inline-flex min-w-5 h-5 px-1 items-center justify-center rounded-pill bg-danger-500 text-white text-[10px] font-bold">{unreadCount}</span>
        )}
      </button>
    ))}
  </div>
);
