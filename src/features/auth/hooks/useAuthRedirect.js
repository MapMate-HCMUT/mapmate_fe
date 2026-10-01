import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { getSafeRedirect } from '../../../utils/safeRedirect';

// Sau khi đăng nhập quay lại trang người dùng định vào (?redirect=/profile?tab=personal).
export const useAuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTo = getSafeRedirect(searchParams.get('redirect'));

  const goToRedirect = useCallback(() => navigate(redirectTo, { replace: true }), [navigate, redirectTo]);
  return { redirectTo, goToRedirect };
};
