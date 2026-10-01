import { apiClient } from '../../../lib/apiClient';

// GET /api/users/me -> { profile, stats, achievements }
export const getMyProfileApi = () => apiClient.get('/users/me');

// GET /api/users/:id -> hồ sơ công khai (không có email)
export const getPublicProfileApi = (userId) => apiClient.get(`/users/${userId}`);

// PATCH /api/users/me -> { profile }
export const updateMyProfileApi = (changes) => apiClient.patch('/users/me', changes);

// PATCH /api/users/me/password
export const changePasswordApi = ({ currentPassword, newPassword }) =>
  apiClient.patch('/users/me/password', { current_password: currentPassword, new_password: newPassword });

// GET /api/users/me/xp-history?limit=&before= -> { items, next_cursor }
export const getXpHistoryApi = ({ limit, before }) => apiClient.get('/users/me/xp-history', { params: { limit, before } });

// GET /api/leaderboard?period=&limit= -> { period, period_start, rankings, me }
export const getLeaderboardApi = ({ period, limit }) => apiClient.get('/leaderboard', { params: { period, limit } });

// PUT /api/users/me/avatar { image: dataURL } -> { profile }
export const uploadAvatarApi = (imageDataUrl) => apiClient.put('/users/me/avatar', { image: imageDataUrl });

// DELETE /api/users/me/avatar -> { profile }
export const deleteAvatarApi = () => apiClient.delete('/users/me/avatar');

// GET /api/users/me/area-from-location?lat=&lng= -> { street, district, city, country } (không số nhà)
export const getAreaFromLocationApi = ({ lat, lng }) => apiClient.get('/users/me/area-from-location', { params: { lat, lng } });
