import { useCallback, useEffect, useState } from 'react';

// Gọi 1 hàm async khi `key` đổi; trả về data/error/isLoading/reload. Bỏ qua kết quả cũ nếu key đã đổi.
export const useAsyncData = (fetcher, key) => {
  const [state, setState] = useState({ data: null, error: null, isLoading: true });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    fetcher()
      .then((data) => isActive && setState({ data, error: null, isLoading: false }))
      .catch((error) => isActive && setState((prev) => ({ data: prev.data, error, isLoading: false })));
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
