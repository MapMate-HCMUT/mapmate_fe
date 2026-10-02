import { useCallback, useEffect, useState } from 'react';
import { getXpHistoryApi } from '../api/gamificationApi';
import { XP_HISTORY_PAGE_SIZE } from '../utils/xpActions';

const fetchPage = (before) => getXpHistoryApi({ limit: XP_HISTORY_PAGE_SIZE, before: before ?? undefined });

// Lịch sử XP phân trang kiểu cursor: "Xem thêm" lấy tiếp các dòng cũ hơn.
export const useXpHistory = (refreshKey) => {
  const [state, setState] = useState({ items: [], cursor: null, isLoading: true, error: null });

  // Trang đầu: tải lại mỗi khi refreshKey đổi.
  useEffect(() => {
    let isActive = true;
    fetchPage(null)
      .then((page) => isActive && setState({ items: page.items, cursor: page.next_cursor, isLoading: false, error: null }))
      .catch((error) => isActive && setState((prev) => ({ ...prev, isLoading: false, error })));
    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const loadMore = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const page = await fetchPage(state.cursor);
      setState((prev) => ({ items: [...prev.items, ...page.items], cursor: page.next_cursor, isLoading: false, error: null }));
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [state.cursor]);

  return { items: state.items, hasMore: Boolean(state.cursor), isLoading: state.isLoading, error: state.error, loadMore };
};
