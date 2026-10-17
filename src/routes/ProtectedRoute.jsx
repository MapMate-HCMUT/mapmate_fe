import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { GuestUpgradePrompt } from '../components/GuestUpgradePrompt';
import { useAuth } from '../hooks/useAuth';
import { getSafeRedirect } from '../utils/safeRedirect';

// Chưa đăng nhập => chuyển sang /login, đăng nhập xong quay lại đúng trang này.
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return children;
};

/**
 * Dùng app phải đăng nhập (bảng tin, bản đồ, AI...): khách mở trang chủ => trang giới thiệu (/welcome);
 * mở thẳng 1 trang khác (link được chia sẻ, thông báo) => đăng nhập rồi quay lại đúng trang đó.
 */
export const RequireAuthOutlet = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) return <Outlet />;
  if (location.pathname === '/' && !location.search) return <Navigate to="/welcome" replace />;
  const redirect = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
};

// Tính năng chỉ dành cho thành viên (AI Gợi ý, đăng ký cửa hàng...): tài khoản khách => khối mời đăng nhập Google.
export const MemberOnlyRoute = ({ children, title, description }) => {
  const { isGuest } = useAuth();
  return isGuest ? <GuestUpgradePrompt title={title} description={description} /> : children;
};

// Đã đăng nhập mà vào /login hoặc /register => đi tới ?redirect= (mặc định trang hồ sơ).
export const GuestOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  return isAuthenticated ? <Navigate to={getSafeRedirect(searchParams.get('redirect'))} replace /> : children;
};
