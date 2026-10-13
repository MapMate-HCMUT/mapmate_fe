import { NavLink } from 'react-router';
import { useNavItems } from '../../hooks/useNavItems';
import { Icon } from '../Icon';

const tabClass = ({ isActive }) =>
  `flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-14 text-[11px] font-medium transition ${
    isActive ? 'text-primary-600' : 'text-neutral-500'
  }`;

export const MobileBottomNav = () => {
  const navItems = useNavItems({ compact: true });
  return (
    <nav
      aria-label="Điều hướng chính"
      className="lg:hidden relative z-40 bg-surface border-t border-neutral-200 flex justify-around items-end px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.end} className={tabClass}>
          {item.highlight ? (
            <span className="-mt-6 mb-0.5 w-12 h-12 bg-primary-600 rounded-pill flex items-center justify-center text-white shadow-card-hover border-4 border-surface">
              <Icon name={item.icon} className="w-5 h-5" />
            </span>
          ) : (
            <Icon name={item.icon} className="w-6 h-6" />
          )}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
