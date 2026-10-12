import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

// Nút đổi nền sáng ↔ tối (Navbar, trang quản lý cửa hàng, trang đăng nhập)
export const ThemeToggle = ({ className = '' }) => {
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
      title={isDark ? 'Nền sáng' : 'Nền tối'}
      className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-pill text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition ${className}`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};
