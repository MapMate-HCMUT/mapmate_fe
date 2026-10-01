import { Link } from 'react-router';
import { useAccountMenu } from '../../hooks/useAccountMenu';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';

const itemClass = 'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-input text-sm font-medium transition';

// Góc phải Navbar: chưa đăng nhập => nút "Đăng nhập"; đã đăng nhập => avatar + menu (Hồ sơ, Đăng xuất).
export const AccountButton = ({ compact = false }) => {
  const { user, isAuthenticated, menu, menuRef, handleLogout } = useAccountMenu();

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className={`shrink-0 rounded-button bg-primary-600 hover:bg-primary-700 text-white font-semibold transition ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
      >
        Đăng nhập
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={menu.toggle}
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        className="flex items-center gap-2 rounded-pill p-0.5 hover:bg-neutral-100 transition"
      >
        <Avatar name={user?.username} src={user?.avatar_url} size="sm" />
        {!compact && (
          <span className="text-left leading-tight">
            <span className="block text-sm font-semibold text-neutral-800 max-w-28 truncate">{user?.username}</span>
            <span className="block text-[11px] text-accent-600 font-medium">Lv.{user?.level}</span>
          </span>
        )}
        {!compact && <Icon name="chevronDown" className="w-4 h-4 mr-1 text-neutral-400" />}
      </button>

      {menu.isOpen && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-card shadow-modal border border-neutral-100 p-1.5 z-50">
          <div className="px-3 py-2 border-b border-neutral-100 mb-1">
            <p className="text-sm font-semibold text-neutral-900 truncate">{user?.username}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
          </div>
          <Link to="/profile" role="menuitem" onClick={menu.close} className={`${itemClass} text-neutral-700 hover:bg-neutral-100`}>
            <Icon name="user" className="w-4.5 h-4.5 text-neutral-400" />
            Hồ sơ của tôi
          </Link>
          <button type="button" role="menuitem" onClick={handleLogout} className={`${itemClass} text-danger-600 hover:bg-danger-50`}>
            <Icon name="logout" className="w-4.5 h-4.5" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};
