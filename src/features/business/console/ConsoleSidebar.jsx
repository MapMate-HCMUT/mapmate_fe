import { Link, NavLink } from 'react-router';
import { LogOut, Map } from 'lucide-react';
import { BRAND } from '../../../config/app';
import { tierStyle } from '../utils/businessConfig';
import { CONSOLE_NAV } from './consoleNav';

const itemClass = ({ isActive }) =>
  `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
  }`;

// Cột menu tối màu của trang quản lý — tách hẳn khỏi giao diện người dùng thường
export const ConsoleSidebar = ({ data, onNavigate, onLogout }) => {
  const style = tierStyle(data.tier.value);
  return (
    <div data-theme="light" className="h-full flex flex-col bg-ink text-white">
      <Link to="/business" onClick={onNavigate} className="flex items-center gap-2.5 px-5 h-16 shrink-0 border-b border-white/10">
        <img src={BRAND.logoSrc} alt="" className="w-8 h-8" />
        <span className="leading-tight">
          <span className="block text-base font-extrabold tracking-tight">{BRAND.name}</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-accent-400">Business</span>
        </span>
      </Link>

      <div className="mx-3 mt-4 rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
        <p className="text-sm font-bold truncate" title={data.business.name}>{data.business.name}</p>
        <p className="mt-0.5 text-xs text-white/60">
          <span aria-hidden="true">{style.emoji}</span> Gói {data.tier.label} · {data.usage.places}/{data.usage.max_places} cửa hàng
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Quản lý doanh nghiệp">
        {CONSOLE_NAV.map(({ path, label, icon: Icon, end, badge }) => {
          const count = badge?.(data) ?? 0;
          return (
            <NavLink key={path} to={path} end={end} onClick={onNavigate} className={itemClass}>
              <Icon className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">{label}</span>
              {count > 0 && <span className="min-w-5 px-1.5 py-0.5 rounded-pill bg-danger-500 text-white text-[10px] font-bold text-center">{count > 99 ? '99+' : count}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white">
          <Map className="w-4.5 h-4.5" aria-hidden="true" /> Xem MapMate như khách
        </Link>
        <button type="button" onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-danger-500/10 hover:text-danger-300">
          <LogOut className="w-4.5 h-4.5" aria-hidden="true" /> Đăng xuất
        </button>
      </div>
    </div>
  );
};
