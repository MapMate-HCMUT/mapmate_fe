import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useCloneItinerary } from '../../itinerary';
import { getFeedApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';
import { patchPost } from '../utils/patchPost';
import { FEED_PAGE_SIZE } from '../utils/socialConfig';
import { usePostActions } from './usePostActions';
import { useShareToFriends } from './useShareToFriends';

const EMPTY = { items: [], cursor: null, isLoading: true, error: null };

/**
 * Danh sách bài viết theo bộ lọc bất kỳ (bài của 1 người, đánh giá của 1 địa điểm...) — phân trang "Xem thêm",
 * tự tải lại khi có bài mới (feedVersion), kèm thích / đăng lại / xoá / gửi bạn bè như bảng tin.
 * `params` = tham số GET /api/posts (scope, author_id, place_id).
 */
export const usePostList = (params, { enabled = true } = {}) => {
  const feedVersion = useSocialStore((state) => state.feedVersion);
  const navigate = useNavigate();
  const [state, setState] = useState(EMPTY);
  const [reloadCount, setReloadCount] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    if (!enabled) return undefined;
    let isActive = true;
    getFeedApi({ ...JSON.parse(key), limit: FEED_PAGE_SIZE })
      .then((data) => isActive && setState({ items: data.items, cursor: data.next_cursor, isLoading: false, error: null }))
      .catch((error) => isActive && setState({ ...EMPTY, isLoading: false, error }));
    return () => {
      isActive = false;
    };
  }, [key, enabled, feedVersion, reloadCount]);

  const loadMore = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getFeedApi({ ...params, limit: FEED_PAGE_SIZE, before: state.cursor });
      setState((prev) => ({ items: [...prev.items, ...data.items], cursor: data.next_cursor, isLoading: false, error: null }));
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  };

  const updatePost = useCallback((targetId, change) => setState((prev) => ({ ...prev, items: prev.items.map((post) => patchPost(post, targetId, change)) })), []);
  const removePosts = useCallback((shouldRemove) => setState((prev) => ({ ...prev, items: prev.items.filter((post) => !shouldRemove(post)) })), []);
  const prependPost = useCallback((post) => setState((prev) => ({ ...prev, items: [post, ...prev.items] })), []);

  const list = {
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: Boolean(state.cursor),
    loadMore,
    reload: () => {
      setState(EMPTY);
      setReloadCount((count) => count + 1);
    },
  };
  return {
    list,
    actions: usePostActions({ updatePost, removePosts, prependPost }),
    share: useShareToFriends(),
    clone: useCloneItinerary(),
    openTag: (tag) => navigate(`/explore?tab=feed&tag=${encodeURIComponent(tag)}`), // bấm hashtag => xem trên bảng tin
  };
};
