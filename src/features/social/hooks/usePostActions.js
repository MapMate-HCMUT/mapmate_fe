import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { deletePostApi, likePostApi, repostApi, undoRepostApi, unlikePostApi } from '../api/socialApi';

// Thích / đăng lại / xoá. Giao diện đổi ngay (optimistic), lỗi thì hoàn tác.
// Với bài đăng lại, mọi thao tác áp lên BÀI GỐC (giống các mạng xã hội khác).
export const usePostActions = ({ updatePost, removePosts, prependPost }) => {
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();

  const toggleLike = requireAuth(async (target) => {
    const liked = !target.liked_by_me;
    const apply = (isLiked) => updatePost(target.id, (post) => ({ ...post, liked_by_me: isLiked, like_count: Math.max(0, post.like_count + (isLiked ? 1 : -1)) }));
    apply(liked);
    try {
      await (liked ? likePostApi(target.id) : unlikePostApi(target.id));
    } catch (error) {
      apply(!liked);
      showToast(error.message, 'danger');
    }
  });

  const toggleRepost = requireAuth(async (target) => {
    const setReposted = (isReposted) => updatePost(target.id, (post) => ({ ...post, reposted_by_me: isReposted, repost_count: Math.max(0, post.repost_count + (isReposted ? 1 : -1)) }));
    try {
      if (target.reposted_by_me) {
        await undoRepostApi(target.id);
        setReposted(false);
        removePosts((post) => post.is_repost && post.is_mine && post.original?.id === target.id);
        showToast('Đã bỏ đăng lại', 'info');
      } else {
        const created = await repostApi(target.id);
        setReposted(true);
        prependPost(created);
        showToast('Đã đăng lại lên tường của bạn');
      }
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });

  const deletePost = requireAuth(async (post) => {
    try {
      await deletePostApi(post.id);
      if (post.is_repost && post.original) {
        updatePost(post.original.id, (original) => ({ ...original, reposted_by_me: false, repost_count: Math.max(0, original.repost_count - 1) }));
      }
      // Xoá bài gốc thì các bài đăng lại của nó cũng biến mất
      removePosts((item) => item.id === post.id || item.original?.id === post.id);
      showToast('Đã xoá bài viết', 'info');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });

  return { toggleLike, toggleRepost, deletePost };
};
