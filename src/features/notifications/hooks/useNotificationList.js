import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getNotificationsApi, markAllNotificationsReadApi, markNotificationReadApi } from '../api/notificationsApi';
import { useNotificationStore } from '../stores/notificationStore';

/**
 * Danh sách thông báo có phân trang. `enabled = false` thì chưa tải (VD panel chuông chưa mở).
 * Bấm 1 thông báo => đánh dấu đã đọc + đi tới link của nó.
 */
export const useNotificationList = ({ pageSize, enabled = true, onNavigate }) => {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], cursor: null, isLoading: true, error: null });

  const applyPage = useCallback(
    (page, append) => {
      setUnreadCount(page.unread_count);
      setState((prev) => ({
        items: append ? [...prev.items, ...page.items] : page.items, cursor: page.next_cursor, isLoading: false, error: null,
      }));
    },
    [setUnreadCount],
  );

  useEffect(() => {
    if (!enabled) return undefined;
    let isActive = true;
    getNotificationsApi({ limit: pageSize })
      .then((page) => isActive && applyPage(page, false))
      .catch((error) => isActive && setState((prev) => ({ ...prev, isLoading: false, error })));
    return () => {
      isActive = false;
    };
  }, [enabled, pageSize, applyPage]);

  const loadMore = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      applyPage(await getNotificationsApi({ limit: pageSize, before: state.cursor }), true);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  };

  const markLocallyRead = (predicate) =>
    setState((prev) => ({ ...prev, items: prev.items.map((item) => (predicate(item) ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item)) }));

  const openNotification = async (item) => {
    if (!item.read_at) {
      markLocallyRead((candidate) => candidate.id === item.id);
      markNotificationReadApi(item.id).then((data) => setUnreadCount(data.unread_count)).catch(() => {});
    }
    if (item.link) {
      onNavigate?.();
      navigate(item.link);
    }
  };

  const markAllRead = async () => {
    markLocallyRead(() => true);
    setUnreadCount(0);
    await markAllNotificationsReadApi().catch(() => {});
  };

  return { ...state, hasMore: Boolean(state.cursor), loadMore, openNotification, markAllRead };
};
