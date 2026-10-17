import { Link, useLocation, useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DEFAULT_TITLE = 'AI Gợi ý dành cho thành viên';
const DEFAULT_DESCRIPTION = 'Bạn đang dùng tài khoản khách nên chưa dùng được AI (lập lộ trình, hỏi đáp, nhập bằng giọng nói). Đăng nhập bằng Google để mở khoá.';

// Tài khoản khách mở tính năng chỉ dành cho thành viên => mời đăng nhập Google.
// Khách đang "đã đăng nhập" nên phải thoát phiên khách trước, rồi mới vào /login (GuestOnlyRoute) và quay lại đúng trang này.
export const GuestUpgradePrompt = ({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleUpgrade = () => {
    logout();
    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
  };

  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-surface rounded-card shadow-card p-8 text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-pill bg-primary-50 text-primary-600 flex items-center justify-center" aria-hidden="true">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
        <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2">
          <button type="button" onClick={handleUpgrade} className="px-6 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs">
            Đăng nhập bằng Google
          </button>
          <Link to="/" className="px-6 py-2.5 rounded-button text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
            Tiếp tục khám phá
          </Link>
        </div>
        <p className="mt-4 text-xs text-neutral-400">Hoạt động của tài khoản khách (check-in, lộ trình đã lưu...) không chuyển sang tài khoản Google.</p>
      </div>
    </div>
  );
};
