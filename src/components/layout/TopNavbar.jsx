import { Link, useLocation } from 'react-router';
import { NAVBAR_GRID } from '../../config/layout';
import { BUSINESS_NAV_ITEM, isNavItemActive, NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSeason } from '../../hooks/useSeason';
import { NotificationBell } from '../../features/notifications';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { ThemeToggle } from '../ThemeToggle';
import { AccountButton } from './AccountButton';
import { SeasonalBadge, SeasonalParticles } from './SeasonalDecor';

// 3 tab chính to, chia đều bề rộng nhóm tab; tab đang mở có nền nhạt + gạch chân màu ở mép dưới thanh (kiểu Facebook)
const desktopTabClass = (isActive) =>
  `w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-button text-[15px] font-semibold whitespace-nowrap transition ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 group-hover:bg-neutral-100 group-hover:text-neutral-900'
  }`;

// Nút "Cửa hàng" của chủ doanh nghiệp — tách khỏi nhóm tab giữa để "AI Gợi ý" luôn nằm chính giữa
const BusinessLink = ({ compact = false }) => (
  <Link
    to={BUSINESS_NAV_ITEM.path}
    title="Quản lý cửa hàng"
    className={`shrink-0 inline-flex items-center gap-1.5 rounded-pill border border-secondary-200 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 font-semibold transition ${
      compact ? 'p-2' : 'px-3 py-1.5 text-sm'
    }`}
  >
    <Icon name={BUSINESS_NAV_ITEM.icon} className="w-4.5 h-4.5" />
    {!compact && BUSINESS_NAV_ITEM.label}
  </Link>
);

// Navbar: Logo · Bản đồ / AI Gợi ý / Khám phá (giữa) · Tài khoản. Ô tìm kiếm nằm trong từng trang.
// Dịp lễ (Tết, Trung thu, Giáng sinh...) => hạt trang trí rơi / bay phía sau nội dung + lời chúc cạnh logo.
export const TopNavbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isBusiness = user?.role === 'business';
  const season = useSeason();

  return (
    <header className="relative z-40 bg-surface border-b border-neutral-200 shadow-card">
      {season && <SeasonalParticles season={season} />}
      {/* Desktop (≥1024px): 3 cột — 2 cột bên bằng nhau => nhóm tab luôn nằm chính giữa, rộng bằng cột nội dung giữa */}
      <div className={`relative hidden lg:grid ${NAVBAR_GRID} items-center gap-5 h-16 px-6`}>
        <div className="justify-self-start flex items-center gap-3 min-w-0">
          <Logo size="md" />
          {season && <SeasonalBadge season={season} />}
        </div>
        <nav className="self-stretch w-full flex items-stretch gap-2" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item, pathname);
            return (
              <Link key={item.path} to={item.path} aria-current={isActive ? 'page' : undefined} className="group relative flex-1 min-w-0 flex items-center">
                <span className={desktopTabClass(isActive)}>
                  <Icon name={item.icon} className="w-5 h-5" />
                  {item.label}
                </span>
                {isActive && <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-t-pill bg-primary-600" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>
        <div className="justify-self-end flex items-center gap-2">
          {isBusiness && <BusinessLink />}
          <ThemeToggle />
          <NotificationBell />
          <AccountButton />
        </div>
      </div>

      {/* Mobile & Tablet (<1024px): tab nằm ở thanh dưới */}
      <div className="relative lg:hidden flex items-center justify-between h-14 px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-1.5">
          {isBusiness && <BusinessLink compact />}
          <ThemeToggle />
          <NotificationBell />
          <AccountButton compact />
        </div>
      </div>
    </header>
  );
};
