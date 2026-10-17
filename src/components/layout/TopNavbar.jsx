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
import { SeasonalBadge, SeasonalLogoAccent, SeasonalParticles } from './SeasonalDecor';

// 3 tab chính to, chia đều bề rộng nhóm tab. Tab đang mở: nền mint + viền xanh nhẹ + gạch chân ở mép dưới (kiểu Facebook) —
// nền / gạch chân là 1 khối riêng TRƯỢT sang tab mới khi chuyển tab (không nhảy cụt)
const TAB_GAP_PX = 8;
const desktopTabClass = (isActive) =>
  `relative w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-button text-[15px] font-semibold whitespace-nowrap transition-colors duration-300 ${
    isActive ? 'text-primary-700' : 'text-neutral-600 group-hover:bg-neutral-100 group-hover:text-neutral-900'
  }`;

const ActiveTabIndicator = ({ index, count }) => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-y-0 left-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
    style={{ width: `calc((100% - ${TAB_GAP_PX * (count - 1)}px) / ${count})`, transform: `translateX(calc(${index} * (100% + ${TAB_GAP_PX}px)))` }}
  >
    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-11 rounded-button bg-primary-50 ring-1 ring-primary-200" />
    <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-t-pill bg-primary-600" />
  </span>
);

// Nút "Cửa hàng" của chủ doanh nghiệp — tách khỏi nhóm tab giữa để "Khám phá" luôn nằm chính giữa
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

// Navbar: Logo · Bản đồ / Khám phá (giữa) / AI Gợi ý · Tài khoản. Ô tìm kiếm nằm trong từng trang.
// Dịp lễ (Tết, Trung thu, Giáng sinh...) => hạt trang trí rơi / bay phía sau nội dung + lời chúc cạnh logo.
export const TopNavbar = () => {
  const { pathname } = useLocation();
  const { user, isGuest } = useAuth();
  const isBusiness = user?.role === 'business';
  const season = useSeason();
  const activeIndex = NAV_ITEMS.findIndex((item) => isNavItemActive(item, pathname));

  return (
    <header className="relative z-40 bg-surface border-b border-neutral-200 shadow-card">
      {season && <SeasonalParticles season={season} />}
      {/* Desktop (≥1024px): 3 cột — 2 cột bên bằng nhau => nhóm tab luôn nằm chính giữa, rộng bằng cột nội dung giữa */}
      <div className={`relative hidden lg:grid ${NAVBAR_GRID} items-center gap-5 h-16 px-6`}>
        <div className="justify-self-start flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <Logo size="md" />
            <SeasonalLogoAccent season={season} />
          </div>
          {season && (
            <>
              <SeasonalBadge season={season} className="hidden xl:block min-w-0" />
              <SeasonalBadge season={season} compact className="hidden lg:block xl:hidden" />
            </>
          )}
        </div>
        <nav className="relative self-stretch w-full flex items-stretch gap-2" aria-label="Điều hướng chính">
          {activeIndex >= 0 && <ActiveTabIndicator index={activeIndex} count={NAV_ITEMS.length} />}
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item, pathname);
            return (
              <Link key={item.path} to={item.path} aria-current={isActive ? 'page' : undefined} className="group relative flex-1 min-w-0 flex items-center">
                <span className={desktopTabClass(isActive)}>
                  <Icon name={item.icon} className="w-5 h-5" />
                  {item.label}
                  {isGuest && item.memberOnly && <Icon name="lock" className="w-3.5 h-3.5 text-neutral-400" />}
                </span>
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
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <Logo size="sm" />
            <SeasonalLogoAccent season={season} size="sm" />
          </div>
          {season && <SeasonalBadge season={season} compact />}
        </div>
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
