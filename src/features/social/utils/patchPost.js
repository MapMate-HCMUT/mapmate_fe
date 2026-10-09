// Áp `change` lên bài có id = targetId, dù nó đứng riêng hay nằm trong 1 bài đăng lại (original).
export const patchPost = (post, targetId, change) => {
  if (!post) return post;
  if (post.id === targetId) return change(post);
  return post.original?.id === targetId ? { ...post, original: change(post.original) } : post;
};
