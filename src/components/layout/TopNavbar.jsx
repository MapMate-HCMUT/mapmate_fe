import { NavLink } from 'react-router';
import { NAV_ITEMS } from '../../config/navigation';
import { NotificationBell } from '../../features/notifications';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { SearchBar } from '../SearchBar';
import { AccountButton } from './AccountButton';

const desktopTabClass = ({ isActive }) =>
  `flex items-center gap-2 px-3.5 py-2 rounded-button text-sm font-semibold transition ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
  }`;

export const TopNavbar = () => {
  const { query, setQuery, clearQuery, submitSearch } = useGlobalSearch();

  return (
    <header className="relative z-40 bg-surface border-b border-neutral-200 shadow-card">
      {/* Desktop (≥1024px): Logo · Search · Tabs */}
      <div className="hidden lg:flex items-center gap-5 h-16 px-6">
        <Logo size="md" />
        <div className="flex-1 max-w-xl">
          <SearchBar value={query} onChange={setQuery} onClear={clearQuery} onSubmit={submitSearch} />
        </div>
        <nav className="ml-auto flex items-center gap-1" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} className={desktopTabClass}>
              <Icon name={item.icon} className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NotificationBell />
        <AccountButton />
      </div>

      {/* Mobile & Tablet (<1024px): Logo trên, Search dưới */}
      <div className="lg:hidden px-4 pt-3 pb-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <AccountButton compact />
          </div>
        </div>
        <SearchBar value={query} onChange={setQuery} onClear={clearQuery} onSubmit={submitSearch} />
      </div>
    </header>
  );
};
