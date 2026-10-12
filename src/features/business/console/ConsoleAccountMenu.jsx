import { Link } from 'react-router';
import { Building2, ChevronDown, Crown, LogOut, Map, UserRound } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { tierStyle } from '../utils/businessConfig';

const itemClass = 'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-input text-sm font-medium transition';

// Avatar góc phải trang quản lý: bấm mở menu tài khoản (hồ sơ doanh nghiệp, gói, hồ sơ cá nhân, xem như khách, đăng xuất)
export const ConsoleAccountMenu = ({ user, data, onLogout }) => {
  const { containerRef, isOpen, toggle, close } = useDisclosure();
  const style = tierStyle(data.tier.value);
  const items = [
    { to: '/business/settings', icon: Building2, label: 'Hồ sơ doanh nghiệp' },
    { to: '/business/plans', icon: Crown, label: `Gói dịch vụ · ${data.tier.label}` },
    { to: '/profile', icon: UserRound, label: 'Hồ sơ cá nhân' },
    { to: '/', icon: Map, label: 'Xem MapMate như khách' },
  ];

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Tài khoản"
        className="flex items-center gap-2 rounded-pill p-0.5 pr-1 hover:bg-neutral-100 transition"
      >
        <Avatar name={user?.username} src={user?.avatar_url} size="sm" />
        <span className="hidden md:block text-left leading-tight">
          <span className="block text-sm font-semibold text-neutral-800 max-w-32 truncate">{user?.username}</span>
          <span className="block text-[11px] text-neutral-500 max-w-32 truncate">{data.business.name}</span>
        </span>
        <ChevronDown className={`hidden md:block w-4 h-4 text-neutral-400 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-card shadow-modal border border-neutral-100 p-1.5 z-50">
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-neutral-100 mb-1">
            <Avatar name={user?.username} src={user?.avatar_url} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{user?.username}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-neutral-600 truncate">
                <span aria-hidden="true">{style.emoji}</span> {data.business.name}
              </p>
            </div>
          </div>
          {items.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} role="menuitem" onClick={close} className={`${itemClass} text-neutral-700 hover:bg-neutral-100`}>
              <Icon className="w-4.5 h-4.5 text-neutral-400" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <div className="my-1 border-t border-neutral-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onLogout();
            }}
            className={`${itemClass} text-danger-600 hover:bg-danger-50`}
          >
            <LogOut className="w-4.5 h-4.5" aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};
