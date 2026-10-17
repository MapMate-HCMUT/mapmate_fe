import { GUEST_ROLE } from '../config/auth';
import { useAuthStore } from '../stores/authStore';

// Trạng thái đăng nhập dùng ở mọi nơi (Navbar, ProtectedRoute...). isGuest = tài khoản khách (bị khoá AI).
export const useAuth = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  return { user, isAuthenticated: Boolean(token), isGuest: user?.role === GUEST_ROLE, logout: clearSession };
};
