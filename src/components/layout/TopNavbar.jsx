import { NavLink } from 'react-router';
import { useNavItems } from '../../hooks/useNavItems';
import { useSeason } from '../../hooks/useSeason';
import { NotificationBell } from '../../features/notifications';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { ThemeToggle } from '../ThemeToggle';
import { AccountButton } from './AccountButton';
import { SeasonalBadge, SeasonalParticles } from './SeasonalDecor';

const desktopTabClass = ({ isActive }) =>
  `flex items-center gap-2 px-3.5 py-2 rounded-button text-sm font-semibold transition ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
  }`;

// Ô tìm kiếm nằm trong từng trang (nổi trên bản đồ, đầu danh sách Khám phá) => Navbar chỉ còn Logo · Tab (giữa) · Tài khoản.
// Dịp lễ (Tết, Trung thu, Giáng sinh...) => hạt trang trí rơi / bay phía sau nội dung + lời chúc cạnh logo.
export const TopNavbar = () => {
  const navItems = useNavItems();
  const { season, hide } = useSeason();

  return (
    <header className="relative z-40 bg-surface border-b border-neutral-200 shadow-card">
      {season && <SeasonalParticles season={season} />}
      {/* Desktop (≥1024px): 3 cột — 2 cột bên bằng nhau => nhóm tab luôn nằm chính giữa */}
      <div className="relative hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-5 h-16 px-6">
        <div className="justify-self-start flex items-center gap-3 min-w-0">
          <Logo size="md" />
          {season && <SeasonalBadge season={season} onHide={hide} />}
        </div>
        <nav className="flex items-center gap-1" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} className={desktopTabClass}>
              <Icon name={item.icon} className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="justify-self-end flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <AccountButton />
        </div>
      </div>

      {/* Mobile & Tablet (<1024px): tab nằm ở thanh dưới */}
      <div className="relative lg:hidden flex items-center justify-between h-14 px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />
          <AccountButton compact />
        </div>
      </div>
    </header>
  );
};
