import { apiClient } from '../../../lib/apiClient';

// Săn voucher — backend: src/routes/voucher.routes.js
export const getVoucherEventsApi = ({ lat, lng }) => apiClient.get('/vouchers/events', { params: { lat, lng } });
// Check-in gửi kèm toạ độ hiện tại; vòng quay: server bốc thăm, trả về trúng / trượt
export const claimVoucherApi = (eventId, location) => apiClient.post(`/vouchers/events/${eventId}/claim`, location ?? {});
export const getMyVouchersApi = () => apiClient.get('/vouchers/me');
