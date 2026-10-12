import { getNavItems } from '../config/navigation';
import { useAuth } from './useAuth';

// Tab điều hướng theo vai trò: chủ doanh nghiệp có thêm tab "Cửa hàng"
export const useNavItems = (options) => {
  const { user } = useAuth();
  return getNavItems(user?.role, options);
};
