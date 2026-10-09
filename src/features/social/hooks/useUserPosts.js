import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useSocialStore } from '../stores/socialStore';
import { usePostList } from './usePostList';

// Bài viết / đánh giá của 1 người (trang cá nhân). Của mình => scope "mine" (thấy cả bài chỉ bạn bè xem).
export const useUserPosts = ({ userId, isMe }) => {
  const requireAuth = useRequireAuth();
  const openComposer = useSocialStore((state) => state.openComposer);
  const view = usePostList(isMe ? { scope: 'mine' } : { author_id: userId }, { enabled: Boolean(userId) || isMe });
  return { view, writeReview: requireAuth(() => openComposer({ type: 'place', visited: true })) };
};
