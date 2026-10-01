import { apiClient } from '../../../lib/apiClient';

// GET /api/notifications?limit=&before= -> { items, next_cursor, unread_count }
export const getNotificationsApi = ({ limit, before }) => apiClient.get('/notifications', { params: { limit, before } });

// GET /api/notifications/unread-count -> { unread_count }
export const getUnreadCountApi = () => apiClient.get('/notifications/unread-count');

// PATCH /api/notifications/:id/read -> { unread_count }
export const markNotificationReadApi = (id) => apiClient.patch(`/notifications/${id}/read`);

// PATCH /api/notifications/read-all
export const markAllNotificationsReadApi = () => apiClient.patch('/notifications/read-all');
