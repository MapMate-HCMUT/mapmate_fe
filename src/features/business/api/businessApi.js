import { apiClient } from '../../../lib/apiClient';

// Tài khoản doanh nghiệp — backend: src/routes/business.routes.js
export const getBusinessTiersApi = () => apiClient.get('/businesses/tiers');
export const getMyBusinessApi = () => apiClient.get('/businesses/me');
export const registerBusinessApi = (payload) => apiClient.post('/businesses', payload);
export const updateMyBusinessApi = (changes) => apiClient.patch('/businesses/me', changes);
export const changeTierApi = (tier) => apiClient.patch('/businesses/me/tier', { tier });
export const getBusinessStatsApi = (days) => apiClient.get('/businesses/me/stats', { params: { days } });
export const addBusinessPlaceApi = (place) => apiClient.post('/businesses/me/places', place);
export const updateBusinessPlaceApi = (placeId, changes) => apiClient.patch(`/businesses/me/places/${placeId}`, changes);
export const removeBusinessPlaceApi = (placeId) => apiClient.delete(`/businesses/me/places/${placeId}`);
export const findDuplicatePlacesApi = ({ lat, lng, name }) => apiClient.get('/businesses/duplicates', { params: { lat, lng, name } });
// Ảnh / video cửa hàng: tính theo dung lượng của gói (không theo lượt mỗi ngày như bài viết)
export const getBusinessUploadSignatureApi = (resourceType) => apiClient.post('/uploads/signature', { resource_type: resourceType, purpose: 'business' });

// Công khai
export const getFeaturedPlacesApi = ({ lat, lng, limit }) => apiClient.get('/businesses/featured', { params: { lat, lng, limit } });
// Người dùng mở thẻ / bấm chỉ đường tới cửa hàng doanh nghiệp — thống kê cho chủ quán, lỗi thì bỏ qua
export const trackPlaceEventApi = (placeId, type) => apiClient.post(`/businesses/places/${placeId}/events`, { type }).catch(() => null);

// Khuyến mãi & sự kiện săn voucher
export const getPromotionsApi = () => apiClient.get('/businesses/me/promotions');
export const createPromotionApi = (promotion) => apiClient.post('/businesses/me/promotions', promotion);
export const updatePromotionApi = (promotionId, changes) => apiClient.patch(`/businesses/me/promotions/${promotionId}`, changes);
export const endPromotionApi = (promotionId) => apiClient.delete(`/businesses/me/promotions/${promotionId}`);
export const notifyPromotionApi = (promotionId) => apiClient.post(`/businesses/me/promotions/${promotionId}/notify`);
export const redeemVoucherApi = (code) => apiClient.post('/businesses/me/vouchers/redeem', { code });

// Đánh giá của khách
export const getBusinessReviewsApi = (params) => apiClient.get('/businesses/me/reviews', { params });
export const replyReviewApi = (postId, text) => apiClient.put(`/businesses/me/reviews/${postId}/reply`, { text });
