import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import { useErrorRedirect } from '../../../hooks/useErrorRedirect';
import { getFeedApi, getPostApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';
import { FEED_PAGE_SIZE, FEED_SCOPES } from '../utils/socialConfig';

const EMPTY = { items: [], cursor: null, isLoading: true, error: null };

// Áp `change` lên bài có id = targetId, dù nó đứng riêng hay nằm trong 1 bài đăng lại (original).
const patchPost = (post, targetId, change) => {
  if (!post) return post;
  if (post.id === targetId) return change(post);
  return post.original?.id === targetId ? { ...post, original: change(post.original) } : post;
};

/**
 * Bảng tin: phạm vi (cộng đồng / bạn bè / của tôi), lọc theo hashtag (?tag= trên URL), phân trang cursor,
 * và bài viết được chia sẻ qua link (?post=).
 */
export const useFeed = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const feedVersion = useSocialStore((state) => state.feedVersion);
  const [scope, setScope] = useState('public');
  const [state, setState] = useState(EMPTY);
  const [reloadCount, setReloadCount] = useState(0);
  const redirectOnError = useErrorRedirect();
  const [shared, setShared] = useState({ forId: null, post: null, error: null });

  const tag = searchParams.get('tag') ?? '';
  const sharedPostId = searchParams.get('post');
  const needsLogin = !isAuthenticated && FEED_SCOPES.find((item) => item.value === scope).requiresLogin;

  useEffect(() => {
    if (needsLogin) return undefined;
    let isActive = true;
    getFeedApi({ scope, tag: tag || undefined, limit: FEED_PAGE_SIZE })
      .then((data) => isActive && setState({ items: data.items, cursor: data.next_cursor, isLoading: false, error: null }))
      .catch((error) => isActive && !redirectOnError(error) && setState({ ...EMPTY, isLoading: false, error }));
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirectOnError chỉ dùng khi lỗi
  }, [scope, tag, needsLogin, feedVersion, reloadCount]);
  const reload = () => {
    setState(EMPTY);
    setReloadCount((count) => count + 1);
  };

  useEffect(() => {
    if (!sharedPostId) return undefined;
    let isActive = true;
    getPostApi(sharedPostId)
      .then((post) => isActive && setShared({ forId: sharedPostId, post, error: null }))
      .catch((error) => isActive && setShared({ forId: sharedPostId, post: null, error }));
    return () => {
      isActive = false;
    };
  }, [sharedPostId, isAuthenticated]);

  const loadMore = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getFeedApi({ scope, tag: tag || undefined, limit: FEED_PAGE_SIZE, before: state.cursor });
      setState((prev) => ({ items: [...prev.items, ...data.items], cursor: data.next_cursor, isLoading: false, error: null }));
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return {
    reload,
    scope,
    changeScope: (nextScope) => {
      setState(EMPTY);
      setScope(nextScope);
    },
    tag,
    setTag: (nextTag) => {
      setState(EMPTY);
      setParam('tag', nextTag);
    },
    needsLogin,
    items: state.items,
    hasMore: Boolean(state.cursor),
    isLoading: state.isLoading && !needsLogin,
    error: state.error,
    loadMore,
    sharedPost: sharedPostId && shared.forId === sharedPostId ? shared : null,
    dismissSharedPost: () => setParam('post', null),
    // Dùng bởi usePostActions để cập nhật giao diện ngay
    updatePost: (targetId, change) => {
      setState((prev) => ({ ...prev, items: prev.items.map((post) => patchPost(post, targetId, change)) }));
      setShared((prev) => ({ ...prev, post: patchPost(prev.post, targetId, change) }));
    },
    removePosts: (shouldRemove) => setState((prev) => ({ ...prev, items: prev.items.filter((post) => !shouldRemove(post)) })),
    prependPost: (post) => setState((prev) => ({ ...prev, items: [post, ...prev.items] })),
  };
};
