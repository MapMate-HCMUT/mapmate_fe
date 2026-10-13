import { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { ErrorBoundary } from '../../../app/ErrorBoundary';
import { ErrorState } from '../../../components/ErrorState';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { Toast } from '../../../components/Toast';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { NotificationBell } from '../../notifications';
import { TierBadge } from '../components/TierBadge';
import { useMyBusiness } from '../hooks/useMyBusiness';
import { ConsoleAccountMenu } from './ConsoleAccountMenu';
import { consoleTitle } from './consoleNav';
import { ConsoleSidebar } from './ConsoleSidebar';

// Khung trang quản lý của chủ doanh nghiệp (/business/*): menu riêng, không dùng thanh điều hướng của người dùng thường.
// Các trang con lấy dữ liệu doanh nghiệp qua useOutletContext() => { data, reload }.
export const BusinessConsoleLayout = () => {
  const { isAuthenticated } = useAuth();
  // Khách chưa đăng nhập => sang trang giới thiệu luôn, không gọi API hồ sơ doanh nghiệp
  return isAuthenticated ? <ConsoleShell /> : <Navigate to="/for-business" replace />;
};

const ConsoleShell = () => {
  const { user, logout } = useAuth();
  const business = useMyBusiness();
  const { toast, showToast, hideToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (business.isNotBusiness) return <Navigate to="/for-business" replace />;

  const handleLogout = () => {
    logout();
    showToast('Đã đăng xuất', 'info');
    navigate('/', { replace: true });
  };

  if (!business.data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-neutral-100 p-4">
        {business.error ? <ErrorState error={business.error} onRetry={business.reload} /> : <span className="w-8 h-8 rounded-pill border-4 border-primary-200 border-t-primary-600 animate-spin" aria-label="Đang tải" />}
      </div>
    );
  }

  const { data, reload } = business;
  return (
    <div className="h-dvh flex bg-neutral-100">
      <aside className="hidden lg:block w-64 shrink-0">
        <ConsoleSidebar data={data} onLogout={handleLogout} />
      </aside>

      {/* Mobile: menu trượt từ trái */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Menu quản lý">
          <div className="w-72 max-w-[85vw] h-full shadow-modal animate-[sheet-up_200ms_ease-out]">
            <ConsoleSidebar data={data} onNavigate={() => setIsMenuOpen(false)} onLogout={handleLogout} />
          </div>
          <button type="button" className="flex-1 bg-ink/50" aria-label="Đóng menu" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 lg:h-16 shrink-0 bg-surface border-b border-neutral-200 flex items-center gap-3 px-3 lg:px-6">
          <button type="button" onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 -ml-1 rounded-lg text-neutral-600 hover:bg-neutral-100" aria-label="Mở menu">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="flex-1 min-w-0 truncate text-base lg:text-lg font-bold text-neutral-900">{consoleTitle(pathname)}</h1>
          <TierBadge tier={data.tier.value} className="hidden sm:inline-flex" />
          <ThemeToggle />
          <NotificationBell />
          <ConsoleAccountMenu user={user} data={data} onLogout={handleLogout} />
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto p-4 lg:p-6">
            <ErrorBoundary key={pathname}>
              <Outlet context={{ data, reload }} />
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};
