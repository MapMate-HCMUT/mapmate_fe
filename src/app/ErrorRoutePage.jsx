import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ErrorPage } from '../components/ErrorPage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ERROR_KINDS } from '../utils/errorMessages';

// /error — trang lỗi của cả ứng dụng. Trang nào gặp lỗi nặng thì chuyển sang đây kèm { kind, from };
// "Thử lại" quay về đúng trang đó. Lỗi do mất mạng => có mạng lại là tự quay về. Vào thẳng /error (không có kind) => lỗi chung.
export const ErrorRoutePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isOffline } = useNetworkStatus();
  const kind = state?.kind ?? ERROR_KINDS.SERVER;
  const from = state?.from ?? '/';

  useEffect(() => {
    if (kind === ERROR_KINDS.OFFLINE && !isOffline) navigate(from, { replace: true });
  }, [kind, isOffline, from, navigate]);

  return <ErrorPage kind={kind} onRetry={() => navigate(from, { replace: true })} />;
};
