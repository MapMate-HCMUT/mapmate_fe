import { useCallback, useEffect, useState } from 'react';
import { useErrorRedirect } from './useErrorRedirect';

// Gọi 1 hàm async khi `key` đổi; trả về data/error/isLoading/reload. Bỏ qua kết quả cũ nếu key đã đổi.
// `pageLevel` = dữ liệu chính của trang: mất mạng / máy chủ lỗi => sang trang lỗi (widget phụ thì báo lỗi tại chỗ).
export const useAsyncData = (fetcher, key, { pageLevel = false } = {}) => {
  const [state, setState] = useState({ data: null, error: null, isLoading: true });
  const [reloadCount, setReloadCount] = useState(0);
  const redirectOnError = useErrorRedirect();

  useEffect(() => {
    let isActive = true;
    fetcher()
      .then((data) => isActive && setState({ data, error: null, isLoading: false }))
      .catch((error) => {
        if (!isActive || (pageLevel && redirectOnError(error))) return;
        setState((prev) => ({ data: prev.data, error, isLoading: false }));
      });
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ gọi lại khi key/reload đổi
  }, [key, reloadCount]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setReloadCount((count) => count + 1);
  }, []);

  return { ...state, reload };
};
