import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isPageLevelError } from '../utils/errorMessages';

export const ERROR_ROUTE = '/error';

// Lỗi làm cả trang không dùng được (mất mạng, máy chủ không phản hồi, bản đồ không tải) => sang trang lỗi riêng,
// nút "Thử lại" ở đó đưa về đúng trang đang xem. Trả về true nếu đã chuyển trang (bên gọi khỏi hiện lỗi tại chỗ).
export const useErrorRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(
    (error, { force = false } = {}) => {
      if (!force && !isPageLevelError(error)) return false;
      navigate(ERROR_ROUTE, { state: { kind: error.kind, from: location.pathname + location.search } });
      return true;
    },
    [navigate, location.pathname, location.search],
  );
};
