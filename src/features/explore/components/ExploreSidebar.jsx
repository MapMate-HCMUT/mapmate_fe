import { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ChevronRight, Store } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { useAuth } from '../../../hooks/useAuth';
import { EXPLORE_GROUPS, EXPLORE_SECTIONS } from '../utils/exploreSections';

const itemClass = ({ isActive }) =>
  `group flex items-center gap-3 px-2.5 py-2 rounded-button transition ${isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100'}`;

const SectionLink = ({ section }) => {
  const SectionIcon = section.icon;
  return (
    <NavLink to={section.path} end={section.end} className={itemClass}>
      {({ isActive }) => (
        <>
          <span className={`w-9 h-9 shrink-0 rounded-pill flex items-center justify-center transition ${isActive ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 group-hover:bg-surface'}`}>
            <SectionIcon className="w-4.5 h-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">{section.label}</span>
            <span className={`block text-[11px] leading-tight truncate ${isActive ? 'text-primary-700' : 'text-neutral-500'}`}>{section.hint}</span>
          </span>
        </>
      )}
    </NavLink>
  );
};

// Thẻ hồ sơ đầu cột (giống Facebook); khách => mời đăng nhập
const ProfileCard = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <div className="rounded-card bg-surface shadow-card p-3.5">
        <p className="text-sm font-semibold text-neutral-900">Chào bạn 👋</p>
        <p className="mt-0.5 text-xs text-neutral-500">Đăng nhập để lưu lộ trình, săn voucher và kết bạn.</p>
        <Link to="/login" className="mt-2.5 block text-center py-2 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
          Đăng nhập
        </Link>
      </div>
    );
  }
  return (
    <NavLink
      to="/profile"
      className={({ isActive }) =>
        `flex items-center gap-3 p-2.5 rounded-card transition ${isActive ? 'bg-primary-50 ring-1 ring-primary-200' : 'bg-surface shadow-card hover:bg-neutral-50'}`
      }
    >
      <Avatar name={user?.username} src={user?.avatar_url} size="md" />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-neutral-900 truncate">{user?.username}</span>
        <span className="block text-[11px] text-neutral-500">{user?.role === 'business' ? 'Doanh nghiệp' : `Lv.${user?.level ?? 1}`} · Xem hồ sơ</span>
      </span>
      <ChevronRight className="w-4 h-4 text-neutral-400" aria-hidden="true" />
    </NavLink>
  );
};

/** Cột trái của trang Khám phá (desktop): hồ sơ · nhóm Khám phá · nhóm Của bạn */
export const ExploreSidebar = () => {
  const { user } = useAuth();
  return (
    <nav aria-label="Các mục khám phá" className="space-y-5">
      <ProfileCard />
      {EXPLORE_GROUPS.map((group) => (
        <div key={group.value}>
          <p className="px-2.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">{group.label}</p>
          <div className="space-y-0.5">
            {EXPLORE_SECTIONS.filter((section) => section.group === group.value && !section.isProfile).map((section) => (
              <SectionLink key={section.path} section={section} />
            ))}
          </div>
        </div>
      ))}
      {user?.role !== 'business' && (
        <Link to="/for-business" className="flex items-center gap-2 px-2.5 py-2 rounded-button text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800">
          <Store className="w-4 h-4" aria-hidden="true" /> Bạn có cửa hàng? Đưa lên MapMate
        </Link>
      )}
    </nav>
  );
};

/** Điện thoại / máy tính bảng: các mục thành hàng nút cuộn ngang ở đầu trang (tự cuộn tới mục đang mở) */
export const ExploreMobileNav = () => {
  const navRef = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector('[aria-current="page"]');
    if (active) nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.clientWidth) / 2, behavior: 'smooth' });
  }, [pathname]);

  return (
    <nav ref={navRef} aria-label="Các mục khám phá" className="-mx-4 px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-none">
      {EXPLORE_SECTIONS.map((section) => {
        const SectionIcon = section.icon;
        return (
          <NavLink
            key={section.path}
            to={section.path}
            end={section.end}
            className={({ isActive }) =>
              `shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-sm font-semibold transition ${
                isActive ? 'bg-primary-600 text-white shadow-card' : 'bg-surface text-neutral-700 shadow-card'
              }`
            }
          >
            <SectionIcon className="w-4 h-4" aria-hidden="true" />
            {section.label}
          </NavLink>
        );
      })}
    </nav>
  );
};
