import { apiClient } from '../../../lib/apiClient';

// ── Bạn bè ──
export const getFriendsApi = () => apiClient.get('/friends');
export const getFriendRequestsApi = () => apiClient.get('/friends/requests');
export const getFriendSuggestionsApi = () => apiClient.get('/friends/suggestions');
export const searchUsersApi = (q) => apiClient.get('/users/search', { params: { q } });
export const sendFriendRequestApi = (userId) => apiClient.post('/friends/requests', { user_id: userId });
export const acceptFriendRequestApi = (requestId) => apiClient.post(`/friends/requests/${requestId}/accept`);
export const removeFriendRequestApi = (requestId) => apiClient.delete(`/friends/requests/${requestId}`);
export const unfriendApi = (userId) => apiClient.delete(`/friends/${userId}`);

// ── Bài viết ──
export const getFeedApi = (params) => apiClient.get('/posts', { params });
export const getPostApi = (postId) => apiClient.get(`/posts/${postId}`);
export const getTrendingTagsApi = () => apiClient.get('/posts/trending-tags');
export const createPostApi = (payload) => apiClient.post('/posts', payload);
export const deletePostApi = (postId) => apiClient.delete(`/posts/${postId}`);
export const likePostApi = (postId) => apiClient.post(`/posts/${postId}/like`);
export const unlikePostApi = (postId) => apiClient.delete(`/posts/${postId}/like`);
export const repostApi = (postId, content = '') => apiClient.post(`/posts/${postId}/repost`, { content });
export const undoRepostApi = (postId) => apiClient.delete(`/posts/${postId}/repost`);
export const sharePostApi = (postId, friendIds, message) => apiClient.post(`/posts/${postId}/share`, { friend_ids: friendIds, message });

// ── Ghim địa điểm ──
export const getMyPinsApi = (status) => apiClient.get('/pins', { params: { status } });
export const getUserPinsApi = (userId) => apiClient.get(`/users/${userId}/pins`);
export const setPinApi = (placeId, payload) => apiClient.put(`/pins/${placeId}`, payload);
export const removePinApi = (placeId) => apiClient.delete(`/pins/${placeId}`);

// Tìm địa điểm theo tên (dùng khi chọn địa điểm để đăng bài)
export const searchPlacesByNameApi = (q) => apiClient.get('/places/nearby', { params: { q, radius_km: 20, limit: 6, sort: 'popular' } });

// ── Ảnh / video đính kèm bài viết (Cloudinary) ──
export const getUploadConfigApi = () => apiClient.get('/uploads/config');
export const getUploadSignatureApi = (resourceType) => apiClient.post('/uploads/signature', { resource_type: resourceType });
export const getPlaceApi = (placeId) => apiClient.get(`/places/${placeId}`);
