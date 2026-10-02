import { useNavigate } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

export const useLogout = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  return () => {
    logout();
    showToast('Đã đăng xuất', 'info');
    navigate('/', { replace: true });
  };
};
