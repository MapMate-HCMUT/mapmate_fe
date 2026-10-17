import { Link, useLocation } from 'react-router';
import { isNavItemActive, NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../Icon';

const tabClass = (isActive) => `flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-16 text-[11px] font-medium transition ${isActive ? 'text-primary-600' : 'text-neutral-500'}`;

// Thanh dưới trên điện thoại: Bản đồ · Khám phá (nút nổi giữa — trang chủ) · AI Gợi ý
export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { isGuest } = useAuth();
  return (
    <nav
      aria-label="Điều hướng chính"
      className="lg:hidden relative z-40 bg-surface border-t border-neutral-200 flex justify-around items-end px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(item, pathname);
        return (
          <Link key={item.path} to={item.path} aria-current={isActive ? 'page' : undefined} className={tabClass(isActive)}>
            {item.highlight ? (
              <span className="-mt-6 mb-0.5 w-12 h-12 bg-primary-600 rounded-pill flex items-center justify-center text-white shadow-card-hover border-4 border-surface">
                <Icon name={item.icon} className="w-5 h-5" />
              </span>
            ) : (
              <span className="relative">
                <Icon name={item.icon} className="w-6 h-6" />
                {isGuest && item.memberOnly && <Icon name="lock" className="absolute -right-1.5 -bottom-0.5 w-3.5 h-3.5 rounded-pill bg-surface text-neutral-500" />}
              </span>
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
