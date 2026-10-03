import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

/**
 * Bọc 1 hành động chỉ dành cho thành viên (thích, đăng bài, ghim...).
 * Chưa đăng nhập => nhắc và chuyển sang trang đăng nhập, xong quay lại đúng trang này.
 */
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (action) => (...args) => {
      if (isAuthenticated) return action(...args);
      showToast('Bạn cần đăng nhập để dùng tính năng này', 'info');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return undefined;
    },
    [isAuthenticated, showToast, navigate, location.pathname, location.search],
  );
};
