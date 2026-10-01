import { useAuthStore } from '../stores/authStore';

// Trạng thái đăng nhập dùng ở mọi nơi (Navbar, ProtectedRoute...).
export const useAuth = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  return { user, isAuthenticated: Boolean(token), logout: clearSession };
};
