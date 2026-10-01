import { useNavigate } from 'react-router';
import { useAuth } from './useAuth';
import { useDisclosure } from './useDisclosure';
import { useToast } from './useToast';

// Menu tài khoản trên Navbar: mở/đóng + đăng xuất.
export const useAccountMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { containerRef: menuRef, ...menu } = useDisclosure();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    menu.close();
    logout();
    showToast('Đã đăng xuất', 'info');
    navigate('/', { replace: true });
  };

  return { user, isAuthenticated, menu, menuRef, handleLogout };
};
